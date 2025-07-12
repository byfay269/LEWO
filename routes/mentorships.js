
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les mentors disponibles
router.get('/mentors', async (req, res) => {
  try {
    const subject = req.query.subject;
    const level = req.query.level;

    let whereClause = `WHERE u.user_type = 'mentor' AND u.is_active = TRUE`;
    let params = [];
    let paramCount = 0;

    if (subject) {
      paramCount++;
      whereClause += ` AND EXISTS (
        SELECT 1 FROM user_subjects us 
        WHERE us.user_id = u.id AND us.subject_id = $${paramCount} AND us.can_teach = TRUE
      )`;
      params.push(subject);
    }

    if (level) {
      paramCount++;
      whereClause += ` AND up.education_level = $${paramCount}`;
      params.push(level);
    }

    const result = await query(
      `SELECT u.id, up.first_name, up.last_name, up.bio, up.education_level,
              up.institution, up.location, up.profile_picture_url,
              COALESCE(
                ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
                ARRAY[]::text[]
              ) as subjects,
              COUNT(DISTINCT m.id) as total_mentorships,
              AVG(m.mentor_rating) as average_rating
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_subjects us ON u.id = us.user_id AND us.can_teach = TRUE
       LEFT JOIN subjects s ON us.subject_id = s.id
       LEFT JOIN mentorships m ON u.id = m.mentor_id
       ${whereClause}
       GROUP BY u.id, up.first_name, up.last_name, up.bio, up.education_level,
                up.institution, up.location, up.profile_picture_url
       ORDER BY average_rating DESC NULLS LAST, total_mentorships DESC`,
      params
    );

    res.json({ mentors: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des mentors:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Demander un mentorat
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { mentorId, subjectId, message } = req.body;

    if (!mentorId || !subjectId) {
      return res.status(400).json({ message: 'Mentor et matière requis' });
    }

    // Vérifier qu'une demande n'existe pas déjà
    const existingRequest = await query(
      `SELECT id FROM mentorship_requests 
       WHERE requester_id = $1 AND target_id = $2 AND subject_id = $3 AND status = 'pending'`,
      [req.user.id, mentorId, subjectId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: 'Une demande est déjà en cours pour ce mentor' });
    }

    const result = await query(
      `INSERT INTO mentorship_requests (requester_id, target_id, subject_id, message, request_type)
       VALUES ($1, $2, $3, $4, 'mentor_request')
       RETURNING id, created_at`,
      [req.user.id, mentorId, subjectId, message]
    );

    res.status(201).json({
      message: 'Demande de mentorat envoyée avec succès',
      request: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur lors de la demande de mentorat:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les mentorships de l'utilisateur
router.get('/my-mentorships', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT m.id, m.status, m.start_date, m.goals, m.progress_notes,
              m.mentor_rating, m.mentee_rating, m.created_at,
              s.name as subject_name,
              CASE 
                WHEN m.mentor_id = $1 THEN up_mentee.first_name || ' ' || up_mentee.last_name
                ELSE up_mentor.first_name || ' ' || up_mentor.last_name
              END as partner_name,
              CASE 
                WHEN m.mentor_id = $1 THEN 'mentor'
                ELSE 'mentee'
              END as my_role
       FROM mentorships m
       LEFT JOIN subjects s ON m.subject_id = s.id
       LEFT JOIN users u_mentor ON m.mentor_id = u_mentor.id
       LEFT JOIN user_profiles up_mentor ON u_mentor.id = up_mentor.user_id
       LEFT JOIN users u_mentee ON m.mentee_id = u_mentee.id
       LEFT JOIN user_profiles up_mentee ON u_mentee.id = up_mentee.user_id
       WHERE m.mentor_id = $1 OR m.mentee_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json({ mentorships: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des mentorships:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Répondre à une demande de mentorat
router.put('/requests/:id/respond', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { response } = req.body; // 'accepted' ou 'declined'

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({ message: 'Réponse invalide' });
    }

    // Vérifier que la demande appartient à l'utilisateur
    const requestResult = await query(
      `SELECT * FROM mentorship_requests 
       WHERE id = $1 AND target_id = $2 AND status = 'pending'`,
      [requestId, req.user.id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    const request = requestResult.rows[0];

    // Mettre à jour le statut de la demande
    await query(
      `UPDATE mentorship_requests SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [response, requestId]
    );

    // Si acceptée, créer la relation de mentorat
    if (response === 'accepted') {
      await query(
        `INSERT INTO mentorships (mentor_id, mentee_id, subject_id, status, start_date, goals)
         VALUES ($1, $2, $3, 'active', CURRENT_DATE, $4)`,
        [req.user.id, request.requester_id, request.subject_id, request.message]
      );
    }

    res.json({
      message: response === 'accepted' 
        ? 'Demande acceptée, mentorat créé avec succès' 
        : 'Demande déclinée'
    });

  } catch (error) {
    console.error('Erreur lors de la réponse à la demande:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer le profil utilisateur connecté
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.email, u.user_type,
        p.first_name, p.last_name, p.birth_date, p.gender, p.phone,
        p.location, p.education_level, p.institution, p.bio, p.profile_picture_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, birthDate, gender, phone, location, institution, bio } = req.body;

    await query(`
      UPDATE user_profiles 
      SET first_name = ?, last_name = ?, birth_date = ?, gender = ?, 
          phone = ?, location = ?, institution = ?, bio = ?
      WHERE user_id = ?
    `, [firstName, lastName, birthDate, gender, phone, location, institution, bio, req.user.id]);

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer la liste des mentors
router.get('/mentors', async (req, res) => {
  try {
    const { subject, level } = req.query;

    let whereClause = 'WHERE u.user_type = "mentor" AND u.is_active = TRUE';
    const params = [];

    if (subject) {
      whereClause += ' AND us.subject_id = ? AND us.can_teach = TRUE';
      params.push(subject);
    }
    if (level) {
      whereClause += ' AND p.education_level = ?';
      params.push(level);
    }

    const result = await query(`
      SELECT DISTINCT
        u.id, 
        CONCAT(p.first_name, ' ', p.last_name) AS name,
        p.education_level, p.institution, p.bio, p.location,
        COUNT(DISTINCT m.id) AS mentorship_count
      FROM users u
      JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_subjects us ON u.id = us.user_id
      LEFT JOIN mentorships m ON u.id = m.mentor_id AND m.status = 'active'
      ${whereClause}
      GROUP BY u.id, p.first_name, p.last_name, p.education_level, p.institution, p.bio, p.location
      ORDER BY mentorship_count DESC, p.first_name
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des mentors:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
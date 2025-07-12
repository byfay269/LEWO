
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.user_type, u.created_at,
              p.first_name, p.last_name, p.birth_date, p.gender,
              p.phone, p.location, p.education_level, p.institution,
              p.bio, p.profile_picture_url, p.preferences,
              COUNT(DISTINCT posts.id) as posts_count,
              COUNT(DISTINCT comments.id) as comments_count,
              COUNT(DISTINCT CASE WHEN m1.mentor_id = u.id THEN m1.id END) as mentorships_as_mentor,
              COUNT(DISTINCT CASE WHEN m2.mentee_id = u.id THEN m2.id END) as mentorships_as_mentee
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       LEFT JOIN posts ON u.id = posts.author_id AND posts.is_deleted = FALSE
       LEFT JOIN comments ON u.id = comments.author_id AND comments.is_deleted = FALSE
       LEFT JOIN mentorships m1 ON u.id = m1.mentor_id
       LEFT JOIN mentorships m2 ON u.id = m2.mentee_id
       WHERE u.id = $1
       GROUP BY u.id, u.email, u.user_type, u.created_at,
                p.first_name, p.last_name, p.birth_date, p.gender,
                p.phone, p.location, p.education_level, p.institution,
                p.bio, p.profile_picture_url, p.preferences`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    // Récupérer les intérêts/matières de l'utilisateur
    const interestsResult = await query(
      `SELECT us.subject_id, s.name, us.competency_level, us.can_teach, us.wants_to_learn
       FROM user_subjects us
       LEFT JOIN subjects s ON us.subject_id = s.id
       WHERE us.user_id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    user.interests = interestsResult.rows;

    res.json({ user });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName, lastName, birthDate, gender, phone, location,
      educationLevel, institution, bio, interests
    } = req.body;

    // Mettre à jour le profil dans une transaction
    await query('BEGIN');

    try {
      // Mettre à jour les informations de base
      await query(
        `UPDATE user_profiles 
         SET first_name = $1, last_name = $2, birth_date = $3, gender = $4,
             phone = $5, location = $6, education_level = $7, institution = $8,
             bio = $9, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $10`,
        [firstName, lastName, birthDate, gender, phone, location,
         educationLevel, institution, bio, req.user.id]
      );

      // Supprimer les anciens intérêts
      await query('DELETE FROM user_subjects WHERE user_id = $1', [req.user.id]);

      // Ajouter les nouveaux intérêts
      if (interests && interests.length > 0) {
        for (const interest of interests) {
          await query(
            `INSERT INTO user_subjects (user_id, subject_id, competency_level, can_teach, wants_to_learn)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, interest.subjectId, interest.level, interest.canTeach, interest.wantsToLearn]
          );
        }
      }

      await query('COMMIT');

      res.json({ message: 'Profil mis à jour avec succès' });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer un profil public
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await query(
      `SELECT u.user_type, u.created_at,
              p.first_name, p.last_name, p.education_level, p.institution,
              p.location, p.bio, p.profile_picture_url,
              COUNT(DISTINCT posts.id) as posts_count,
              COUNT(DISTINCT comments.id) as comments_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       LEFT JOIN posts ON u.id = posts.author_id AND posts.is_deleted = FALSE
       LEFT JOIN comments ON u.id = comments.author_id AND comments.is_deleted = FALSE
       WHERE u.id = $1 AND u.is_active = TRUE
       GROUP BY u.user_type, u.created_at,
                p.first_name, p.last_name, p.education_level, p.institution,
                p.location, p.bio, p.profile_picture_url`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil public:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

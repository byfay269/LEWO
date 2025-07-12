
const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authenticateToken, requireAdmin);

// Tableau de bord - statistiques générales
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      query('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as total FROM posts WHERE is_deleted = FALSE'),
      query('SELECT COUNT(*) as total FROM mentorships WHERE status = \'active\''),
      query('SELECT COUNT(*) as total FROM post_reports WHERE status = \'pending\''),
      query(`SELECT COUNT(*) as total FROM users 
             WHERE is_active = TRUE AND last_login >= CURRENT_DATE - INTERVAL '30 days'`),
      query(`SELECT COUNT(*) as total FROM users 
             WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'`)
    ]);

    const [totalUsers, totalPosts, activeMentorships, pendingReports, activeUsers, newUsers] = stats;

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].total),
      totalPosts: parseInt(totalPosts.rows[0].total),
      activeMentorships: parseInt(activeMentorships.rows[0].total),
      pendingReports: parseInt(pendingReports.rows[0].total),
      activeUsers: parseInt(activeUsers.rows[0].total),
      newUsers: parseInt(newUsers.rows[0].total)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Gestion des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT u.id, u.email, u.user_type, u.is_active, u.created_at, u.last_login,
              up.first_name, up.last_name, up.education_level, up.institution
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM users');

    res.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Désactiver/Activer un utilisateur
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: result.rows[0].is_active ? 'Utilisateur activé' : 'Utilisateur désactivé',
      is_active: result.rows[0].is_active
    });

  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Gestion des posts
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.id, p.title, p.content, p.post_type, p.education_level,
              p.view_count, p.like_count, p.comment_count, p.created_at,
              p.is_pinned, p.is_locked, p.is_deleted,
              up.first_name || ' ' || up.last_name AS author_name,
              s.name AS subject_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN subjects s ON p.subject_id = s.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ posts: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Supprimer un post
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    await query(
      'UPDATE posts SET is_deleted = TRUE WHERE id = $1',
      [postId]
    );

    res.json({ message: 'Post supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les signalements
router.get('/reports', async (req, res) => {
  try {
    const result = await query(
      `SELECT pr.id, pr.reason, pr.description, pr.status, pr.created_at,
              up_reporter.first_name || ' ' || up_reporter.last_name AS reporter_name,
              p.title as post_title,
              up_author.first_name || ' ' || up_author.last_name AS post_author
       FROM post_reports pr
       LEFT JOIN users u_reporter ON pr.reporter_id = u_reporter.id
       LEFT JOIN user_profiles up_reporter ON u_reporter.id = up_reporter.user_id
       LEFT JOIN posts p ON pr.post_id = p.id
       LEFT JOIN users u_author ON p.author_id = u_author.id
       LEFT JOIN user_profiles up_author ON u_author.id = up_author.user_id
       ORDER BY pr.created_at DESC
       LIMIT 50`
    );

    res.json({ reports: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Traiter un signalement
router.put('/reports/:id/resolve', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { action } = req.body; // 'approve', 'dismiss'

    await query(
      `UPDATE post_reports 
       SET status = $1, moderator_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [action === 'approve' ? 'action_taken' : 'dismissed', req.user.id, reportId]
    );

    res.json({ message: 'Signalement traité avec succès' });

  } catch (error) {
    console.error('Erreur lors du traitement du signalement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les catégories du forum
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM forum_categories WHERE is_active = TRUE ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les posts du forum avec pagination
router.get('/posts', async (req, res) => {
  try {
    const { category, subject, level, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.is_deleted = FALSE';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND p.category_id = ?`;
      params.push(category);
    }
    if (subject) {
      whereClause += ` AND p.subject_id = ?`;
      params.push(subject);
    }
    if (level) {
      whereClause += ` AND p.education_level = ?`;
      params.push(level);
    }
    if (search) {
      whereClause += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const result = await query(`
      SELECT 
        p.id, p.title, p.content, p.post_type, p.education_level,
        p.like_count, p.comment_count, p.view_count, p.created_at, p.is_pinned,
        CONCAT(up.first_name, ' ', up.last_name) AS author_name,
        COALESCE(s.name, 'Général') AS subject_name,
        COALESCE(fc.name, 'Non catégorisé') AS category_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN forum_categories fc ON p.category_id = fc.id
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Créer un nouveau post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, categoryId, subjectId, postType, educationLevel, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }

    const result = await query(`
      INSERT INTO posts (author_id, category_id, subject_id, title, content, post_type, education_level, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, categoryId, subjectId, title, content, postType || 'discussion', educationLevel, JSON.stringify(tags || [])]);

    res.status(201).json({ 
      message: 'Post créé avec succès',
      postId: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les commentaires d'un post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await query(`
      SELECT 
        c.id, c.content, c.like_count, c.created_at,
        CONCAT(up.first_name, ' ', up.last_name) AS author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      WHERE c.post_id = ? AND c.is_deleted = FALSE
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Ajouter un commentaire
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Contenu requis' });
    }

    await query(`
      INSERT INTO comments (post_id, author_id, content)
      VALUES (?, ?, ?)
    `, [postId, req.user.id, content]);

    res.status(201).json({ message: 'Commentaire ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
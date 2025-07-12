
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les posts du forum avec pagination
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const subject = req.query.subject;
    const search = req.query.search;

    let whereClause = 'WHERE p.is_deleted = FALSE';
    let params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      whereClause += ` AND p.category_id = $${paramCount}`;
      params.push(category);
    }

    if (subject) {
      paramCount++;
      whereClause += ` AND p.subject_id = $${paramCount}`;
      params.push(subject);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (p.title ILIKE $${paramCount} OR p.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const postsQuery = `
      SELECT p.id, p.title, p.content, p.post_type, p.education_level,
             p.view_count, p.like_count, p.comment_count, p.created_at,
             p.is_pinned, p.tags,
             up.first_name || ' ' || up.last_name AS author_name,
             s.name AS subject_name,
             fc.name AS category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN forum_categories fc ON p.category_id = fc.id
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(postsQuery, params);

    // Compter le total pour la pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, -2));

    res.json({
      posts: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

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

    const result = await query(
      `INSERT INTO posts (author_id, title, content, category_id, subject_id, 
                         post_type, education_level, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, created_at`,
      [req.user.id, title, content, categoryId, subjectId, postType, educationLevel, tags]
    );

    res.status(201).json({
      message: 'Post créé avec succès',
      post: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer un post spécifique avec ses commentaires
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Incrémenter le compteur de vues
    await query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [postId]);

    // Récupérer le post
    const postResult = await query(
      `SELECT p.id, p.title, p.content, p.post_type, p.education_level,
              p.view_count, p.like_count, p.comment_count, p.created_at,
              p.tags,
              up.first_name || ' ' || up.last_name AS author_name,
              s.name AS subject_name,
              fc.name AS category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN subjects s ON p.subject_id = s.id
       LEFT JOIN forum_categories fc ON p.category_id = fc.id
       WHERE p.id = $1 AND p.is_deleted = FALSE`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    // Récupérer les commentaires
    const commentsResult = await query(
      `SELECT c.id, c.content, c.like_count, c.created_at,
              up.first_name || ' ' || up.last_name AS author_name,
              c.parent_comment_id
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE c.post_id = $1 AND c.is_deleted = FALSE
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({
      post: postResult.rows[0],
      comments: commentsResult.rows
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Ajouter un commentaire
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Contenu du commentaire requis' });
    }

    const result = await query(
      `INSERT INTO comments (post_id, author_id, content, parent_comment_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at`,
      [postId, req.user.id, content, parentCommentId]
    );

    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      comment: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les catégories du forum
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, icon, color, sort_order
       FROM forum_categories
       WHERE is_active = TRUE
       ORDER BY sort_order, name`
    );

    res.json({ categories: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les sujets/matières
router.get('/subjects', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, category, description
       FROM subjects
       WHERE is_active = TRUE
       ORDER BY category, name`
    );

    res.json({ subjects: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des sujets:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

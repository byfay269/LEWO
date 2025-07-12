
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les métiers
router.get('/', async (req, res) => {
  try {
    const { category, education, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE c.is_active = TRUE';
    const params = [];

    if (category) {
      whereClause += ' AND c.category = ?';
      params.push(category);
    }
    if (education) {
      whereClause += ' AND c.required_education LIKE ?';
      params.push(`%${education}%`);
    }

    const result = await query(`
      SELECT 
        c.id, c.title, c.category, c.description, c.required_education,
        c.salary_range_min, c.salary_range_max, c.icon_emoji
      FROM careers c
      ${whereClause}
      ORDER BY c.category, c.title
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des métiers:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer un métier spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT * FROM careers WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Métier non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du métier:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer les catégories de métiers
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT category, COUNT(*) as count
       FROM careers
       WHERE is_active = TRUE
       GROUP BY category
       ORDER BY category`
    );

    res.json({ categories: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

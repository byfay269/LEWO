
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les métiers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const category = req.query.category;
    const search = req.query.search;

    let whereClause = 'WHERE is_active = TRUE';
    let params = [];
    let paramCount = 0;

    if (category && category !== 'tous') {
      paramCount++;
      whereClause += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const result = await query(
      `SELECT id, title, category, icon_emoji, description,
              required_education, salary_range_min, salary_range_max,
              currency, skills, sectors, job_prospects
       FROM careers
       ${whereClause}
       ORDER BY category, title`,
      params
    );

    res.json({ careers: result.rows });

  } catch (error) {
    console.error('Erreur lors de la récupération des métiers:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Récupérer un métier spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const careerId = req.params.id;

    const result = await query(
      `SELECT * FROM careers WHERE id = $1 AND is_active = TRUE`,
      [careerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Métier non trouvé' });
    }

    res.json({ career: result.rows[0] });

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


const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rechercher des résultats d'examens
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { exam_type, year, region, student_name, student_number } = req.query;

    if (!exam_type) {
      return res.status(400).json({ message: 'Type d\'examen requis' });
    }

    let whereClause = 'WHERE exam_type = $1';
    let params = [exam_type];
    let paramCount = 1;

    if (year) {
      paramCount++;
      whereClause += ` AND year = $${paramCount}`;
      params.push(parseInt(year));
    }

    if (region) {
      paramCount++;
      whereClause += ` AND region = $${paramCount}`;
      params.push(region);
    }

    if (student_name) {
      paramCount++;
      whereClause += ` AND student_name ILIKE $${paramCount}`;
      params.push(`%${student_name}%`);
    }

    if (student_number) {
      paramCount++;
      whereClause += ` AND student_number ILIKE $${paramCount}`;
      params.push(`%${student_number}%`);
    }

    const result = await query(
      `SELECT student_name, student_number, year, region, 
              serie, establishment, origin_school,
              average_score, final_score, rank_position,
              mention, status, session_type
       FROM exam_results
       ${whereClause}
       ORDER BY 
         CASE WHEN status = 'admitted' THEN 0 ELSE 1 END,
         rank_position NULLS LAST,
         final_score DESC NULLS LAST,
         student_name
       LIMIT 100`,
      params
    );

    // Calculer les statistiques
    const stats = await query(
      `SELECT 
         COUNT(*) as total_candidates,
         COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted_count,
         ROUND(
           COUNT(CASE WHEN status = 'admitted' THEN 1 END) * 100.0 / COUNT(*), 
           2
         ) as success_rate,
         AVG(average_score) as avg_score
       FROM exam_results
       ${whereClause}`,
      params
    );

    res.json({
      results: result.rows,
      statistics: stats.rows[0]
    });

  } catch (error) {
    console.error('Erreur lors de la recherche de résultats:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques par région
router.get('/stats/by-region', authenticateToken, async (req, res) => {
  try {
    const { exam_type, year } = req.query;

    if (!exam_type) {
      return res.status(400).json({ message: 'Type d\'examen requis' });
    }

    let whereClause = 'WHERE exam_type = $1';
    let params = [exam_type];

    if (year) {
      whereClause += ' AND year = $2';
      params.push(parseInt(year));
    }

    const result = await query(
      `SELECT 
         region,
         COUNT(*) as total_candidates,
         COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted_count,
         ROUND(
           COUNT(CASE WHEN status = 'admitted' THEN 1 END) * 100.0 / COUNT(*), 
           2
         ) as success_rate,
         AVG(average_score) as avg_score
       FROM exam_results
       ${whereClause} AND region IS NOT NULL
       GROUP BY region
       ORDER BY success_rate DESC`,
      params
    );

    res.json({ statistics: result.rows });

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

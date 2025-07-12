const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rechercher des résultats d'examens
router.get('/search', async (req, res) => {
  try {
    const { examType, year, studentName, studentNumber, region } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (examType) {
      whereClause += ' AND exam_type = ?';
      params.push(examType);
    }
    if (year) {
      whereClause += ' AND year = ?';
      params.push(year);
    }
    if (studentName) {
      whereClause += ' AND student_name LIKE ?';
      params.push(`%${studentName}%`);
    }
    if (studentNumber) {
      whereClause += ' AND student_number = ?';
      params.push(studentNumber);
    }
    if (region) {
      whereClause += ' AND region = ?';
      params.push(region);
    }

    const result = await query(`
      SELECT 
        exam_type, year, student_name, student_number, region,
        serie, average_score, final_score, mention, status
      FROM exam_results
      ${whereClause}
      ORDER BY year DESC, final_score DESC
      LIMIT 100
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la recherche de résultats:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Statistiques des résultats par année
router.get('/stats/:year', async (req, res) => {
  try {
    const { year } = req.params;

    const result = await query(`
      SELECT 
        exam_type,
        region,
        COUNT(*) as total_candidates,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted_count,
        ROUND(AVG(final_score), 2) as average_score
      FROM exam_results
      WHERE year = ?
      GROUP BY exam_type, region
      ORDER BY exam_type, region
    `, [year]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
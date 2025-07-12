const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les annales avec filtres
router.get('/', async (req, res) => {
  try {
    const { year, examType, subject, level, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE a.is_approved = TRUE';
    const params = [];

    if (year) {
      whereClause += ' AND a.year = ?';
      params.push(year);
    }
    if (examType) {
      whereClause += ' AND a.exam_type = ?';
      params.push(examType);
    }
    if (subject) {
      whereClause += ' AND a.subject_id = ?';
      params.push(subject);
    }
    if (level) {
      whereClause += ' AND a.education_level = ?';
      params.push(level);
    }

    const result = await query(`
      SELECT 
        a.id, a.title, a.description, a.year, a.exam_type, a.serie,
        a.difficulty_level, a.page_count, a.download_count, a.is_with_correction,
        s.name AS subject_name
      FROM annales a
      LEFT JOIN subjects s ON a.subject_id = s.id
      ${whereClause}
      ORDER BY a.year DESC, a.title
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des annales:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Télécharger une annale
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    // Enregistrer le téléchargement
    await query(`
      INSERT INTO annale_downloads (annale_id, user_id, ip_address)
      VALUES (?, ?, ?)
    `, [id, userId, req.ip]);

    res.json({ message: 'Téléchargement enregistré', downloadUrl: `/files/annales/${id}.pdf` });
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Noter une annale
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const annaleId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Note entre 1 et 5 requise' });
    }

    // Vérifier si l'utilisateur a déjà noté cette annale
    const existingRating = await query(
      'SELECT id FROM annale_ratings WHERE annale_id = $1 AND user_id = $2',
      [annaleId, req.user.id]
    );

    if (existingRating.rows.length > 0) {
      // Mettre à jour la note existante
      await query(
        `UPDATE annale_ratings SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
         WHERE annale_id = $3 AND user_id = $4`,
        [rating, comment, annaleId, req.user.id]
      );
    } else {
      // Créer une nouvelle note
      await query(
        `INSERT INTO annale_ratings (annale_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [annaleId, req.user.id, rating, comment]
      );
    }

    res.json({ message: 'Note enregistrée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la notation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
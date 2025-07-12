
const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les annales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const examType = req.query.exam_type;
    const subject = req.query.subject;
    const year = req.query.year;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE a.is_approved = TRUE';
    let params = [];
    let paramCount = 0;

    if (examType) {
      paramCount++;
      whereClause += ` AND a.exam_type = $${paramCount}`;
      params.push(examType);
    }

    if (subject) {
      paramCount++;
      whereClause += ` AND a.subject_id = $${paramCount}`;
      params.push(subject);
    }

    if (year) {
      paramCount++;
      whereClause += ` AND a.year = $${paramCount}`;
      params.push(parseInt(year));
    }

    const result = await query(
      `SELECT a.id, a.title, a.description, a.year, a.exam_type,
              a.serie, a.difficulty_level, a.page_count, a.download_count,
              a.is_with_correction, a.created_at,
              s.name as subject_name,
              AVG(ar.rating) as average_rating,
              COUNT(ar.id) as rating_count
       FROM annales a
       LEFT JOIN subjects s ON a.subject_id = s.id
       LEFT JOIN annale_ratings ar ON a.id = ar.annale_id
       ${whereClause}
       GROUP BY a.id, a.title, a.description, a.year, a.exam_type,
                a.serie, a.difficulty_level, a.page_count, a.download_count,
                a.is_with_correction, a.created_at, s.name
       ORDER BY a.year DESC, a.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Compter le total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM annales a ${whereClause}`,
      params
    );

    res.json({
      annales: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des annales:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Télécharger une annale
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const annaleId = req.params.id;

    // Vérifier que l'annale existe
    const annaleResult = await query(
      'SELECT id, title, file_url FROM annales WHERE id = $1 AND is_approved = TRUE',
      [annaleId]
    );

    if (annaleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Annale non trouvée' });
    }

    // Enregistrer le téléchargement
    await query(
      `INSERT INTO annale_downloads (annale_id, user_id, ip_address)
       VALUES ($1, $2, $3)`,
      [annaleId, req.user.id, req.ip]
    );

    const annale = annaleResult.rows[0];
    res.json({
      message: 'Téléchargement autorisé',
      download_url: annale.file_url,
      title: annale.title
    });

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

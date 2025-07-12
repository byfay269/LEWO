const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/mentorships - Récupérer tous les mentorships
router.get('/', auth, async (req, res) => {
    try {
        const [mentorships] = await db.execute(`
            SELECT m.*, 
                   u1.name as mentor_name, u1.email as mentor_email,
                   u2.name as mentee_name, u2.email as mentee_email
            FROM mentorships m
            JOIN users u1 ON m.mentor_id = u1.id
            JOIN users u2 ON m.mentee_id = u2.id
            WHERE m.mentor_id = ? OR m.mentee_id = ?
            ORDER BY m.created_at DESC
        `, [req.user.id, req.user.id]);

        res.json(mentorships);
    } catch (error) {
        console.error('Erreur lors de la récupération des mentorships:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/mentorships - Créer une demande de mentorship
router.post('/', auth, async (req, res) => {
    try {
        const { mentor_id, subject, message } = req.body;

        if (!mentor_id || !subject) {
            return res.status(400).json({ message: 'Mentor et sujet requis' });
        }

        const [result] = await db.execute(`
            INSERT INTO mentorships (mentor_id, mentee_id, subject, message, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [mentor_id, req.user.id, subject, message]);

        res.status(201).json({ 
            message: 'Demande de mentorship envoyée',
            mentorship_id: result.insertId 
        });
    } catch (error) {
        console.error('Erreur lors de la création du mentorship:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/mentorships/:id/status - Mettre à jour le statut d'un mentorship
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const mentorshipId = req.params.id;

        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const [result] = await db.execute(`
            UPDATE mentorships 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND mentor_id = ?
        `, [status, mentorshipId, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mentorship non trouvé' });
        }

        res.json({ message: 'Statut mis à jour' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtenir tous les mentors disponibles
router.get('/mentors', async (req, res) => {
    try {
        const { subject, level } = req.query;
        let sql = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.bio, u.photo_url,
                   u.education_level, u.institution, u.location,
                   GROUP_CONCAT(s.name) as subjects
            FROM users u
            LEFT JOIN user_subjects us ON u.id = us.user_id
            LEFT JOIN subjects s ON us.subject_id = s.id
            WHERE u.user_type = 'mentor' AND u.status = 'active'
        `;
        const params = [];

        if (subject) {
            sql += ' AND s.id = ?';
            params.push(subject);
        }

        if (level) {
            sql += ' AND u.education_level = ?';
            params.push(level);
        }

        sql += ' GROUP BY u.id ORDER BY u.created_at DESC';

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Créer une demande de mentorat
router.post('/requests', authenticateToken, async (req, res) => {
    try {
        const { mentor_id, subject_id, message, preferred_schedule } = req.body;
        const student_id = req.user.id;

        const sql = `
            INSERT INTO mentorship_requests (student_id, mentor_id, subject_id, message, preferred_schedule)
            VALUES (?, ?, ?, ?, ?)
        `;

        await query(sql, [student_id, mentor_id, subject_id, message, preferred_schedule]);
        res.status(201).json({ message: 'Demande de mentorat envoyée' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Obtenir les demandes de mentorat (pour un mentor)
router.get('/requests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.user_type;

        let sql, params;

        if (userType === 'mentor') {
            sql = `
                SELECT mr.*, u.first_name, u.last_name, u.email, s.name as subject_name
                FROM mentorship_requests mr
                JOIN users u ON mr.student_id = u.id
                LEFT JOIN subjects s ON mr.subject_id = s.id
                WHERE mr.mentor_id = ?
                ORDER BY mr.created_at DESC
            `;
            params = [userId];
        } else {
            sql = `
                SELECT mr.*, u.first_name, u.last_name, u.email, s.name as subject_name
                FROM mentorship_requests mr
                JOIN users u ON mr.mentor_id = u.id
                LEFT JOIN subjects s ON mr.subject_id = s.id
                WHERE mr.student_id = ?
                ORDER BY mr.created_at DESC
            `;
            params = [userId];
        }

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Accepter/refuser une demande de mentorat
router.put('/requests/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const mentorId = req.user.id;

        const sql = `
            UPDATE mentorship_requests 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND mentor_id = ?
        `;

        await query(sql, [status, id, mentorId]);
        res.json({ message: 'Statut mis à jour' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;

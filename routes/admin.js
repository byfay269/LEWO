const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Middleware pour vérifier les droits admin
const adminAuth = async (req, res, next) => {
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
};

// GET /api/admin/dashboard - Statistiques du tableau de bord
router.get('/dashboard', auth, adminAuth, async (req, res) => {
    try {
        const [userStats] = await db.execute('SELECT COUNT(*) as total_users FROM users');
        const [postStats] = await db.execute('SELECT COUNT(*) as total_posts FROM forum_posts');
        const [mentorshipStats] = await db.execute('SELECT COUNT(*) as total_mentorships FROM mentorships');

        const [recentUsers] = await db.execute(`
            SELECT id, name, email, type, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        res.json({
            stats: {
                users: userStats[0].total_users,
                posts: postStats[0].total_posts,
                mentorships: mentorshipStats[0].total_mentorships
            },
            recent_users: recentUsers
        });
    } catch (error) {
        console.error('Erreur dashboard admin:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/admin/users - Gestion des utilisateurs
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, name, email, type, education_level, institution, 
                   created_at, updated_at
            FROM users 
            ORDER BY created_at DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/admin/posts - Gestion des posts
router.get('/posts', auth, adminAuth, async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.*, u.name as author_name, u.email as author_email
            FROM forum_posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);

        res.json(posts);
    } catch (error) {
        console.error('Erreur récupération posts:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DELETE /api/admin/posts/:id - Supprimer un post
router.delete('/posts/:id', auth, adminAuth, async (req, res) => {
    try {
        const postId = req.params.id;

        const [result] = await db.execute('DELETE FROM forum_posts WHERE id = ?', [postId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post non trouvé' });
        }

        res.json({ message: 'Post supprimé' });
    } catch (error) {
        console.error('Erreur suppression post:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
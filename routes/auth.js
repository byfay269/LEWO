
const express = require('express');
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, educationLevel } = req.body;

    // Validation des données
    if (!firstName || !lastName || !email || !password || !userType || !educationLevel) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur avec transaction
    const result = await transaction(async (client) => {
      // Insérer l'utilisateur
      const userResult = await client.execute(
        `INSERT INTO users (email, password_hash, user_type, is_verified)
         VALUES (?, ?, ?, true)`,
        [email, hashedPassword, userType]
      );
      
      const userId = userResult.insertId;
      const userSelectResult = await client.execute(
        'SELECT id, email, user_type FROM users WHERE id = ?',
        [userId]
      );

      // Créer le profil
      await client.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, education_level)
         VALUES (?, ?, ?, ?)`,
        [userId, firstName, lastName, educationLevel]
      );

      return userSelectResult[0][0];
    });

    // Générer le token
    const token = generateToken(result.id, result.email, result.user_type);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: result.id,
        email: result.email,
        firstName,
        lastName,
        type: result.user_type,
        educationLevel
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Récupérer l'utilisateur avec son profil
    const result = await query(
      `SELECT u.id, u.email, u.password_hash, u.user_type, u.is_active,
              p.first_name, p.last_name, p.education_level, p.institution,
              p.location, p.bio, p.profile_picture_url
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Générer le token
    const token = generateToken(user.id, user.email, user.user_type);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        type: user.user_type,
        educationLevel: user.education_level,
        institution: user.institution,
        location: user.location,
        bio: user.bio,
        photo: user.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Vérification du token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requis' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'lewo_secret_key_change_in_production';
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await query(
      `SELECT u.id, u.email, u.user_type, u.is_active,
              p.first_name, p.last_name, p.education_level
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    const user = result.rows[0];
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        type: user.user_type,
        educationLevel: user.education_level
      }
    });

  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

module.exports = router;

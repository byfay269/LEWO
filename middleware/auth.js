
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'lewo_secret_key_change_in_production';

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const result = await query(
      'SELECT id, email, user_type, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou inactif' });
    }

    req.user = {
      id: decoded.userId,
      email: result.rows[0].email,
      type: result.rows[0].user_type
    };
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(403).json({ message: 'Token invalide' });
  }
};

// Middleware pour vérifier les droits administrateur
const requireAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Droits administrateur requis' });
  }
  next();
};

// Middleware pour vérifier les droits mentor
const requireMentor = (req, res, next) => {
  if (req.user.type !== 'mentor' && req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Droits mentor requis' });
  }
  next();
};

// Générer un token JWT
const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMentor,
  generateToken
};

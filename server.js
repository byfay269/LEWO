
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importation des routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const forumRoutes = require('./routes/forum');
const mentorshipRoutes = require('./routes/mentorships');
const annalesRoutes = require('./routes/annales');
const resultsRoutes = require('./routes/results');
const careersRoutes = require('./routes/careers');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-replit-domain.repl.co'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use(express.static('.'));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/annales', annalesRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/admin', adminRoutes);

// Route de test de l'API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur LEWO en cours d\'exécution',
    timestamp: new Date().toISOString()
  });
});

// Servir l'application frontend pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur LEWO démarré sur le port ${PORT}`);
  console.log(`📱 Accès local: http://localhost:${PORT}`);
  console.log(`🌐 API disponible sur: http://localhost:${PORT}/api`);
});

module.exports = app;

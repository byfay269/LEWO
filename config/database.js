
const mysql = require('mysql2/promise');

// Configuration de la base de données MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lewo_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test de connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion à MySQL établie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MySQL:', err);
  });

// Fonction utilitaire pour exécuter des requêtes
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return { rows: results };
  } catch (error) {
    console.error('Erreur de requête:', error);
    throw error;
  }
};

// Fonction pour les transactions
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction
};

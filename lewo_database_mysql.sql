
-- =================================================================
-- LEWO - Plateforme de Mentorat aux Comores
-- Base de données MySQL
-- =================================================================

-- Suppression des tables (ordre inverse des dépendances)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS progress_tracking;
DROP TABLE IF EXISTS session_participants;
DROP TABLE IF EXISTS mentoring_sessions;
DROP TABLE IF EXISTS message_participants;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS comment_likes;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_reports;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS forum_moderators;
DROP TABLE IF EXISTS forum_categories;
DROP TABLE IF EXISTS mentorship_requests;
DROP TABLE IF EXISTS mentorships;
DROP TABLE IF EXISTS user_subjects;
DROP TABLE IF EXISTS user_interests;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS annales;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS careers;
DROP TABLE IF EXISTS annale_downloads;
DROP TABLE IF EXISTS annale_ratings;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS site_statistics;

-- =================================================================
-- CRÉATION DES TABLES
-- =================================================================

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'mentor', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Table des profils utilisateurs
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender ENUM('M', 'F', 'other'),
    phone VARCHAR(20),
    location VARCHAR(100),
    education_level ENUM('college', 'lycee', 'universite', 'professionnel') NOT NULL,
    institution VARCHAR(200),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    social_links JSON,
    preferences JSON,
    availability JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des matières/sujets
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des intérêts utilisateurs
CREATE TABLE user_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    interest_name VARCHAR(100) NOT NULL,
    proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_interest (user_id, interest_name)
);

-- Table des matières par utilisateur
CREATE TABLE user_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    competency_level INT NOT NULL CHECK (competency_level BETWEEN 1 AND 5),
    can_teach BOOLEAN DEFAULT FALSE,
    wants_to_learn BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_subject (user_id, subject_id)
);

-- Table des relations de mentorat
CREATE TABLE mentorships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    subject_id INT,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    goals TEXT,
    progress_notes TEXT,
    mentor_rating INT CHECK (mentor_rating BETWEEN 1 AND 5),
    mentee_rating INT CHECK (mentee_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY unique_mentorship (mentor_id, mentee_id, subject_id)
);

-- Table des demandes de mentorat
CREATE TABLE mentorship_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    target_id INT NOT NULL,
    subject_id INT,
    request_type ENUM('mentor_request', 'mentee_request') NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Table des catégories de forum
CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#4f46e5',
    parent_id INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES forum_categories(id)
);

-- Table des modérateurs de forum
CREATE TABLE forum_moderators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id),
    UNIQUE KEY unique_moderator (user_id, category_id)
);

-- Table des posts du forum
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    category_id INT,
    subject_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('question', 'discussion', 'exercise', 'exam', 'announcement') DEFAULT 'discussion',
    education_level ENUM('college', 'lycee', 'universite', 'professionnel', 'all'),
    tags JSON,
    attachments JSON,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FULLTEXT(title, content)
);

-- Table des signalements de posts
CREATE TABLE post_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    reporter_id INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'dismissed', 'action_taken') DEFAULT 'pending',
    moderator_id INT,
    moderator_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (moderator_id) REFERENCES users(id)
);

-- Table des commentaires
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    parent_comment_id INT,
    content TEXT NOT NULL,
    attachments JSON,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

-- Table des likes sur les posts
CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_like (post_id, user_id)
);

-- Table des likes sur les commentaires
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comment_like (comment_id, user_id)
);

-- Table des conversations
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    conversation_type ENUM('private', 'group', 'mentorship') DEFAULT 'private',
    created_by INT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des participants aux conversations
CREATE TABLE conversation_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    last_read_at TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id)
);

-- Table des messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    attachments JSON,
    reply_to_id INT,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id)
);

-- Table des participants aux messages
CREATE TABLE message_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_participant (message_id, user_id)
);

-- Table des sessions de mentorat
CREATE TABLE mentoring_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentorship_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    location VARCHAR(255),
    session_type ENUM('online', 'in_person', 'hybrid') DEFAULT 'online',
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    session_notes TEXT,
    mentor_feedback TEXT,
    mentee_feedback TEXT,
    session_rating INT CHECK (session_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentorship_id) REFERENCES mentorships(id) ON DELETE CASCADE
);

-- Table des participants aux sessions
CREATE TABLE session_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('mentor', 'mentee', 'observer') NOT NULL,
    attendance_status ENUM('pending', 'confirmed', 'attended', 'absent') DEFAULT 'pending',
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES mentoring_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_participant (session_id, user_id)
);

-- Table de suivi des progrès
CREATE TABLE progress_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentorship_id INT NOT NULL,
    subject_id INT,
    skill_name VARCHAR(100) NOT NULL,
    initial_level INT CHECK (initial_level BETWEEN 1 AND 5),
    current_level INT CHECK (current_level BETWEEN 1 AND 5),
    target_level INT CHECK (target_level BETWEEN 1 AND 5),
    assessment_date DATE NOT NULL,
    notes TEXT,
    evidence_urls JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentorship_id) REFERENCES mentorships(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Table des notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des annales d'examens
CREATE TABLE annales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    year INT NOT NULL CHECK (year BETWEEN 1990 AND 2030),
    exam_type ENUM('bac', 'bepc', 'bts', 'licence', 'concours') NOT NULL,
    subject_id INT,
    education_level ENUM('college', 'lycee', 'universite', 'professionnel'),
    serie VARCHAR(10),
    difficulty_level ENUM('facile', 'moyen', 'difficile', 'tres_difficile'),
    file_url VARCHAR(500),
    file_size INT,
    page_count INT,
    download_count INT DEFAULT 0,
    is_with_correction BOOLEAN DEFAULT FALSE,
    correction_file_url VARCHAR(500),
    uploaded_by INT,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Table des résultats d'examens
CREATE TABLE exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_type ENUM('bac', 'bepc', 'concours_6eme') NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 2000 AND 2030),
    student_name VARCHAR(255) NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    region ENUM('ngazidja', 'ndzuani', 'mwali'),
    serie VARCHAR(10),
    establishment VARCHAR(255),
    origin_school VARCHAR(255),
    average_score DECIMAL(4,2),
    final_score DECIMAL(4,2),
    rank_position INT,
    mention ENUM('tres_bien', 'bien', 'assez_bien', 'passable', 'none'),
    status ENUM('admitted', 'failed', 'pending') NOT NULL,
    session_type ENUM('principale', 'rattrapage') DEFAULT 'principale',
    published_by INT,
    is_official BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (published_by) REFERENCES users(id),
    UNIQUE KEY unique_result (exam_type, year, student_number)
);

-- Table des métiers et carrières
CREATE TABLE careers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    required_education VARCHAR(100),
    salary_range_min INT,
    salary_range_max INT,
    currency VARCHAR(10) DEFAULT 'EUR',
    skills JSON,
    sectors JSON,
    job_prospects TEXT,
    typical_day TEXT,
    work_environment TEXT,
    training_path TEXT,
    similar_jobs JSON,
    icon_emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des téléchargements d'annales
CREATE TABLE annale_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annale_id INT NOT NULL,
    user_id INT,
    download_type ENUM('annale', 'correction') DEFAULT 'annale',
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (annale_id) REFERENCES annales(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des évaluations d'annales
CREATE TABLE annale_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annale_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (annale_id) REFERENCES annales(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_annale_rating (annale_id, user_id)
);

-- Table des favoris utilisateurs
CREATE TABLE user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('post', 'annale', 'career', 'mentor') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, item_type, item_id)
);

-- Table des statistiques du site
CREATE TABLE site_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    new_registrations INT DEFAULT 0,
    total_posts INT DEFAULT 0,
    new_posts INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    new_comments INT DEFAULT 0,
    total_mentorships INT DEFAULT 0,
    active_mentorships INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    new_downloads INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CRÉATION DES INDEX
-- =================================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_profiles_education_level ON user_profiles(education_level);
CREATE INDEX idx_profiles_location ON user_profiles(location);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_posts_level ON posts(education_level);
CREATE INDEX idx_posts_active ON posts(is_deleted, is_locked);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created ON comments(created_at);

CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX idx_mentorships_status ON mentorships(status);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- =================================================================
-- INSERTION DES DONNÉES DE DÉMONSTRATION
-- =================================================================

-- Insertion des matières
INSERT INTO subjects (name, category, description) VALUES
('Mathématiques', 'Sciences', 'Algèbre, Géométrie, Analyse'),
('Français', 'Langues', 'Littérature, Grammaire, Expression'),
('Anglais', 'Langues', 'Langue anglaise et littérature'),
('Sciences Physiques', 'Sciences', 'Physique et Chimie'),
('Sciences de la Vie et de la Terre', 'Sciences', 'Biologie et Géologie'),
('Histoire-Géographie', 'Sciences Humaines', 'Histoire et Géographie'),
('Informatique', 'Technologie', 'Programmation et Technologies'),
('Économie', 'Sciences Humaines', 'Économie et Gestion');

-- Insertion des catégories de forum
INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES
('Questions Générales', 'Questions sur toutes les matières', '❓', '#3b82f6', 1),
('Mathématiques', 'Discussions sur les mathématiques', '🔢', '#ef4444', 2),
('Sciences', 'Physique, Chimie, SVT', '🔬', '#10b981', 3),
('Langues', 'Français, Anglais, autres langues', '🗣️', '#f59e0b', 4),
('Examens et Concours', 'Préparation aux examens', '📝', '#8b5cf6', 5),
('Exercices Pratiques', 'Partage d exercices', '💪', '#06b6d4', 6),
('Vie Étudiante', 'Conseils et discussions générales', '🎓', '#84cc16', 7);

-- Insertion d'utilisateurs de démonstration (mots de passe hashés avec bcrypt)
INSERT INTO users (email, password_hash, user_type, is_active, is_verified) VALUES
('admin@lewo.km', '$2b$12$dummy_hash_admin', 'admin', TRUE, TRUE),
('mentor1@lewo.km', '$2b$12$dummy_hash_mentor1', 'mentor', TRUE, TRUE),
('mentor2@lewo.km', '$2b$12$dummy_hash_mentor2', 'mentor', TRUE, TRUE),
('student1@lewo.km', '$2b$12$dummy_hash_student1', 'student', TRUE, TRUE),
('student2@lewo.km', '$2b$12$dummy_hash_student2', 'student', TRUE, TRUE);

-- Insertion des profils
INSERT INTO user_profiles (user_id, first_name, last_name, education_level, institution, bio) VALUES
(1, 'Admin', 'LEWO', 'professionnel', 'LEWO Platform', 'Administrateur de la plateforme LEWO'),
(2, 'Ahmed', 'Hassan', 'professionnel', 'Université des Comores', 'Professeur de mathématiques avec 10 ans d expérience'),
(3, 'Aïcha', 'Saïd', 'professionnel', 'Lycée Said Mohamed Cheikh', 'Professeure de français passionnée par la littérature'),
(4, 'Amina', 'Kassim', 'lycee', 'Lycée Said Mohamed Cheikh', 'Élève de terminale S, passionnée par les sciences'),
(5, 'Ibrahim', 'Ali', 'universite', 'Université des Comores', 'Étudiant en informatique, 2ème année');

-- Insertion des compétences utilisateurs
INSERT INTO user_subjects (user_id, subject_id, competency_level, can_teach, wants_to_learn) VALUES
(2, 1, 5, TRUE, FALSE),
(2, 4, 4, TRUE, FALSE),
(3, 2, 5, TRUE, FALSE),
(3, 3, 4, TRUE, FALSE),
(4, 1, 3, FALSE, TRUE),
(4, 4, 4, FALSE, FALSE),
(5, 7, 4, TRUE, TRUE),
(5, 1, 2, FALSE, TRUE);

-- Insertion d'une relation de mentorat
INSERT INTO mentorships (mentor_id, mentee_id, subject_id, status, start_date, goals) VALUES
(2, 4, 1, 'active', CURDATE(), 'Améliorer les compétences en mathématiques pour le BAC'),
(3, 5, 2, 'active', CURDATE(), 'Perfectionner l expression écrite en français');

-- Insertion de posts de démonstration
INSERT INTO posts (author_id, category_id, subject_id, title, content, post_type, education_level, tags) VALUES
(4, 2, 1, 'Aide sur les équations du second degré', 
 'Bonjour, je n arrive pas à résoudre cette équation : x² - 5x + 6 = 0. Quelqu un peut-il m expliquer la méthode ?',
 'question', 'lycee', JSON_ARRAY('équations', 'aide')),
 
(2, 6, 1, 'Exercice : Calcul d aires et de périmètres',
 'Voici un exercice sur le calcul d aires pour les élèves de seconde. Essayez de le résoudre !',
 'exercise', 'lycee', JSON_ARRAY('exercice', 'géométrie')),
 
(5, 1, 7, 'Conseils pour apprendre la programmation',
 'Quelles sont les meilleures ressources pour débuter en programmation ? Merci pour vos conseils !',
 'question', 'universite', JSON_ARRAY('programmation', 'conseils'));

-- Insertion de commentaires
INSERT INTO comments (post_id, author_id, content) VALUES
(1, 2, 'Pour résoudre x² - 5x + 6 = 0, tu peux utiliser la méthode de factorisation ou la formule quadratique. Veux-tu que je t explique les deux méthodes ?'),
(1, 3, 'Excellent exercice ! La factorisation donne (x-2)(x-3) = 0, donc x = 2 ou x = 3.'),
(3, 2, 'Je recommande de commencer par Python, c est un langage très accessible pour débuter.');

-- =================================================================
-- VUES UTILES (MySQL)
-- =================================================================

-- Vue pour les statistiques des utilisateurs
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    CONCAT(up.first_name, ' ', up.last_name) AS full_name,
    u.user_type,
    up.education_level,
    COUNT(DISTINCT p.id) AS posts_count,
    COUNT(DISTINCT c.id) AS comments_count,
    COUNT(DISTINCT CASE WHEN m.mentor_id = u.id THEN m.id END) AS mentorships_as_mentor,
    COUNT(DISTINCT CASE WHEN m.mentee_id = u.id THEN m.id END) AS mentorships_as_mentee
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN posts p ON u.id = p.author_id AND p.is_deleted = FALSE
LEFT JOIN comments c ON u.id = c.author_id AND c.is_deleted = FALSE
LEFT JOIN mentorships m ON u.id = m.mentor_id OR u.id = m.mentee_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.email, up.first_name, up.last_name, u.user_type, up.education_level;

-- =================================================================
-- PROCEDURES STOCKÉES (MySQL)
-- =================================================================

DELIMITER //

-- Procédure pour obtenir les threads du forum avec pagination
CREATE PROCEDURE GetForumThreads(
    IN category_filter INT,
    IN subject_filter INT,
    IN education_level_filter VARCHAR(50),
    IN search_term VARCHAR(255),
    IN page_size INT,
    IN page_offset INT
)
BEGIN
    SELECT 
        p.id AS post_id,
        p.title,
        p.content,
        CONCAT(up.first_name, ' ', up.last_name) AS author_name,
        COALESCE(s.name, 'Général') AS subject_name,
        COALESCE(fc.name, 'Non catégorisé') AS category_name,
        p.post_type,
        p.education_level,
        p.like_count,
        p.comment_count,
        p.view_count,
        p.created_at,
        p.is_pinned
    FROM posts p
    JOIN users u ON p.author_id = u.id
    JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN subjects s ON p.subject_id = s.id
    LEFT JOIN forum_categories fc ON p.category_id = fc.id
    WHERE p.is_deleted = FALSE 
        AND (category_filter IS NULL OR p.category_id = category_filter)
        AND (subject_filter IS NULL OR p.subject_id = subject_filter)
        AND (education_level_filter IS NULL OR p.education_level = education_level_filter)
        AND (search_term IS NULL OR 
             MATCH(p.title, p.content) AGAINST(search_term IN NATURAL LANGUAGE MODE))
    ORDER BY p.is_pinned DESC, p.created_at DESC
    LIMIT page_size OFFSET page_offset;
END //

DELIMITER ;

-- =================================================================
-- TRIGGERS POUR MAINTENIR LA COHÉRENCE
-- =================================================================

DELIMITER //

-- Trigger pour mettre à jour les compteurs de likes sur les posts
CREATE TRIGGER update_post_like_count_insert
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
END //

CREATE TRIGGER update_post_like_count_delete
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
END //

-- Trigger pour mettre à jour les compteurs de commentaires
CREATE TRIGGER update_comment_count_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    IF NEW.is_deleted = FALSE THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
END //

CREATE TRIGGER update_comment_count_update
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = NEW.post_id;
    ELSEIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
END //

-- Trigger pour incrémenter les téléchargements d'annales
CREATE TRIGGER increment_download_count
AFTER INSERT ON annale_downloads
FOR EACH ROW
BEGIN
    UPDATE annales SET download_count = download_count + 1 WHERE id = NEW.annale_id;
END //

DELIMITER ;

-- =================================================================
-- DONNÉES D'EXEMPLE SUPPLÉMENTAIRES
-- =================================================================

-- Insertion d'annales d'exemple
INSERT INTO annales (title, description, year, exam_type, subject_id, education_level, serie, difficulty_level, page_count, is_with_correction, uploaded_by, is_approved, approved_by, approved_at) VALUES
('Baccalauréat Mathématiques Série C - Session 2024', 'Sujet complet de mathématiques avec exercices d''algèbre et de géométrie', 2024, 'bac', 1, 'lycee', 'C', 'difficile', 8, TRUE, 1, TRUE, 1, NOW()),
('BEPC Français - Épreuve 2023', 'Sujet de français avec analyse de texte et expression écrite', 2023, 'bepc', 2, 'college', NULL, 'moyen', 6, TRUE, 1, TRUE, 1, NOW()),
('Concours d''entrée en 6ème - Mathématiques 2024', 'Épreuve de mathématiques pour l''entrée au collège', 2024, 'concours', 1, 'college', NULL, 'moyen', 4, TRUE, 1, TRUE, 1, NOW());

-- Insertion de carrières d'exemple
INSERT INTO careers (title, category, description, required_education, salary_range_min, salary_range_max, skills, sectors, icon_emoji, created_by) VALUES
('Développeur Web', 'sciences', 'Création et maintenance de sites web et applications', 'Bac+2 à Bac+5', 35000, 60000, JSON_ARRAY('HTML/CSS', 'JavaScript', 'Frameworks', 'Git'), JSON_ARRAY('Tech', 'E-commerce', 'Médias'), '💻', 1),
('Infirmier(e)', 'sante', 'Soins et accompagnement des patients dans différents services', 'Bac+3 (IFSI)', 28000, 45000, JSON_ARRAY('Soins', 'Empathie', 'Rigueur', 'Communication'), JSON_ARRAY('Hôpital', 'Clinique', 'Libéral'), '🏥', 1),
('Professeur', 'education', 'Enseignement et formation des élèves', 'Bac+5 (Master MEEF)', 30000, 55000, JSON_ARRAY('Pédagogie', 'Communication', 'Discipline', 'Patience'), JSON_ARRAY('Éducation nationale', 'Privé', 'Formation'), '🎓', 1);

-- =================================================================
-- MESSAGE DE SUCCÈS
-- =================================================================

SELECT 'Base de données LEWO MySQL créée avec succès!' AS message;

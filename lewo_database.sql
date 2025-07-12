
-- =================================================================
-- LEWO - Plateforme de Mentorat aux Comores
-- Base de données locale (PostgreSQL recommandé)
-- =================================================================

-- Justification du choix PostgreSQL :
-- - Meilleure gestion des types de données complexes
-- - Support natif des JSON pour les préférences utilisateur
-- - Fonctions de recherche textuelle avancées (pour le forum)
-- - Contraintes et index plus flexibles
-- - Open source et gratuit

-- =================================================================
-- SUPPRESSION DES TABLES (ordre inverse des dépendances)
-- =================================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS session_participants CASCADE;
DROP TABLE IF EXISTS mentoring_sessions CASCADE;
DROP TABLE IF EXISTS message_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_reports CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS forum_moderators CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS mentorship_requests CASCADE;
DROP TABLE IF EXISTS mentorships CASCADE;
DROP TABLE IF EXISTS user_subjects CASCADE;
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =================================================================
-- CRÉATION DE LA BASE DE DONNÉES
-- =================================================================

-- CREATE DATABASE lewo_db
--     WITH ENCODING 'UTF8'
--     LC_COLLATE = 'fr_FR.UTF-8'
--     LC_CTYPE = 'fr_FR.UTF-8';

-- =================================================================
-- CRÉATION DES TABLES
-- =================================================================

-- Table des utilisateurs (base)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'mentor', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Table des profils utilisateurs
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'other')),
    phone VARCHAR(20),
    location VARCHAR(100),
    education_level VARCHAR(50) NOT NULL CHECK (education_level IN ('college', 'lycee', 'universite', 'professionnel')),
    institution VARCHAR(200),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des matières/sujets
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des intérêts utilisateurs
CREATE TABLE user_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_name VARCHAR(100) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, interest_name)
);

-- Table des matières par utilisateur
CREATE TABLE user_subjects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    competency_level INTEGER NOT NULL CHECK (competency_level BETWEEN 1 AND 5),
    can_teach BOOLEAN DEFAULT FALSE,
    wants_to_learn BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subject_id)
);

-- Table des relations de mentorat
CREATE TABLE mentorships (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    goals TEXT,
    progress_notes TEXT,
    mentor_rating INTEGER CHECK (mentor_rating BETWEEN 1 AND 5),
    mentee_rating INTEGER CHECK (mentee_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id, subject_id)
);

-- Table des demandes de mentorat
CREATE TABLE mentorship_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('mentor_request', 'mentee_request')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de forum
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#4f46e5',
    parent_id INTEGER REFERENCES forum_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des modérateurs de forum
CREATE TABLE forum_moderators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES forum_categories(id),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- Table des posts du forum
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES forum_categories(id),
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'discussion' CHECK (post_type IN ('question', 'discussion', 'exercise', 'exam', 'announcement')),
    education_level VARCHAR(50) CHECK (education_level IN ('college', 'lycee', 'universite', 'professionnel', 'all')),
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des signalements de posts
CREATE TABLE post_reports (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    moderator_id INTEGER REFERENCES users(id),
    moderator_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commentaires
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des likes sur les posts
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Table des likes sur les commentaires
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Table des conversations
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    conversation_type VARCHAR(20) DEFAULT 'private' CHECK (conversation_type IN ('private', 'group', 'mentorship')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_archived BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des participants aux conversations
CREATE TABLE conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    last_read_at TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Table des messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachments JSONB DEFAULT '[]',
    reply_to_id INTEGER REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des participants aux messages (pour les accusés de réception)
CREATE TABLE message_participants (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Table des sessions de mentorat
CREATE TABLE mentoring_sessions (
    id SERIAL PRIMARY KEY,
    mentorship_id INTEGER NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    location VARCHAR(255),
    session_type VARCHAR(20) DEFAULT 'online' CHECK (session_type IN ('online', 'in_person', 'hybrid')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    session_notes TEXT,
    mentor_feedback TEXT,
    mentee_feedback TEXT,
    session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des participants aux sessions
CREATE TABLE session_participants (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES mentoring_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee', 'observer')),
    attendance_status VARCHAR(20) DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'confirmed', 'attended', 'absent')),
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    UNIQUE(session_id, user_id)
);

-- Table de suivi des progrès
CREATE TABLE progress_tracking (
    id SERIAL PRIMARY KEY,
    mentorship_id INTEGER NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id),
    skill_name VARCHAR(100) NOT NULL,
    initial_level INTEGER CHECK (initial_level BETWEEN 1 AND 5),
    current_level INTEGER CHECK (current_level BETWEEN 1 AND 5),
    target_level INTEGER CHECK (target_level BETWEEN 1 AND 5),
    assessment_date DATE NOT NULL,
    notes TEXT,
    evidence_urls JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CRÉATION DES INDEX POUR LES PERFORMANCES
-- =================================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_profiles_education_level ON user_profiles(education_level);
CREATE INDEX idx_profiles_location ON user_profiles(location);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('french', title || ' ' || content));
CREATE INDEX idx_posts_tags ON posts USING gin(tags);
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
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- Index pour les jointures fréquentes
CREATE INDEX idx_user_subjects_user ON user_subjects(user_id);
CREATE INDEX idx_user_subjects_subject ON user_subjects(subject_id);
CREATE INDEX idx_user_interests_user ON user_interests(user_id);

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

-- Insertion d'utilisateurs de démonstration
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
(2, 1, 5, TRUE, FALSE),  -- Ahmed - Mathématiques (expert, peut enseigner)
(2, 4, 4, TRUE, FALSE),  -- Ahmed - Sciences Physiques
(3, 2, 5, TRUE, FALSE),  -- Aïcha - Français (expert, peut enseigner)
(3, 3, 4, TRUE, FALSE),  -- Aïcha - Anglais
(4, 1, 3, FALSE, TRUE),  -- Amina - Mathématiques (veut apprendre)
(4, 4, 4, FALSE, FALSE), -- Amina - Sciences Physiques
(5, 7, 4, TRUE, TRUE),   -- Ibrahim - Informatique
(5, 1, 2, FALSE, TRUE);  -- Ibrahim - Mathématiques (veut apprendre)

-- Insertion d'une relation de mentorat
INSERT INTO mentorships (mentor_id, mentee_id, subject_id, status, start_date, goals) VALUES
(2, 4, 1, 'active', CURRENT_DATE, 'Améliorer les compétences en mathématiques pour le BAC'),
(3, 5, 2, 'active', CURRENT_DATE, 'Perfectionner l expression écrite en français');

-- Insertion de posts de démonstration
INSERT INTO posts (author_id, category_id, subject_id, title, content, post_type, education_level, tags) VALUES
(4, 2, 1, 'Aide sur les équations du second degré', 
 'Bonjour, je n arrive pas à résoudre cette équation : x² - 5x + 6 = 0. Quelqu un peut-il m expliquer la méthode ?',
 'question', 'lycee', ARRAY['équations', 'aide']),
 
(2, 6, 1, 'Exercice : Calcul d aires et de périmètres',
 'Voici un exercice sur le calcul d aires pour les élèves de seconde. Essayez de le résoudre !',
 'exercise', 'lycee', ARRAY['exercice', 'géométrie']),
 
(5, 1, 7, 'Conseils pour apprendre la programmation',
 'Quelles sont les meilleures ressources pour débuter en programmation ? Merci pour vos conseils !',
 'question', 'universite', ARRAY['programmation', 'conseils']);

-- Insertion de commentaires
INSERT INTO comments (post_id, author_id, content) VALUES
(1, 2, 'Pour résoudre x² - 5x + 6 = 0, tu peux utiliser la méthode de factorisation ou la formule quadratique. Veux-tu que je t explique les deux méthodes ?'),
(1, 3, 'Excellent exercice ! La factorisation donne (x-2)(x-3) = 0, donc x = 2 ou x = 3.'),
(3, 2, 'Je recommande de commencer par Python, c est un langage très accessible pour débuter.');

-- =================================================================
-- CRÉATION DES VUES UTILES
-- =================================================================

-- Vue pour les statistiques des utilisateurs
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    up.first_name || ' ' || up.last_name AS full_name,
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

-- Vue pour les posts populaires du forum
CREATE OR REPLACE VIEW popular_posts AS
SELECT 
    p.id,
    p.title,
    p.content,
    up.first_name || ' ' || up.last_name AS author_name,
    s.name AS subject_name,
    fc.name AS category_name,
    p.like_count,
    p.comment_count,
    p.view_count,
    p.created_at
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN subjects s ON p.subject_id = s.id
LEFT JOIN forum_categories fc ON p.category_id = fc.id
WHERE p.is_deleted = FALSE 
    AND p.is_locked = FALSE
ORDER BY (p.like_count * 2 + p.comment_count + p.view_count * 0.1) DESC;

-- Vue pour le matching mentor-étudiant
CREATE OR REPLACE VIEW mentor_matching AS
SELECT 
    mentor.id AS mentor_id,
    mentor_profile.first_name || ' ' || mentor_profile.last_name AS mentor_name,
    mentor_profile.education_level AS mentor_level,
    s.name AS subject_name,
    us_mentor.competency_level AS mentor_competency,
    student.id AS potential_mentee_id,
    student_profile.first_name || ' ' || student_profile.last_name AS student_name,
    student_profile.education_level AS student_level,
    us_student.competency_level AS student_current_level
FROM users mentor
JOIN user_profiles mentor_profile ON mentor.id = mentor_profile.user_id
JOIN user_subjects us_mentor ON mentor.id = us_mentor.user_id
JOIN subjects s ON us_mentor.subject_id = s.id
JOIN user_subjects us_student ON s.id = us_student.subject_id
JOIN users student ON us_student.user_id = student.id
JOIN user_profiles student_profile ON student.id = student_profile.user_id
WHERE mentor.user_type = 'mentor'
    AND student.user_type = 'student'
    AND us_mentor.can_teach = TRUE
    AND us_student.wants_to_learn = TRUE
    AND us_mentor.competency_level > us_student.competency_level
    AND mentor.is_active = TRUE
    AND student.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM mentorships m 
        WHERE m.mentor_id = mentor.id 
            AND m.mentee_id = student.id 
            AND m.status IN ('active', 'pending')
    );

-- =================================================================
-- CRÉATION DES FONCTIONS STOCKÉES
-- =================================================================

-- Fonction pour obtenir les threads du forum avec pagination
CREATE OR REPLACE FUNCTION get_forum_threads(
    category_filter INTEGER DEFAULT NULL,
    subject_filter INTEGER DEFAULT NULL,
    education_level_filter VARCHAR DEFAULT NULL,
    search_term VARCHAR DEFAULT NULL,
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    post_id INTEGER,
    title VARCHAR,
    content TEXT,
    author_name VARCHAR,
    subject_name VARCHAR,
    category_name VARCHAR,
    post_type VARCHAR,
    education_level VARCHAR,
    like_count INTEGER,
    comment_count INTEGER,
    view_count INTEGER,
    created_at TIMESTAMP,
    is_pinned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.content,
        (up.first_name || ' ' || up.last_name)::VARCHAR,
        COALESCE(s.name, 'Général')::VARCHAR,
        COALESCE(fc.name, 'Non catégorisé')::VARCHAR,
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
             to_tsvector('french', p.title || ' ' || p.content) @@ plainto_tsquery('french', search_term))
    ORDER BY p.is_pinned DESC, p.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour matcher les mentors pour un étudiant donné
CREATE OR REPLACE FUNCTION match_mentors_for_student(student_user_id INTEGER)
RETURNS TABLE (
    mentor_id INTEGER,
    mentor_name VARCHAR,
    subject_name VARCHAR,
    mentor_competency INTEGER,
    compatibility_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.mentor_id,
        (mp.first_name || ' ' || mp.last_name)::VARCHAR,
        s.name::VARCHAR,
        us_mentor.competency_level,
        (
            -- Score basé sur la différence de compétence (optimal : +1 ou +2 niveaux)
            CASE 
                WHEN us_mentor.competency_level - us_student.competency_level = 1 THEN 1.0
                WHEN us_mentor.competency_level - us_student.competency_level = 2 THEN 0.9
                WHEN us_mentor.competency_level - us_student.competency_level = 3 THEN 0.7
                ELSE 0.5
            END +
            -- Bonus pour même niveau d'éducation
            CASE WHEN mp.education_level = sp.education_level THEN 0.2 ELSE 0 END +
            -- Bonus pour même localisation
            CASE WHEN mp.location = sp.location THEN 0.1 ELSE 0 END
        ) AS compatibility_score
    FROM mentor_matching m
    JOIN user_profiles mp ON m.mentor_id = mp.user_id
    JOIN user_profiles sp ON m.potential_mentee_id = sp.user_id
    JOIN subjects s ON s.name = m.subject_name
    JOIN user_subjects us_mentor ON m.mentor_id = us_mentor.user_id AND s.id = us_mentor.subject_id
    JOIN user_subjects us_student ON m.potential_mentee_id = us_student.user_id AND s.id = us_student.subject_id
    WHERE m.potential_mentee_id = student_user_id
    ORDER BY compatibility_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- TRIGGERS POUR MAINTENIR LA COHÉRENCE
-- =================================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at BEFORE UPDATE ON mentorships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour les compteurs de likes/commentaires
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
            UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
                UPDATE posts SET comment_count = comment_count - 1 WHERE id = NEW.post_id;
            ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
                UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
            END IF;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_counter AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER comments_counter AFTER INSERT OR UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- =================================================================
-- REQUÊTES D'EXEMPLE POUR TESTER LE SYSTÈME
-- =================================================================

-- Recherche de posts dans le forum
-- SELECT * FROM get_forum_threads(2, 1, 'lycee', 'équation', 10, 0);

-- Matching de mentors pour un étudiant
-- SELECT * FROM match_mentors_for_student(4);

-- Statistiques des utilisateurs les plus actifs
-- SELECT * FROM user_stats ORDER BY (posts_count + comments_count) DESC LIMIT 10;

-- Posts les plus populaires
-- SELECT * FROM popular_posts LIMIT 5;

-- =================================================================
-- FIN DU SCRIPT
-- =================================================================

-- Ce script crée une base de données complète pour LEWO avec :
-- ✅ Gestion des utilisateurs et profils
-- ✅ Système de mentorat avec matching automatique
-- ✅ Forum collaboratif avec catégories et modération
-- ✅ Système de messages et notifications
-- ✅ Suivi des progrès et sessions de mentorat
-- ✅ Index optimisés pour les performances
-- ✅ Vues et fonctions pour les requêtes complexes
-- ✅ Triggers pour maintenir la cohérence des données

COMMENT ON DATABASE lewo_db IS 'Base de données de la plateforme LEWO - Mentorat aux Comores';

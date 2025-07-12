
# LEWO - Diagramme Entité-Relation (ERD)

## 🏗️ Architecture Globale

La base de données LEWO est organisée en 6 modules principaux :

### 1. 👥 **GESTION DES UTILISATEURS**
```
USERS (Table principale)
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── user_type (student/mentor/admin)
└── timestamps

USER_PROFILES (Profils détaillés)
├── user_id (FK → users.id)
├── first_name, last_name
├── education_level
├── bio, location
└── preferences (JSONB)

USER_SUBJECTS (Compétences)
├── user_id (FK → users.id)
├── subject_id (FK → subjects.id)
├── competency_level (1-5)
├── can_teach, wants_to_learn
└── Relation : Many-to-Many

USER_INTERESTS (Centres d'intérêt)
├── user_id (FK → users.id)
├── interest_name
└── proficiency_level
```

### 2. 🎓 **SYSTÈME DE MENTORAT**
```
MENTORSHIPS (Relations mentor-étudiant)
├── mentor_id (FK → users.id)
├── mentee_id (FK → users.id)
├── subject_id (FK → subjects.id)
├── status (active/completed/cancelled)
├── goals, progress_notes
└── ratings (mentor/mentee)

MENTORSHIP_REQUESTS (Demandes)
├── requester_id (FK → users.id)
├── target_id (FK → users.id)
├── request_type (mentor_request/mentee_request)
└── status (pending/accepted/declined)

MENTORING_SESSIONS (Sessions)
├── mentorship_id (FK → mentorships.id)
├── scheduled_start, scheduled_end
├── session_type (online/in_person)
├── feedback, rating
└── status

PROGRESS_TRACKING (Suivi des progrès)
├── mentorship_id (FK → mentorships.id)
├── skill_name
├── initial_level, current_level, target_level
└── assessment_date
```

### 3. 💬 **FORUM COLLABORATIF**
```
FORUM_CATEGORIES (Catégories)
├── id (PK)
├── name, description
├── parent_id (auto-référence)
└── color, icon

POSTS (Publications)
├── author_id (FK → users.id)
├── category_id (FK → forum_categories.id)
├── subject_id (FK → subjects.id)
├── title, content
├── post_type (question/exercise/exam)
├── education_level
├── tags (TEXT[])
├── view_count, like_count, comment_count
└── is_pinned, is_locked

COMMENTS (Commentaires)
├── post_id (FK → posts.id)
├── author_id (FK → users.id)
├── parent_comment_id (auto-référence)
├── content
└── like_count

POST_LIKES / COMMENT_LIKES (Interactions)
├── [post_id|comment_id] (FK)
├── user_id (FK → users.id)
└── Contrainte UNIQUE(entity_id, user_id)

POST_REPORTS (Signalements)
├── post_id (FK → posts.id)
├── reporter_id (FK → users.id)
├── reason, description
├── moderator_id (FK → users.id)
└── status (pending/reviewed)
```

### 4. 💌 **SYSTÈME DE MESSAGERIE**
```
CONVERSATIONS (Conversations)
├── id (PK)
├── title
├── conversation_type (private/group/mentorship)
├── created_by (FK → users.id)
└── last_message_at

CONVERSATION_PARTICIPANTS (Participants)
├── conversation_id (FK → conversations.id)
├── user_id (FK → users.id)
├── role (admin/member)
├── joined_at, left_at
└── last_read_at

MESSAGES (Messages)
├── conversation_id (FK → conversations.id)
├── sender_id (FK → users.id)
├── content
├── message_type (text/image/file)
├── attachments (JSONB)
└── reply_to_id (auto-référence)

MESSAGE_PARTICIPANTS (Accusés de réception)
├── message_id (FK → messages.id)
├── user_id (FK → users.id)
├── is_read
└── read_at
```

### 5. 🔔 **NOTIFICATIONS**
```
NOTIFICATIONS
├── user_id (FK → users.id)
├── title, content
├── notification_type
├── related_entity_type, related_entity_id
├── is_read, is_sent
├── send_email, send_push
├── scheduled_for, sent_at
└── read_at
```

### 6. 📚 **DONNÉES DE RÉFÉRENCE**
```
SUBJECTS (Matières)
├── id (PK)
├── name (UNIQUE)
├── category
├── description
└── is_active

FORUM_MODERATORS (Modérateurs)
├── user_id (FK → users.id)
├── category_id (FK → forum_categories.id)
├── permissions (JSONB)
└── Relation : Many-to-Many
```

## 🔗 Relations Principales

### Relations One-to-One
- `users` ↔ `user_profiles` (1:1)

### Relations One-to-Many
- `users` → `posts` (1:N)
- `users` → `comments` (1:N)
- `posts` → `comments` (1:N)
- `mentorships` → `mentoring_sessions` (1:N)
- `conversations` → `messages` (1:N)

### Relations Many-to-Many
- `users` ↔ `subjects` (via `user_subjects`)
- `users` ↔ `posts` (via `post_likes`)
- `users` ↔ `comments` (via `comment_likes`)
- `users` ↔ `conversations` (via `conversation_participants`)
- `users` ↔ `forum_categories` (via `forum_moderators`)

### Relations Complexes
- **Mentorat** : `users` (mentor) ↔ `users` (mentee) via `mentorships`
- **Hiérarchie** : `forum_categories` auto-référence pour sous-catégories
- **Threading** : `comments` auto-référence pour réponses imbriquées

## 📊 Contraintes et Index

### Contraintes d'Intégrité
```sql
-- Contraintes CHECK
user_type IN ('student', 'mentor', 'admin')
education_level IN ('college', 'lycee', 'universite', 'professionnel')
competency_level BETWEEN 1 AND 5
rating BETWEEN 1 AND 5

-- Contraintes UNIQUE
UNIQUE(user_id, subject_id) -- user_subjects
UNIQUE(post_id, user_id)    -- post_likes
UNIQUE(mentor_id, mentee_id, subject_id) -- mentorships
```

### Index de Performance
```sql
-- Index de recherche textuelle
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('french', title || ' ' || content));

-- Index pour tags
CREATE INDEX idx_posts_tags ON posts USING gin(tags);

-- Index composites fréquents
CREATE INDEX idx_posts_active ON posts(is_deleted, is_locked);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

## 🎯 Fonctionnalités Clés Supportées

### 1. **Matching Automatique**
- Vue `mentor_matching` pour compatibilité mentor-étudiant
- Fonction `match_mentors_for_student()` avec score de compatibilité
- Critères : compétences, niveau d'éducation, localisation

### 2. **Forum Avancé**
- Recherche textuelle full-text en français
- Filtrage par catégorie, matière, niveau
- Système de modération et signalements
- Threading de commentaires

### 3. **Notifications Intelligentes**
- Notifications programmées
- Multi-canal (email, push, in-app)
- Liens vers entités liées

### 4. **Analytics et Reporting**
- Vue `user_stats` pour statistiques utilisateur
- Vue `popular_posts` pour contenu tendance
- Triggers pour maintenir les compteurs

## 🚀 Évolutivité

### Optimisations Futures
- **Partitioning** : Tables `messages` et `notifications` par date
- **Caching** : Redis pour sessions et cache forum
- **CDN** : Stockage des attachments
- **Elasticsearch** : Recherche avancée

### Extensions Possibles
- **Gamification** : Table `user_achievements`
- **Événements** : Table `events` pour webinaires
- **Paiements** : Tables pour mentorat payant
- **Mobile** : Push notifications natives

Cette architecture garantit **performance**, **scalabilité** et **maintenabilité** pour la plateforme LEWO.

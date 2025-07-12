
// Gestion du forum
class ForumManager {
    constructor() {
        this.posts = [];
        this.currentFilters = {
            search: '',
            subject: '',
            level: ''
        };
    }

    async loadPosts() {
        try {
            const params = new URLSearchParams();
            Object.entries(this.currentFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`/api/forum/posts?${params}`, {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts;
                this.displayPosts();
            } else {
                showNotification('Erreur lors du chargement des posts', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.displayDemoPosts();
        }
    }

    displayPosts() {
        const container = document.getElementById('forumPosts');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Aucun post trouvé</h3>
                    <p>Soyez le premier à poster quelque chose !</p>
                    ${authManager.isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="showNewPost()">Créer un post</button>
                    ` : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => this.createPostHTML(post)).join('');
    }

    displayDemoPosts() {
        const demoPosts = [
            {
                id: 1,
                title: "Aide en mathématiques - Équations du second degré",
                content: "Bonjour, j'ai des difficultés avec les équations du second degré. Quelqu'un peut-il m'expliquer ?",
                author_name: "Amina K.",
                subject_name: "Mathématiques",
                education_level: "lycee",
                post_type: "question",
                created_at: new Date().toISOString(),
                like_count: 5,
                comment_count: 3,
                view_count: 12
            },
            {
                id: 2,
                title: "Exercice de physique - Mécanique",
                content: "Voici un exercice de mécanique que j'ai résolu. N'hésitez pas à commenter !",
                author_name: "Ibrahim S.",
                subject_name: "Physique",
                education_level: "lycee",
                post_type: "exercice",
                created_at: new Date(Date.now() - 86400000).toISOString(),
                like_count: 8,
                comment_count: 6,
                view_count: 25
            }
        ];

        const container = document.getElementById('forumPosts');
        if (container) {
            container.innerHTML = demoPosts.map(post => this.createPostHTML(post)).join('');
        }
    }

    createPostHTML(post) {
        const postTypeIcons = {
            'question': '❓',
            'exercice': '📝',
            'discussion': '💬',
            'aide': '🤝'
        };

        const levelLabels = {
            'college': 'Collège',
            'lycee': 'Lycée',
            'universite': 'Université'
        };

        return `
            <div class="forum-post" onclick="viewPost(${post.id})">
                <div class="post-header">
                    <div class="post-meta">
                        <span class="post-type">${postTypeIcons[post.post_type] || '📄'} ${post.post_type}</span>
                        <span class="post-subject">${post.subject_name || 'Général'}</span>
                        <span class="post-level">${levelLabels[post.education_level] || post.education_level}</span>
                    </div>
                    <div class="post-date">${this.formatDate(post.created_at)}</div>
                </div>
                
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${this.truncateText(post.content, 150)}</p>
                
                <div class="post-author">
                    <span class="author-name">👤 ${post.author_name || 'Anonyme'}</span>
                </div>
                
                <div class="post-stats">
                    <span class="stat">👁️ ${post.view_count || 0}</span>
                    <span class="stat">👍 ${post.like_count || 0}</span>
                    <span class="stat">💬 ${post.comment_count || 0}</span>
                </div>
                
                <div class="post-actions">
                    ${authManager.isLoggedIn() ? `
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); likePost(${post.id})">
                            👍 J'aime
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); replyToPost(${post.id})">
                            💬 Répondre
                        </button>
                    ` : `
                        <p class="auth-required-msg">Connectez-vous pour interagir</p>
                    `}
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Aujourd'hui";
        } else if (diffDays === 1) {
            return "Hier";
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    async createPost(postData) {
        if (!authManager.isLoggedIn()) {
            showNotification('Connectez-vous pour créer un post', 'error');
            return;
        }

        try {
            const response = await fetch('/api/forum/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.getToken()}`
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                showNotification('Post créé avec succès !', 'success');
                hideModal();
                this.loadPosts();
            } else {
                const error = await response.json();
                showNotification(error.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la création du post', 'error');
        }
    }

    filterPosts() {
        const searchInput = document.querySelector('.search-input');
        const subjectSelect = document.querySelectorAll('.filter-select')[0];
        const levelSelect = document.querySelectorAll('.filter-select')[1];

        this.currentFilters = {
            search: searchInput ? searchInput.value : '',
            subject: subjectSelect ? subjectSelect.value : '',
            level: levelSelect ? levelSelect.value : ''
        };

        this.loadPosts();
    }
}

// Instance globale
let forumManager;

// Fonctions globales
function showNewPost() {
    if (!authManager.isLoggedIn()) {
        showNotification('Connectez-vous pour créer un post', 'error');
        return;
    }

    const modalContent = `
        <div class="modal-header">
            <h3>Nouveau Post</h3>
            <button class="modal-close" onclick="hideModal()">&times;</button>
        </div>
        <form id="newPostForm" onsubmit="handleNewPostSubmit(event)">
            <div class="form-group">
                <label>Type de post</label>
                <select name="post_type" required>
                    <option value="question">❓ Question</option>
                    <option value="exercice">📝 Exercice</option>
                    <option value="discussion">💬 Discussion</option>
                    <option value="aide">🤝 Demande d'aide</option>
                </select>
            </div>
            <div class="form-group">
                <label>Matière</label>
                <select name="subject_id">
                    <option value="">Général</option>
                    <option value="1">Mathématiques</option>
                    <option value="2">Français</option>
                    <option value="3">Sciences</option>
                    <option value="4">Histoire-Géographie</option>
                    <option value="5">Anglais</option>
                </select>
            </div>
            <div class="form-group">
                <label>Titre</label>
                <input type="text" name="title" required placeholder="Titre de votre post">
            </div>
            <div class="form-group">
                <label>Contenu</label>
                <textarea name="content" required placeholder="Décrivez votre question, exercice ou discussion..." rows="6"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="hideModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Publier</button>
            </div>
        </form>
    `;

    showModal(modalContent);
}

function handleNewPostSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const postData = Object.fromEntries(formData);
    
    if (forumManager) {
        forumManager.createPost(postData);
    }
}

function viewPost(postId) {
    // Rediriger vers la vue détaillée du post
    showNotification('Vue détaillée du post - Fonctionnalité en cours de développement', 'info');
}

function likePost(postId) {
    if (!authManager.isLoggedIn()) {
        showNotification('Connectez-vous pour aimer un post', 'error');
        return;
    }
    showNotification('Post aimé !', 'success');
}

function replyToPost(postId) {
    if (!authManager.isLoggedIn()) {
        showNotification('Connectez-vous pour répondre', 'error');
        return;
    }
    showNotification('Réponse - Fonctionnalité en cours de développement', 'info');
}

// Initialisation
function initializeForum() {
    if (!forumManager) {
        forumManager = new ForumManager();
    }
    forumManager.loadPosts();

    // Ajouter les event listeners pour les filtres
    const searchInput = document.querySelector('.search-input');
    const filterSelects = document.querySelectorAll('.filter-select');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchInput.searchTimeout);
            searchInput.searchTimeout = setTimeout(() => {
                forumManager.filterPosts();
            }, 500);
        });
    }

    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            forumManager.filterPosts();
        });
    });
}

// Exposition des fonctions
window.showNewPost = showNewPost;
window.viewPost = viewPost;
window.likePost = likePost;
window.replyToPost = replyToPost;
window.handleNewPostSubmit = handleNewPostSubmit;

// ====================================
// LEWO - Plateforme de Mentorat
// Script principal
// ====================================

// État global de l'application
let currentSection = 'accueil';
let currentUser = null;

// Configuration de l'API
const API_BASE_URL = window.location.origin + '/api';

// Utilitaires pour la gestion des erreurs
function handleError(error, context = 'Opération') {
    console.error('Erreur JavaScript:', error);
    showNotification(`${context} échouée: ${error.message || 'Erreur inconnue'}`, 'error');
}

// Notification système
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: inherit; cursor: pointer;">×</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Gestion de l'authentification
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
                currentUser = payload;
                updateUIForAuthenticatedUser();
                return true;
            } else {
                logout();
            }
        } catch (e) {
            logout();
        }
    }
    return false;
}

function updateUIForAuthenticatedUser() {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (authButtons && userMenu) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';

        const userNameSpan = userMenu.querySelector('.user-name');
        if (userNameSpan && currentUser) {
            userNameSpan.textContent = currentUser.email;
        }
    }
}

function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    location.reload();
}

// Navigation
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Afficher la section demandée
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = sectionName;

        // Mettre à jour la navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Charger le contenu spécifique à la section
        loadSectionContent(sectionName);
    }
}

async function loadSectionContent(sectionName) {
    try {
        switch (sectionName) {
            case 'annales':
                await loadAnnales();
                break;
            case 'forum':
                await loadForum();
                break;
            case 'mentors':
                await loadMentors();
                break;
            case 'metiers':
                await loadMetiers();
                break;
            case 'resultats':
                await loadResultats();
                break;
            case 'profil':
                if (currentUser) {
                    await loadProfil();
                } else {
                    showSection('accueil');
                    showNotification('Veuillez vous connecter pour accéder à votre profil', 'warning');
                }
                break;
        }
    } catch (error) {
        handleError(error, 'Chargement de la section');
    }
}

// Chargement des annales
async function loadAnnales() {
    try {
        const response = await fetch(`${API_BASE_URL}/annales`);
        const annales = await response.json();

        const container = document.getElementById('annales-list');
        if (container) {
            container.innerHTML = annales.map(annale => `
                <div class="annale-card">
                    <h3>${annale.title}</h3>
                    <p><strong>Année:</strong> ${annale.year}</p>
                    <p><strong>Type:</strong> ${annale.exam_type}</p>
                    <p><strong>Niveau:</strong> ${annale.level}</p>
                    <p>${annale.description}</p>
                    <div class="annale-actions">
                        <button onclick="downloadAnnale(${annale.id}, 'annale')" class="btn btn-primary">
                            📄 Télécharger l'épreuve
                        </button>
                        ${annale.correction_file_url ? `
                            <button onclick="downloadAnnale(${annale.id}, 'correction')" class="btn btn-secondary">
                                ✅ Télécharger la correction
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        handleError(error, 'Chargement des annales');
    }
}

async function downloadAnnale(annaleId, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/annales/${annaleId}/download?type=${type}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `annale_${annaleId}_${type}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showNotification('Téléchargement démarré', 'success');
        } else {
            throw new Error('Erreur lors du téléchargement');
        }
    } catch (error) {
        handleError(error, 'Téléchargement');
    }
}

// Chargement du forum
async function loadForum() {
    try {
        const response = await fetch(`${API_BASE_URL}/forum/posts`);
        const posts = await response.json();

        const container = document.getElementById('forum-posts');
        if (container) {
            container.innerHTML = posts.map(post => `
                <div class="forum-post">
                    <div class="post-header">
                        <h3>${post.title}</h3>
                        <span class="post-meta">Par ${post.author_name} • ${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                    </div>
                    <div class="post-actions">
                        <button onclick="showPostComments(${post.id})" class="btn btn-sm">
                            💬 ${post.comments_count || 0} commentaires
                        </button>
                        <button onclick="likePost(${post.id})" class="btn btn-sm">
                            👍 ${post.likes_count || 0}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        handleError(error, 'Chargement du forum');
    }
}

// Chargement des mentors
async function loadMentors() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/mentors`);
        const mentors = await response.json();

        const container = document.getElementById('mentors-list');
        if (container) {
            container.innerHTML = mentors.map(mentor => `
                <div class="mentor-card">
                    <div class="mentor-info">
                        <h3>${mentor.name}</h3>
                        <p><strong>Niveau:</strong> ${mentor.education_level}</p>
                        <p><strong>Institution:</strong> ${mentor.institution}</p>
                        <p><strong>Localisation:</strong> ${mentor.location}</p>
                        <p>${mentor.bio}</p>
                    </div>
                    <div class="mentor-actions">
                        <button onclick="contactMentor(${mentor.id})" class="btn btn-primary">
                            Contacter
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        handleError(error, 'Chargement des mentors');
    }
}

// Chargement des métiers
async function loadMetiers() {
    try {
        const response = await fetch(`${API_BASE_URL}/careers`);
        const careers = await response.json();

        const container = document.getElementById('careers-list');
        if (container) {
            container.innerHTML = careers.map(career => `
                <div class="career-card">
                    <div class="career-header">
                        <span class="career-emoji">${career.icon_emoji || '💼'}</span>
                        <h3>${career.title}</h3>
                        <span class="career-category">${career.category}</span>
                    </div>
                    <div class="career-content">
                        <p>${career.description}</p>
                        <p><strong>Formation requise:</strong> ${career.required_education}</p>
                        <p><strong>Salaire:</strong> ${career.salary_range_min}€ - ${career.salary_range_max}€</p>
                    </div>
                    <div class="career-actions">
                        <button onclick="showCareerDetails(${career.id})" class="btn btn-primary">
                            En savoir plus
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        handleError(error, 'Chargement des métiers');
    }
}

// Chargement des résultats
async function loadResultats() {
    try {
        const response = await fetch(`${API_BASE_URL}/results`);
        const results = await response.json();

        const container = document.getElementById('results-list');
        if (container) {
            container.innerHTML = results.map(result => `
                <div class="result-card">
                    <h3>${result.exam_type} ${result.year}</h3>
                    <p><strong>Région:</strong> ${result.region}</p>
                    <p><strong>Taux de réussite:</strong> ${result.success_rate}%</p>
                    <p><strong>Note moyenne:</strong> ${result.average_score}/20</p>
                </div>
            `).join('');
        }
    } catch (error) {
        handleError(error, 'Chargement des résultats');
    }
}

// Chargement du profil
async function loadProfil() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const profile = await response.json();

            // Remplir le formulaire de profil
            const form = document.getElementById('profile-form');
            if (form) {
                form.firstName.value = profile.first_name || '';
                form.lastName.value = profile.last_name || '';
                form.email.value = profile.email || '';
                form.phone.value = profile.phone || '';
                form.location.value = profile.location || '';
                form.institution.value = profile.institution || '';
                form.bio.value = profile.bio || '';
            }
        }
    } catch (error) {
        handleError(error, 'Chargement du profil');
    }
}

// Gestion des formulaires d'authentification
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
}

async function handleLogin() {
    try {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = JSON.parse(atob(data.token.split('.')[1]));
            showNotification('Connexion réussie', 'success');
            closeModal('login-modal');
            updateUIForAuthenticatedUser();
        } else {
            throw new Error(data.message || 'Erreur de connexion');
        }
    } catch (error) {
        handleError(error, 'Connexion');
    }
}

async function handleRegister() {
    try {
        const form = document.getElementById('register-form');
        const formData = new FormData(form);

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('userType'),
                educationLevel: formData.get('educationLevel')
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
            closeModal('register-modal');
            openModal('login-modal');
        } else {
            throw new Error(data.message || 'Erreur d\'inscription');
        }
    } catch (error) {
        handleError(error, 'Inscription');
    }
}

// Gestion des modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    try {
        checkAuth();
        setupAuthForms();
        showSection('accueil');
        console.log('Application LEWO initialisée avec succès');
    } catch (error) {
        handleError(error, 'Initialisation de l\'application');
    }
});

// Fermer les modales en cliquant en dehors
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ====================================
// INITIALISATION
// ====================================

function initializeApp() {
    // Initialiser les modules
    forumManager.init();
    mentorsManager.init();
    contentManager.init();
    profileManager.init();
    adminManager.init();

    // Charger la section par défaut
    showSection('accueil');
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    // Modals
    setupModalEvents();

    // Formulaires
    setupFormHandlers();
}

function setupModalEvents() {
    // Fermeture des modals
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Fermeture en cliquant en dehors
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// ====================================
// NAVIGATION
// ====================================

function showSectionOriginal(sectionName) {
    // Vérifier l'authentification pour certaines sections
    if ((sectionName === 'annales' || sectionName === 'metiers' || sectionName === 'resultats') && !authManager.isLoggedIn()) {
        showNotification('Veuillez vous connecter pour accéder à cette section', 'error');
        showLogin();
        return;
    }

    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Afficher la section demandée
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionName) {
            link.classList.add('active');
        }
    });

    appCurrentSection = sectionName;
}

function scrollToSection(sectionName) {
    showSection(sectionName);
}

// Gestion des modales
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

function showNewPost() {
    if (!authManager.getCurrentUser()) {
        showLogin();
        return;
    }
    document.getElementById('newPostModal').style.display = 'block';
}

function closeModalOriginal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchToRegister() {
    closeModal('loginModal');
    showRegister();
}

function switchToLogin() {
    closeModal('registerModal');
    showLogin();
}

// Chargement des posts du forum
function loadForumPosts() {
    const forumPosts = document.getElementById('forumPosts');
    if (forumPosts) {
        forumPosts.innerHTML = samplePosts.map(post => createPostHTML(post)).join('');
    }
}

function createPostHTML(post) {
    return `
        <div class="forum-post">
            <div class="post-header">
                <div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span>Par ${post.author}</span>
                        <span>${post.date}</span>
                        <span>${post.level}</span>
                    </div>
                </div>
                <span class="post-category">${post.subject}</span>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div class="post-actions">
                <a href="#" class="post-action">
                    👍 ${post.likes} J'aime
                </a>
                <a href="#" class="post-action">
                    💬 ${post.replies} Réponses
                </a>
                <a href="#" class="post-action">
                    📤 Partager
                </a>
            </div>
        </div>
    `;
}

// Chargement des mentors
function loadMentorsOriginal() {
    const mentorsGrid = document.getElementById('mentorsGrid');
    if (mentorsGrid) {
        mentorsGrid.innerHTML = sampleMentors.map(mentor => createMentorHTML(mentor)).join('');
    }
}

function createMentorHTML(mentor) {
    const stars = '⭐'.repeat(Math.floor(mentor.rating));
    return `
        <div class="mentor-card">
            <div class="mentor-avatar">${mentor.avatar}</div>
            <h3 class="mentor-name">${mentor.name}</h3>
            <p class="mentor-subjects">${mentor.subjects}</p>
            <div class="mentor-rating">${stars} ${mentor.rating}</div>
            <p style="color: #718096; font-size: 0.9rem; margin-bottom: 1rem;">${mentor.experience}</p>
            <button class="btn btn-primary" onclick="contactMentor(${mentor.id})">
                Contacter
            </button>
        </div>
    `;
}

// Gestion des formulaires
function setupFormHandlers() {
    // Formulaire de connexion
    const loginForm = document.querySelector('#loginModal .auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Formulaire d'inscription
    const registerForm = document.querySelector('#registerModal .auth-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });    }

    // Formulaire de nouveau post
    const postForm = document.querySelector('#newPostModal .post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewPost();
        });
    }

    // Formulaire d'édition de profil
    const profileForm = document.querySelector('#profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleProfileUpdate();
        });
    }

    // Gestion du changement de photo
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            handlePhotoChange(e);
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();

    // Simulation de connexion
    const email = document.querySelector('#loginModal input[type="email"]').value;

    authManager.currentUser = {
        email: email,
        firstName: "Utilisateur",
        lastName: "Test",
        name: "Utilisateur Test",
        type: "student",
        educationLevel: "lycee",
        institution: "",
        location: "",
        bio: "Bienvenue sur LEWO ! N'hésitez pas à compléter votre profil.",
        interests: [],
        photo: null,
        postsCount: 0,
        commentsCount: 0,
        helpedCount: 0,
        reputationScore: 100
    };

    closeModal('loginModal');
    authManager.updateAuthButtons();
    showNotification('Connexion réussie !', 'success');
}

async function handleRegister(e) {
    e.preventDefault();

    // Simulation d'inscription
    const firstname = document.querySelector('#registerModal input[placeholder="Prénom"]').value;
    const lastname = document.querySelector('#registerModal input[placeholder="Nom"]').value;
    const email = document.querySelector('#registerModal input[type="email"]').value;
    const userType = document.querySelector('#registerModal select').value;
    const educationLevel = document.querySelectorAll('#registerModal select')[1].value;

    authManager.currentUser = {
        email: email,
        firstName: firstname,
        lastName: lastname,
        name: `${firstname} ${lastname}`,
        type: userType,
        educationLevel: educationLevel,
        institution: "",
        location: "",
        bio: "Bienvenue sur LEWO ! N'hésitez pas à compléter votre profil pour mieux vous faire connaître de la communauté.",
        interests: [],
        photo: null,
        postsCount: 0,
        commentsCount: 0,
        helpedCount: 0,
        reputationScore: 100
    };

    closeModal('registerModal');
    authManager.updateAuthButtons();
    showNotification('Inscription réussie ! Bienvenue sur LEWO !', 'success');
}

function handleNewPost() {
    const title = document.querySelector('#newPostModal input[placeholder="Titre de votre post"]').value;
    const content = document.querySelector('#newPostModal textarea').value;

    // Ajouter le nouveau post (simulation)
    const newPost = {
        id: samplePosts.length + 1,
        title: title,
        content: content,
        author: authManager.currentUser.name,
        subject: "Général",
        category: "Question",
        level: "Lycée",
        date: "À l'instant",
        replies: 0,
        likes: 0
    };

    samplePosts.unshift(newPost);
    loadForumPosts();
    closeModal('newPostModal');
    showNotification('Post publié avec succès !', 'success');
}

function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authManager.currentUser) {
        authButtons.innerHTML = `
            <span style="color: rgba(255,255,255,0.9);">Bonjour, ${authManager.currentUser.name}</span>
            <button class="btn btn-outline" onclick="logout()">Déconnexion</button>
        `;

        // Rendre les sections authentifiées disponibles
        document.querySelectorAll('.auth-required').forEach(link => {
            link.classList.add('available');
        });

        // Afficher la section admin si l'utilisateur est admin
        if (authManager.currentUser.type === 'admin') {
            document.querySelectorAll('.admin-only').forEach(link => {
                link.classList.add('visible');
            });
        }

        // Mettre à jour le profil
        updateProfileSection();
    }
}

// Chargement des annales
function loadAnnalesOriginal() {
    const annalesGrid = document.getElementById('annalesGrid');
    if (annalesGrid) {
        annalesGrid.innerHTML = sampleAnnales.map(annale => createAnnaleHTML(annale)).join('');
    }
}

function createAnnaleHTML(annale) {
    return `
        <div class="annale-card">
            <div class="annale-header">
                <div>
                    <h3 class="annale-title">${annale.title}</h3>
                    <div class="annale-details">
                        <div>${annale.exam} • ${annale.subject}</div>
                        <div>${annale.pages} pages • ${annale.difficulty}</div>
                    </div>
                </div>
                <span class="annale-year">${annale.year}</span>
            </div>
            <p style="color: #718096; margin-bottom: 1rem;">${annale.description}</p>
            <div class="annale-actions">
                <button class="btn-download" onclick="downloadAnnale(${annale.id})">
                    📥 Télécharger
                </button>
                <button class="btn-preview" onclick="previewAnnale(${annale.id})">
                    👁️ Aperçu
                </button>
            </div>
        </div>
    `;
}

// Chargement des métiers
function loadMetiersOriginal() {
    const metiersGrid = document.getElementById('metiersGrid');
    if (metiersGrid) {
        const filteredMetiers = currentMetierCategory === 'tous'
            ? sampleMetiers
            : sampleMetiers.filter(metier => metier.category === currentMetierCategory);

        metiersGrid.innerHTML = filteredMetiers.map(metier => createMetierHTML(metier)).join('');
    }
}

function createMetierHTML(metier) {
    return`
        <div class="metier-card" onclick="openMetierDetails(${metier.id})">
            <div class="metier-icon">${metier.icon}</div>
            <h3 class="metier-title">${metier.title}</h3>
            <p class="metier-description">${metier.description}</p>
            <div class="metier-details">
                ${metier.competences.map(comp => `<span class="metier-tag">${comp}</span>`).join('')}
            </div>
            <div class="metier-salary">${metier.salaire}</div>
        </div>
    `;
}

function showMetierCategory(category, buttonElement = null) {
    currentMetierCategory = category;

    // Mettre à jour les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback pour trouver le bon bouton
        const targetButton = document.querySelector(`[onclick*="${category}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Recharger les métiers
    loadMetiers();
}

function downloadAnnale(annaleId) {
    const annale = sampleAnnales.find(a => a.id === annaleId);
    showNotification(`Téléchargement de "${annale.title}" en cours...`, 'info');
}

function previewAnnale(annaleId) {
    const annale = sampleAnnales.find(a => a.id === annaleId);
    showNotification(`Aperçu de "${annale.title}" ouvert`, 'info');
}

function openMetierDetails(metierId) {
    const metier = sampleMetiers.find(m => m.id === metierId);
    showNotification(`Détails du métier "${metier.title}" - Formation: ${metier.formation}`, 'info');
}

function logout() {
    authManager.currentUser = null;
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button class="btn btn-outline" onclick="showLogin()">Connexion</button>
        <button class="btn btn-primary" onclick="showRegister()">S'inscrire</button>
    `;

    // Masquer les sections authentifiées
    document.querySelectorAll('.auth-required').forEach(link => {
        link.classList.remove('available');
    });

    // Rediriger vers l'accueil si on était sur une section authentifiée
    if (appCurrentSection === 'annales' || appCurrentSection === 'metiers') {
        showSection('accueil');
    }

    showNotification('Déconnexion réussie', 'info');
}

function contactMentor(mentorId) {
    if (!authManager.getCurrentUser()) {
        showLogin();
        return;
    }

    const mentor = sampleMentors.find(m => m.id === mentorId);
    showNotification(`Demande de contact envoyée à ${mentor.name}`, 'success');
}

// Fonctions de gestion du profil
function updateProfileSection() {
    const profileContent = document.getElementById('profileContent');
    if (!authManager.getCurrentUser()) {
        if (profileContent) {
            profileContent.innerHTML = '<p class="text-center">Connectez-vous pour voir votre profil</p>';
        }
        return;
    }

    const user = authManager.currentUser;
    if (profileContent) {
        profileContent.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar-display">
                        ${user.photo ? `<img src="${user.photo}" alt="Photo de profil">` : '👤'}
                    </div>
                    <h2 class="profile-name">${user.name}</h2>
                    <span class="profile-type">${getUserTypeLabel(user.type)}</span>
                </div>

                <div class="profile-info">
                    <div class="profile-section">
                        <h3>📝 À propos</h3>
                        <div class="profile-bio">
                            ${user.bio || 'Aucune biographie renseignée.'}
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>📋 Informations</h3>
                        <div class="profile-details">
                            <div class="detail-item">
                                <div class="detail-icon">📧</div>
                                <div class="detail-content">
                                    <div class="detail-label">Email</div>
                                    <div class="detail-value">${user.email}</div>
                                </div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-icon">🎓</div>
                                <div class="detail-content">
                                    <div class="detail-label">Niveau</div>
                                    <div class="detail-value">${getEducationLevelLabel(user.educationLevel)}</div>
                                </div>
                            </div>
                            ${user.institution ? `
                            <div class="detail-item">
                                <div class="detail-icon">🏫</div>
                                <div class="detail-content">
                                    <div class="detail-label">Établissement</div>
                                    <div class="detail-value">${user.institution}</div>
                                </div>
                            </div>
                            ` : ''}
                            ${user.location ? `
                            <div class="detail-item">
                                <div class="detail-icon">📍</div>
                                <div class="detail-content">
                                    <div class="detail-label">Localisation</div>
                                    <div class="detail-value">${user.location}</div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    ${user.interests && user.interests.length > 0 ? `
                    <div class="profile-section">
                        <h3>🎯 Centres d'intérêt</h3>
                        <div class="interests-display">
                            ${user.interests.map(interest => `<span class="interest-badge">${getSubjectLabel(interest)}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="profile-section">
                        <h3>📊 Statistiques</h3>
                        <div class="profile-stats">
                            <div class="stat-item">
                                <span class="stat-number">${user.postsCount || 0}</span>
                                <span class="stat-label">Posts</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.commentsCount || 0}</span>
                                <span class="stat-label">Commentaires</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.helpedCount || 0}</span>
                                <span class="stat-label">Personnes aidées</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.reputationScore || 0}</span>
                                <span class="stat-label">Réputation</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button class="btn btn-primary btn-large" onclick="showEditProfile()">
                            ✏️ Modifier mon profil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function showEditProfile() {
    if (!authManager.getCurrentUser()) {
        showLogin();
        return;
    }

    // Pré-remplir le formulaire avec les données actuelles
    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');
    const editUserType = document.getElementById('editUserType');
    const editEducationLevel = document.getElementById('editEducationLevel');
    const editInstitution = document.getElementById('editInstitution');
    const editLocation = document.getElementById('editLocation');
    const editBio = document.getElementById('editBio');

    if (editFirstName) editFirstName.value = authManager.currentUser.firstName || '';
    if (editLastName) editLastName.value = authManager.currentUser.lastName || '';
    if (editEmail) editEmail.value = authManager.currentUser.email || '';
    if (editUserType) editUserType.value = authManager.currentUser.type || '';
    if (editEducationLevel) editEducationLevel.value = authManager.currentUser.educationLevel || '';
    if (editInstitution) editInstitution.value = authManager.currentUser.institution || '';
    if (editLocation) editLocation.value = authManager.currentUser.location || '';
    if (editBio) editBio.value = authManager.currentUser.bio || '';

    // Cocher les centres d'intérêt existants
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    interestCheckboxes.forEach(checkbox => {
        checkbox.checked = authManager.currentUser.interests && authManager.currentUser.interests.includes(checkbox.value);
    });

    // Afficher la photo actuelle
    const currentPhoto = document.getElementById('currentPhoto');
    if (currentPhoto && authManager.currentUser.photo) {
        currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${authManager.currentUser.photo}" alt="Photo actuelle">`;
    }

    document.getElementById('editProfileModal').style.display = 'block';
}

function handleProfileUpdate() {
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const email = document.getElementById('editEmail').value;
    const userType = document.getElementById('editUserType').value;
    const educationLevel = document.getElementById('editEducationLevel').value;
    const institution = document.getElementById('editInstitution').value;
    const location = document.getElementById('editLocation').value;
    const bio = document.getElementById('editBio').value;

    // Récupérer les centres d'intérêt sélectionnés
    const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
        .map(checkbox => checkbox.value);

    // Mettre à jour l'utilisateur actuel
    authManager.currentUser = {
        ...authManager.currentUser,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        type: userType,
        educationLevel,
        institution,
        location,
        bio,
        interests: selectedInterests
    };

    closeModal('editProfileModal');
    updateProfileSection();
    showNotification('Profil mis à jour avec succès !', 'success');
}

function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La photo ne doit pas dépasser 5 MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const photoUrl = e.target.result;

            // Mettre à jour l'aperçu
            const currentPhoto = document.getElementById('currentPhoto');
            if (currentPhoto) {
                currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${photoUrl}" alt="Nouvelle photo">`;
            }

            // Sauvegarder dans l'utilisateur actuel
            if (authManager.currentUser) {
                authManager.currentUser.photo = photoUrl;
            }
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    const currentPhoto = document.getElementById('currentPhoto');
    if (currentPhoto) {
        currentPhoto.querySelector('.profile-avatar-large').innerHTML = '👤';
    }

    if (authManager.currentUser) {
        authManager.currentUser.photo = null;
    }

    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.value = '';
    }
    showNotification('Photo supprimée', 'info');
}

function getUserTypeLabel(type) {
    switch(type) {
        case 'student': return 'Élève/Étudiant';
        case 'mentor': return 'Mentor';
        case 'admin': return 'Administrateur';
        default: return 'Utilisateur';
    }
}

function getEducationLevelLabel(level) {
    switch(level) {
        case 'college': return 'Collège';
        case 'lycee': return 'Lycée';
        case 'universite': return 'Université';
        case 'professionnel': return 'Professionnel';
        default: return 'Non spécifié';
    }
}

function getSubjectLabel(subject) {
    switch(subject) {
        case 'maths': return 'Mathématiques';
        case 'francais': return 'Français';
        case 'sciences': return 'Sciences';
        case 'histoire': return 'Histoire-Géo';
        case 'anglais': return 'Anglais';
        case 'informatique': return 'Informatique';
        default: return subject;
    }
}

function filterPosts(searchTerm) {
    const filteredPosts = samplePosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.subject.toLowerCase().includes(searchTerm)
    );

    const forumPosts = document.getElementById('forumPosts');
    if (forumPosts) {
        forumPosts.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
    }
}

// Chargement des résultats d'examens
function loadResultatsOriginal() {
    showExamResults('bac');
}

function showExamResults(examType, buttonElement = null) {
    currentExamType = examType;

    // Mettre à jour les boutons
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback pour trouver le bon bouton
        const targetButton = document.querySelector(`[onclick*="${examType}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Charger les résultats
    loadExamResults();
}

function loadExamResults() {
    const results = sampleResults[currentExamType] || [];
    const content = document.getElementById('resultatsContent');

    if (!content) return;

    // Afficher le loading
    content.innerHTML = `
        <div class="loading-results">
            <div class="loading-spinner"></div>
            <p>Chargement des résultats...</p>
        </div>
    `;

    // Simuler un délai de chargement
    setTimeout(() => {
        if (results.length === 0) {
            content.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">📋</div>
                    <h3>Aucun résultat disponible</h3>
                    <p>Les résultats pour cette catégorie ne sont pas encore disponibles.</p>
                </div>
            `;
        } else {
            content.innerHTML = createResultsTableHTML(results);
            updateResultsStats(results);
        }
    }, 1000);
}

function createResultsTableHTML(results) {
    const headers = getTableHeaders(currentExamType);

    return `
        <table class="resultats-table">
            <thead>
                <tr>
                    ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${results.map(result => createResultRowHTML(result)).join('')}
            </tbody>
        </table>
    `;
}

function getTableHeaders(examType) {
    switch(examType) {
        case 'bac':
            return ['Nom', 'Numéro', 'Série', 'Moyenne', 'Mention', 'Statut'];
        case 'bepc':
            return ['Nom', 'Numéro', 'Établissement', 'Moyenne', 'Mention', 'Statut'];
        case 'concours':
            return ['Nom', 'Numéro', 'École d\'origine', 'Note', 'Rang', 'Statut'];
        default:
            return [];
    }
}

function createResultRowHTML(result) {
    let specificCells = '';

    switch(currentExamType) {
        case 'bac':
            specificCells = `
                <td data-label="Série">${result.serie}</td>
                <td data-label="Moyenne">${result.moyenne}/20</td>
                <td data-label="Mention" class="result-mention">${result.mention}</td>
            `;
            break;
        case 'bepc':
            specificCells = `
                <td data-label="Établissement">${result.etablissement}</td>
                <td data-label="Moyenne">${result.moyenne}/20</td>
                <td data-label="Mention" class="result-mention">${result.mention}</td>
            `;
            break;
        case 'concours':
            specificCells = `
                <td data-label="École d'origine">${result.ecole_origine}</td>
                <td data-label="Note">${result.note}/20</td>
                <td data-label="Rang">${result.rang}</td>
            `;
            break;
    }

    return `
        <tr>
            <td data-label="Nom"><strong>${result.name}</strong></td>
            <td data-label="Numéro">${result.numero}</td>
            ${specificCells}
            <td data-label="Statut">
                <span class="result-status ${result.status}">
                    ${result.status === 'admitted' ? '✅ Admis' : '❌ Ajourné'}
                </span>
            </td>
        </tr>
    `;
}

function updateResultsStats(results) {
    const total = results.length;
    const admitted = results.filter(r => r.status === 'admitted').length;
    const successRate = total > 0 ? Math.round((admitted / total) * 100) : 0;

    const totalCandidatesEl = document.getElementById('totalCandidates');
    const admittedCandidatesEl = document.getElementById('admittedCandidates');
    const successRateEl = document.getElementById('successRate');

    if (totalCandidatesEl) totalCandidatesEl.textContent = total;
    if (admittedCandidatesEl) admittedCandidatesEl.textContent = admitted;
    if (successRateEl) successRateEl.textContent = successRate + '%';
}

function searchResults() {
    const searchInput = document.getElementById('studentSearch');
    const yearFilter = document.getElementById('yearFilter');
    const regionFilter = document.getElementById('regionFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const yearFilterValue = yearFilter ? yearFilter.value : '';
    const regionFilterValue = regionFilter ? regionFilter.value : '';

    let filteredResults = sampleResults[currentExamType] || [];

    // Filtrer par terme de recherche
    if (searchTerm) {
        filteredResults = filteredResults.filter(result =>
            result.name.toLowerCase().includes(searchTerm) ||
            result.numero.toLowerCase().includes(searchTerm)
        );
    }

    // Filtrer par année
    if (yearFilterValue) {
        filteredResults = filteredResults.filter(result => result.year === yearFilterValue);
    }

    // Filtrer par région
    if (regionFilterValue) {
        filteredResults = filteredResults.filter(result => result.region === regionFilterValue);
    }

    const content = document.getElementById('resultatsContent');
    if (!content) return;

    if (filteredResults.length === 0) {
        content.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>Aucun résultat trouvé</h3>
                <p>Aucun résultat ne correspond à vos critères de recherche.</p>
            </div>
        `;
    } else {
        content.innerHTML = createResultsTableHTML(filteredResults);
        updateResultsStats(filteredResults);
    }
}

// Fonctions d'administration
function showAdminTab(tabName, buttonElement = null) {
    currentAdminTab = tabName;

    // Mettre à jour les onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback pour trouver le bon bouton
        const targetButton = document.querySelector(`[onclick*="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Masquer tous les contenus
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });

    // Afficher le contenu demandé
    const targetContent = document.getElementById(`admin-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Charger les données selon l'onglet
    switch(tabName) {
        case 'dashboard':
            loadAdminDashboard();
            break;
        case 'users':
            loadAdminUsers();
            break;
        case 'posts':
            loadAdminPosts();
            break;
        case 'mentorships':
            loadAdminMentorships();
            break;
        case 'reports':
            loadAdminReports();
            break;
        case 'content':
            // Contenu déjà chargé statiquement
            break;
    }
}

async function loadAdminDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            const totalUsersEl = document.getElementById('totalUsers');
            const totalPostsEl = document.getElementById('totalPosts');
            const activeMentorshipsEl = document.getElementById('activeMentorships');
            const pendingReportsEl = document.getElementById('pendingReports');

            if (totalUsersEl) totalUsersEl.textContent = data.totalUsers || 0;
            if (totalPostsEl) totalPostsEl.textContent = data.totalPosts || 0;
            if (activeMentorshipsEl) activeMentorshipsEl.textContent = data.activeMentorships || 0;
            if (pendingReportsEl) pendingReportsEl.textContent = data.pendingReports || 0;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
    }
}

async function loadAdminUsers() {
    // Cette fonction sera gérée par la page admin elle-même
}

async function loadAdminPosts() {
    // Cette fonction sera gérée par la page admin elle-même
}

async function loadAdminMentorships() {
    // Cette fonction sera gérée par la page admin elle-même
}

async function loadAdminReports() {
    // Cette fonction sera gérée par la page admin elle-même
}

function loadAdminDashboardOriginal() {
    const totalUsersEl = document.getElementById('totalUsers');
    const totalPostsEl = document.getElementById('totalPosts');
    const activeMentorshipsEl = document.getElementById('activeMentorships');
    const pendingReportsEl = document.getElementById('pendingReports');

    if (totalUsersEl) totalUsersEl.textContent = adminUsers.length;
    if (totalPostsEl) totalPostsEl.textContent = samplePosts.length;
    if (activeMentorshipsEl) activeMentorshipsEl.textContent = adminMentorships.filter(m => m.status === 'active').length;
    if (pendingReportsEl) pendingReportsEl.textContent = adminReports.filter(r => r.status === 'pending').length;

    // Charger l'activité récente
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
        recentActivity.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                    <div class="activity-text">Nouvel utilisateur inscrit : Amina K.</div>
                    <div class="activity-time">Il y a 2 heures</div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                    <div class="activity-text">Nouveau post publié dans le forum</div>
                    <div class="activity-time">Il y a 4 heures</div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">🎓</div>
                <div class="activity-content">
                    <div class="activity-text">Nouvelle relation de mentorat créée</div>
                    <div class="activity-time">Il y a 1 jour</div>
                </div>
            </div>
        `;
    }

    // Charger la distribution par niveau
    const levelDistribution = document.getElementById('levelDistribution');
    if (levelDistribution) {
        levelDistribution.innerHTML = `
            <div class="level-item">
                <span>Collège</span>
                <div class="level-bar">
                    <div class="level-fill" style="width: 25%"></div>
                </div>
                <span>25%</span>
            </div>
            <div class="level-item">
                <span>Lycée</span>
                <div class="level-bar">
                    <div class="level-fill" style="width: 45%"></div>
                </div>
                <span>45%</span>
            </div>
            <div class="level-item">
                <span>Université</span>
                <div class="level-bar">
                    <div class="level-fill" style="width: 20%"></div>
                </div>
                <span>20%</span>
            </div>
            <div class="level-item">
                <span>Professionnel</span>
                <div class="level-bar">
                    <div class="level-fill" style="width: 10%"></div>
                </div>
                <span>10%</span>
            </div>
        `;
    }
}

function loadAdminUsersOriginal() {
    const tableBody = document.getElementById('usersTableBody');
    if (tableBody) {
        tableBody.innerHTML = adminUsers.map(user => `
            <tr>
                <td>
                    <div class="user-avatar-table">${user.avatar}</div>
                </td>
                <td><strong>${user.firstName} ${user.lastName}</strong></td>
                <td>${user.email}</td>
                <td>${getUserTypeLabel(user.type)}</td>
                <td>${getEducationLevelLabel(user.educationLevel)}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Banni'}
                    </span>
                </td>
                <td>${new Date(user.joinDate).toLocaleDateString('fr-FR')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewUser(${user.id})" title="Voir">👁️</button>
                        <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Modifier">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Supprimer">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function loadAdminPostsOriginal() {
    const postsGrid = document.getElementById('adminPostsGrid');
    if (postsGrid) {
        postsGrid.innerHTML = samplePosts.map(post => `
            <div class="post-card-admin">
                <div class="post-header-admin">
                    <div>
                        <h3 class="post-title-admin">${post.title}</h3>
                        <div class="post-meta-admin">
                            Par ${post.author} • ${post.date} • ${post.level}
                        </div>
                    </div>
                    <span class="post-category">${post.subject}</span>
                </div>
                <div class="post-content-admin">${post.content}</div>
                <div class="post-actions-admin">
                    <div class="post-stats">
                        <span>👍 ${post.likes}</span>
                        <span>💬 ${post.replies}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewPost(${post.id})" title="Voir">👁️</button>
                        <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Modifier">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Supprimer">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function loadAdminMentorshipsOriginal() {
    const tableBody = document.getElementById('mentorshipsTableBody');
    if (tableBody) {
        tableBody.innerHTML = adminMentorships.map(mentorship => `
            <tr>
                <td><strong>${mentorship.mentor}</strong></td>
                <td>${mentorship.student}</td>
                <td>${mentorship.subject}</td>
                <td>
                    <span class="status-badge status-${mentorship.status}">
                        ${mentorship.status === 'active' ? 'Actif' : mentorship.status === 'pending' ? 'En attente' : 'Terminé'}
                    </span>
                </td>
                <td>${new Date(mentorship.startDate).toLocaleDateString('fr-FR')}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px;">
                            <div style="width: ${mentorship.progress}%; height: 100%; background: #10b981; border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 0.8rem;">${mentorship.progress}%</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewMentorship(${mentorship.id})" title="Voir">👁️</button>
                        <button class="btn-icon btn-edit" onclick="editMentorship(${mentorship.id})" title="Modifier">✏️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function loadAdminReportsOriginal() {
    const reportsList = document.getElementById('reportsList');
    if (reportsList) {
        reportsList.innerHTML = adminReports.map(report => `
            <div class="report-card ${report.urgent ? 'urgent' : ''} ${report.status === 'resolved' ? 'resolved' : ''}">
                <div class="report-header">
                    <div>
                        <span class="report-type">${report.type === 'spam' ? 'Spam' : report.type === 'inappropriate' ? 'Contenu inapproprié' : 'Harcèlement'}</span>
                        <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #6b7280;">
                            Signalé par ${report.reporter} • ${new Date(report.date).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                    <span class="status-badge status-${report.status}">
                        ${report.status === 'pending' ? 'En attente' : report.status === 'resolved' ? 'Traité' : 'Rejeté'}
                    </span>
                </div>
                <div class="report-content">${report.content}</div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="resolveReport(${report.id})">Traiter</button>
                    <button class="btn btn-outline" onclick="dismissReport(${report.id})">Rejeter</button>
                    <button class="btn btn-outline" onclick="viewReportDetails(${report.id})">Détails</button>
                </div>
            </div>
        `).join('');
    }
}

// Fonctions d'action admin
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function editUser(userId) {
    const user = adminUsers.find(u => u.id === userId);
    if (user) {
        const editUserId = document.getElementById('editUserId');
        const editUserFirstName = document.getElementById('editUserFirstName');
        const editUserLastName = document.getElementById('editUserLastName');
        const editUserEmail = document.getElementById('editUserEmail');
        const editUserTypeAdmin = document.getElementById('editUserTypeAdmin');
        const editUserStatus = document.getElementById('editUserStatus');

        if (editUserId) editUserId.value = user.id;
        if (editUserFirstName) editUserFirstName.value = user.firstName;
        if (editUserLastName) editUserLastName.value = user.lastName;
        if (editUserEmail) editUserEmail.value = user.email;
        if (editUserTypeAdmin) editUserTypeAdmin.value = user.type;
        if (editUserStatus) editUserStatus.value = user.status;

        document.getElementById('editUserModal').style.display = 'block';
    }
}

function deleteUser(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')){
        const index = adminUsers.findIndex(u => u.id === userId);
        if (index > -1) {
            adminUsers.splice(index, 1);
            loadAdminUsers();
            showNotification('Utilisateur supprimé avec succès', 'success');
        }
    }
}

function viewUser(userId) {
    const user = adminUsers.find(u => u.id === userId);
    if (user) {
        showNotification(`Consultation du profil de ${user.firstName} ${user.lastName}`, 'info');
    }
}

function viewPost(postId) {
    showNotification(`Consultation du post #${postId}`, 'info');
}

function editPost(postId) {
    showNotification(`Édition du post #${postId}`, 'info');
}

function deletePost(postId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
        const index = samplePosts.findIndex(p => p.id === postId);
        if (index > -1) {
            samplePosts.splice(index, 1);
            loadAdminPosts();
            showNotification('Post supprimé avec succès', 'success');
        }
    }
}

function viewMentorship(mentorshipId) {
    showNotification(`Consultation du mentorat #${mentorshipId}`, 'info');
}

function editMentorship(mentorshipId) {
    showNotification(`Édition du mentorat #${mentorshipId}`, 'info');
}

function resolveReport(reportId) {
    const report = adminReports.find(r => r.id === reportId);
    if (report) {
        report.status = 'resolved';
        loadAdminReports();
        showNotification('Signalement traité avec succès', 'success');
    }
}

function dismissReport(reportId) {
    const report = adminReports.find(r => r.id === reportId);
    if (report) {
        report.status = 'dismissed';
        loadAdminReports();
        showNotification('Signalement rejeté', 'info');
    }
}

function viewReportDetails(reportId) {
    showNotification(`Détails du signalement #${reportId}`, 'info');
}

function manageAnnales() {
    showNotification('Gestion des annales - Fonctionnalité en développement', 'info');
}

function manageMetiers() {
    showNotification('Gestion des métiers - Fonctionnalité en développement', 'info');
}

function manageResultats() {
    showNotification('Gestion des résultats - Fonctionnalité en développement', 'info');
}

function manageSubjects() {
    showNotification('Gestion des matières - Fonctionnalité en développement', 'info');
}

function displayForumPosts(posts) {
    const forumPosts = document.getElementById('forumPosts');
    if (forumPosts) {
        forumPosts.innerHTML = posts.map(post => createPostHTML(post)).join('');
    }
}

function displayMentors(mentors) {
    const mentorsGrid = document.getElementById('mentors');
    if (mentorsGrid) {
        mentorsGrid.innerHTML = mentors.map(mentor => createMentorHTML(mentor)).join('');
    }
}

function displayAnnales(annales) {
     const annalesGrid = document.getElementById('annalesGrid');
     if (annalesGrid) {
         annalesGrid.innerHTML = annales.map(annale => createAnnaleHTML(annale)).join('');
     }
}

function displayCareers(careers) {
    const metiersGrid = document.getElementById('metiersGrid');
    if (metiersGrid) {
        metiersGrid.innerHTML = careers.map(career => createMetierHTML(career)).join('');
    }
}

function displayUserProfile(profile) {
    const profileSection = document.getElementById('profil');
    if (profileSection) {
        profileSection.innerHTML = `<h2>Profil de ${profile.name}</h2><p>Email: ${profile.email}</p>`;
    }
}

function displayAdminDashboard(stats) {
    const adminDashboard = document.getElementById('admin');
    if (adminDashboard) {
        adminDashboard.innerHTML = `<h2>Dashboard Admin</h2><p>Total Users: ${stats.totalUsers}</p>`;
    }
}

function updateAccueilStats(stats) {
    const accueilSection = document.getElementById('accueil');
    if (accueilSection) {
        accueilSection.innerHTML = `<h2>Bienvenue sur LEWO</h2><p>Total Posts: ${stats.totalPosts}</p>`;
    }
}

function setupResultatsSearch() {
    const searchForm = document.getElementById('resultatsSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentName = document.getElementById('studentName').value;
            const studentNumber = document.getElementById('studentNumber').value;
            const examType = document.getElementById('examType').value;
            const examYear = document.getElementById('examYear').value;

            // Effectuer la recherche (simulée ici)
            const results = searchExamResults(studentName, studentNumber, examType, examYear);
            displayExamResults(results);
        });
    }
}

function searchExamResults(studentName, studentNumber, examType, examYear) {
    // Simuler la recherche de résultats
    let results = sampleResults[examType] || [];

    if (studentName) {
        results = results.filter(result => result.name.toLowerCase().includes(studentName.toLowerCase()));
    }

    if (studentNumber) {
        results = results.filter(result => result.numero.toLowerCase().includes(studentNumber.toLowerCase()));
    }

    if (examYear) {
        results = results.filter(result => result.year === examYear);
    }

    return results;
}

function displayExamResults(results) {
    const resultsContainer = document.getElementById('resultatsResults');
    if (resultsContainer) {
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
        } else {
            let html = '<ul>';
            results.forEach(result => {
                html += `<li>${result.name} - ${result.numero} - ${result.mention}</li>`;
            });
            html += '</ul>';
            resultsContainer.innerHTML = html;
        }
    }
}

// Gestionnaires d'événements
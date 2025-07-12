// Utilitaires globaux
let currentSection = 'accueil';

// Gestion d'erreur globale
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    return true;
});

// Navigation
function showSection(sectionName) {
    if ((sectionName === 'annales' || sectionName === 'metiers' || sectionName === 'resultats') && !authManager.getCurrentUser()) {
        showNotification('Veuillez vous connecter pour accéder à cette section', 'error');
        showLogin();
        return;
    }

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionName) {
            link.classList.add('active');
        }
    });

    currentSection = sectionName;
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

// Module utilitaires
function showNotification(message, type = 'info') {
    // Créer une notification toast
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Suppression automatique
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchToRegister() {
    closeModal('loginModal');
    showRegister();
}

function switchToLogin() {
    closeModal('registerModal');
    showLogin();
}

// Fonctions globales pour les événements
function handleLogin() {
    authManager.handleLogin();
}

function handleRegister() {
    authManager.handleRegister();
}

function handleNewPost() {
    forumManager.handleNewPost();
}

function handleProfileUpdate() {
    profileManager.handleProfileUpdate();
}

function handlePhotoChange(event) {
    profileManager.handlePhotoChange(event);
}

function removePhoto() {
    profileManager.removePhoto();
}

function showMetierCategory(category, buttonElement) {
    contentManager.showMetierCategory(category, buttonElement);
}

function showExamResults(examType, buttonElement) {
    contentManager.showExamResults(examType, buttonElement);
}

function searchResults() {
    contentManager.searchResults();
}

function showAdminTab(tabName, buttonElement) {
    adminManager.showAdminTab(tabName, buttonElement);
}

// Gestionnaires d'événements po// Configuration pour les formulaires
function setupFormHandlers() {
    const loginForm = document.querySelector('#loginModal .auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    const registerForm = document.querySelector('#registerModal .auth-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }

    const postForm = document.querySelector('#newPostModal .post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewPost();
        });
    }

    const profileForm = document.querySelector('#profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleProfileUpdate();
        });
    }

    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            handlePhotoChange(e);
        });
    }
}

// Initialisation
function initializeApp() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    setupFormHandlers();
}
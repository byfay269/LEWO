
// Module d'authentification
const authManager = {
    currentUser: null,

    init() {
        this.setupFormHandlers();
    },

    setupFormHandlers() {
        // Formulaire de connexion
        const loginForm = document.querySelector('#loginModal .auth-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Formulaire d'inscription
        const registerForm = document.querySelector('#registerModal .auth-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    },

    handleLogin() {
        const email = document.querySelector('#loginModal input[type="email"]').value;

        this.currentUser = {
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
        this.updateAuthButtons();
        showNotification('Connexion réussie !', 'success');
    },

    handleRegister() {
        const firstname = document.querySelector('#registerModal input[placeholder="Prénom"]').value;
        const lastname = document.querySelector('#registerModal input[placeholder="Nom"]').value;
        const email = document.querySelector('#registerModal input[type="email"]').value;
        const userType = document.querySelector('#registerModal select').value;
        const educationLevel = document.querySelectorAll('#registerModal select')[1].value;

        this.currentUser = {
            email: email,
            firstName: firstname,
            lastName: lastname,
            name: `${firstname} ${lastname}`,
            type: userType,
            educationLevel: educationLevel,
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

        closeModal('registerModal');
        this.updateAuthButtons();
        showNotification('Inscription réussie ! Bienvenue sur LEWO !', 'success');
    },

    updateAuthButtons() {
        const authButtons = document.querySelector('.auth-buttons');
        if (this.currentUser) {
            authButtons.innerHTML = `
                <span style="color: rgba(255,255,255,0.9);">Bonjour, ${this.currentUser.name}</span>
                <button class="btn btn-outline" onclick="authManager.logout()">Déconnexion</button>
            `;

            // Rendre les sections authentifiées disponibles
            document.querySelectorAll('.auth-required').forEach(link => {
                link.classList.add('available');
            });

            // Afficher la section admin si l'utilisateur est admin
            if (this.currentUser.type === 'admin') {
                document.querySelectorAll('.admin-only').forEach(link => {
                    link.classList.add('visible');
                });
            }
        }
    },

    logout() {
        this.currentUser = null;
        const authButtons = document.querySelector('.auth-buttons');
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showLogin()">Connexion</button>
            <button class="btn btn-primary" onclick="showRegister()">S'inscrire</button>
        `;

        // Masquer les sections authentifiées
        document.querySelectorAll('.auth-required').forEach(link => {
            link.classList.remove('available');
        });

        showNotification('Déconnexion réussie', 'info');
    }
};

// Fonctions globales pour la compatibilité
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

function switchToRegister() {
    closeModal('loginModal');
    showRegister();
}

function switchToLogin() {
    closeModal('registerModal');
    showLogin();
}


// Module d'authentification
class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    handleLogin() {
        // Simulation de connexion
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
    }

    handleRegister() {
        // Simulation d'inscription
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
            bio: "Bienvenue sur LEWO ! N'hésitez pas à compléter votre profil pour mieux vous faire connaître de la communauté.",
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
    }

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

            // Mettre à jour le profil
            if (window.profileManager) {
                window.profileManager.updateProfileSection();
            }
        }
    }

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

        // Rediriger vers l'accueil si on était sur une section authentifiée
        if (window.currentSection === 'annales' || window.currentSection === 'metiers') {
            showSection('accueil');
        }

        showNotification('Déconnexion réussie', 'info');
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Instance globale
const authManager = new AuthManager();


// Gestion des profils utilisateurs
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.isEditing = false;
    }

    async loadProfile() {
        if (!authManager.isLoggedIn()) {
            this.showLoginPrompt();
            return;
        }

        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${authManager.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.displayProfile();
            } else {
                showNotification('Erreur lors du chargement du profil', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.displayDemoProfile();
        }
    }

    showLoginPrompt() {
        const content = document.getElementById('profileContent');
        if (content) {
            content.innerHTML = `
                <div class="login-prompt">
                    <div class="prompt-icon">🔐</div>
                    <h3>Connexion requise</h3>
                    <p>Connectez-vous pour voir et modifier votre profil</p>
                    <div class="prompt-actions">
                        <button class="btn btn-primary" onclick="showLogin()">Se connecter</button>
                        <button class="btn btn-outline" onclick="showRegister()">S'inscrire</button>
                    </div>
                </div>
            `;
        }
    }

    displayDemoProfile() {
        this.currentUser = {
            id: 1,
            email: "demo@lewo.km",
            user_type: "student",
            first_name: "Utilisateur",
            last_name: "Demo",
            education_level: "lycee",
            institution: "Lycée Demo",
            bio: "Profil de démonstration",
            location: "Moroni, Comores",
            preferences: {},
            subjects: ["Mathématiques", "Français"],
            mentorships_count: 2,
            posts_count: 5,
            created_at: new Date().toISOString()
        };
        this.displayProfile();
    }

    displayProfile() {
        const content = document.getElementById('profileContent');
        if (!content) return;

        const levelLabels = {
            'college': 'Collège',
            'lycee': 'Lycée',
            'universite': 'Université',
            'professionnel': 'Professionnel'
        };

        const typeLabels = {
            'student': 'Étudiant',
            'mentor': 'Mentor',
            'admin': 'Administrateur'
        };

        content.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${this.currentUser.avatar_url ? 
                            `<img src="${this.currentUser.avatar_url}" alt="Avatar">` : 
                            `<div class="avatar-placeholder">👤</div>`
                        }
                        <button class="avatar-edit-btn" onclick="profileManager.editAvatar()">✏️</button>
                    </div>
                    <div class="profile-info">
                        <h2>${this.currentUser.first_name || ''} ${this.currentUser.last_name || ''}</h2>
                        <p class="profile-email">${this.currentUser.email}</p>
                        <div class="profile-badges">
                            <span class="badge badge-type">${typeLabels[this.currentUser.user_type] || this.currentUser.user_type}</span>
                            <span class="badge badge-level">${levelLabels[this.currentUser.education_level] || this.currentUser.education_level}</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="profileManager.toggleEdit()">
                            ${this.isEditing ? '💾 Sauvegarder' : '✏️ Modifier'}
                        </button>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        <h3>📋 Informations personnelles</h3>
                        <div class="info-grid">
                            ${this.createInfoField('Institution', 'institution', this.currentUser.institution)}
                            ${this.createInfoField('Localisation', 'location', this.currentUser.location)}
                            ${this.createInfoField('Biographie', 'bio', this.currentUser.bio, 'textarea')}
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>📚 Matières d'intérêt</h3>
                        <div class="subjects-container">
                            ${this.displaySubjects()}
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>📊 Statistiques</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">${this.currentUser.mentorships_count || 0}</div>
                                <div class="stat-label">Mentorships</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${this.currentUser.posts_count || 0}</div>
                                <div class="stat-label">Posts</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${this.calculateDaysActive()}</div>
                                <div class="stat-label">Jours actif</div>
                            </div>
                        </div>
                    </div>

                    ${this.currentUser.user_type === 'mentor' ? this.displayMentorSection() : ''}
                    ${this.currentUser.user_type === 'student' ? this.displayStudentSection() : ''}
                </div>
            </div>
        `;
    }

    createInfoField(label, field, value, type = 'text') {
        if (this.isEditing) {
            if (type === 'textarea') {
                return `
                    <div class="info-field">
                        <label>${label}</label>
                        <textarea name="${field}" placeholder="${label}">${value || ''}</textarea>
                    </div>
                `;
            } else {
                return `
                    <div class="info-field">
                        <label>${label}</label>
                        <input type="${type}" name="${field}" value="${value || ''}" placeholder="${label}">
                    </div>
                `;
            }
        } else {
            return `
                <div class="info-field">
                    <label>${label}</label>
                    <span class="info-value">${value || 'Non renseigné'}</span>
                </div>
            `;
        }
    }

    displaySubjects() {
        const subjects = this.currentUser.subjects || [];
        
        if (this.isEditing) {
            return `
                <div class="subjects-edit">
                    <div class="available-subjects">
                        <label>Matières disponibles:</label>
                        <div class="subject-checkboxes">
                            ${['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Philosophie'].map(subject => `
                                <label class="checkbox-label">
                                    <input type="checkbox" value="${subject}" ${subjects.includes(subject) ? 'checked' : ''}>
                                    ${subject}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="subjects-display">
                    ${subjects.length > 0 ? 
                        subjects.map(subject => `<span class="subject-tag">${subject}</span>`).join('') :
                        '<p class="empty-message">Aucune matière sélectionnée</p>'
                    }
                </div>
            `;
        }
    }

    displayMentorSection() {
        return `
            <div class="profile-section">
                <h3>🎓 Espace Mentor</h3>
                <div class="mentor-dashboard">
                    <div class="dashboard-item">
                        <h4>Mes élèves</h4>
                        <p>Gérez vos relations de mentorat</p>
                        <button class="btn btn-outline" onclick="showMentorDashboard()">Voir le tableau de bord</button>
                    </div>
                    <div class="dashboard-item">
                        <h4>Demandes en attente</h4>
                        <p>Nouvelles demandes de mentorat</p>
                        <button class="btn btn-outline" onclick="showPendingRequests()">Voir les demandes</button>
                    </div>
                </div>
            </div>
        `;
    }

    displayStudentSection() {
        return `
            <div class="profile-section">
                <h3>🎒 Espace Étudiant</h3>
                <div class="student-dashboard">
                    <div class="dashboard-item">
                        <h4>Mes mentors</h4>
                        <p>Vos relations de mentorat actuelles</p>
                        <button class="btn btn-outline" onclick="showMyMentors()">Voir mes mentors</button>
                    </div>
                    <div class="dashboard-item">
                        <h4>Mes progrès</h4>
                        <p>Suivez votre évolution</p>
                        <button class="btn btn-outline" onclick="showProgress()">Voir les progrès</button>
                    </div>
                </div>
            </div>
        `;
    }

    calculateDaysActive() {
        if (!this.currentUser.created_at) return 0;
        const createdDate = new Date(this.currentUser.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    toggleEdit() {
        if (this.isEditing) {
            this.saveProfile();
        } else {
            this.isEditing = true;
            this.displayProfile();
        }
    }

    async saveProfile() {
        const form = document.querySelector('.profile-container');
        const formData = new FormData();
        
        // Collecter les données du formulaire
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                // Gérer les matières
                if (input.checked) {
                    if (!formData.has('subjects')) {
                        formData.set('subjects', input.value);
                    } else {
                        formData.set('subjects', formData.get('subjects') + ',' + input.value);
                    }
                }
            } else if (input.name) {
                formData.set(input.name, input.value);
            }
        });

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authManager.getToken()}`
                },
                body: formData
            });

            if (response.ok) {
                showNotification('Profil mis à jour !', 'success');
                this.isEditing = false;
                this.loadProfile();
            } else {
                const error = await response.json();
                showNotification(error.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    editAvatar() {
        showNotification('Modification d\'avatar - Fonctionnalité en cours de développement', 'info');
    }
}

// Instance globale
let profileManager;

// Fonctions globales
function showMentorDashboard() {
    showNotification('Tableau de bord mentor - Fonctionnalité en cours de développement', 'info');
}

function showPendingRequests() {
    showNotification('Demandes en attente - Fonctionnalité en cours de développement', 'info');
}

function showMyMentors() {
    showNotification('Mes mentors - Fonctionnalité en cours de développement', 'info');
}

function showProgress() {
    showNotification('Suivi des progrès - Fonctionnalité en cours de développement', 'info');
}

// Initialisation
function initializeProfile() {
    if (!profileManager) {
        profileManager = new ProfileManager();
    }
    profileManager.loadProfile();
}

// Exposition des fonctions
window.showMentorDashboard = showMentorDashboard;
window.showPendingRequests = showPendingRequests;
window.showMyMentors = showMyMentors;
window.showProgress = showProgress;

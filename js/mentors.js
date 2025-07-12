
// Gestion des mentors
class MentorsManager {
    constructor() {
        this.mentors = [];
        this.currentFilters = {
            subject: '',
            level: '',
            availability: ''
        };
    }

    async loadMentors() {
        try {
            const params = new URLSearchParams();
            Object.entries(this.currentFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`/api/mentorships/mentors?${params}`, {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.mentors = data.mentors;
                this.displayMentors();
            } else {
                this.displayDemoMentors();
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.displayDemoMentors();
        }
    }

    displayDemoMentors() {
        const demoMentors = [
            {
                id: 1,
                first_name: "Ahmed",
                last_name: "Hassan",
                bio: "Professeur de mathématiques avec 10 ans d'expérience",
                education_level: "professionnel",
                institution: "Université des Comores",
                subjects: ["Mathématiques", "Physique"],
                rating: 4.8,
                mentorships_count: 15,
                availability: "Disponible",
                avatar_url: null
            },
            {
                id: 2,
                first_name: "Aïcha",
                last_name: "Saïd",
                bio: "Professeure de français passionnée par la littérature",
                education_level: "professionnel",
                institution: "Lycée Said Mohamed Cheikh",
                subjects: ["Français", "Littérature"],
                rating: 4.9,
                mentorships_count: 22,
                availability: "Disponible",
                avatar_url: null
            },
            {
                id: 3,
                first_name: "Omar",
                last_name: "Abdallah",
                bio: "Étudiant en médecine, spécialisé en sciences",
                education_level: "universite",
                institution: "Faculté de Médecine",
                subjects: ["Biologie", "Chimie", "Sciences"],
                rating: 4.6,
                mentorships_count: 8,
                availability: "Limité",
                avatar_url: null
            }
        ];

        this.mentors = demoMentors;
        this.displayMentors();
    }

    displayMentors() {
        const grid = document.getElementById('mentorsGrid');
        if (!grid) return;

        if (this.mentors.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Aucun mentor trouvé</h3>
                    <p>Aucun mentor ne correspond à vos critères de recherche.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.mentors.map(mentor => this.createMentorHTML(mentor)).join('');
    }

    createMentorHTML(mentor) {
        const levelLabels = {
            'college': 'Collège',
            'lycee': 'Lycée',
            'universite': 'Université',
            'professionnel': 'Professionnel'
        };

        const availabilityColors = {
            'Disponible': 'success',
            'Limité': 'warning',
            'Occupé': 'error'
        };

        return `
            <div class="mentor-card">
                <div class="mentor-header">
                    <div class="mentor-avatar">
                        ${mentor.avatar_url ? 
                            `<img src="${mentor.avatar_url}" alt="${mentor.first_name}">` : 
                            `<div class="avatar-placeholder">👤</div>`
                        }
                    </div>
                    <div class="mentor-info">
                        <h3>${mentor.first_name} ${mentor.last_name}</h3>
                        <p class="mentor-level">${levelLabels[mentor.education_level] || mentor.education_level}</p>
                        <p class="mentor-institution">${mentor.institution}</p>
                    </div>
                    <div class="mentor-status">
                        <span class="availability-badge ${availabilityColors[mentor.availability] || 'default'}">
                            ${mentor.availability || 'Non spécifié'}
                        </span>
                    </div>
                </div>

                <div class="mentor-bio">
                    <p>${mentor.bio || 'Aucune biographie disponible.'}</p>
                </div>

                <div class="mentor-subjects">
                    <h4>Spécialisations:</h4>
                    <div class="subjects-tags">
                        ${(mentor.subjects || []).map(subject => 
                            `<span class="subject-tag">${subject}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="mentor-stats">
                    <div class="stat">
                        <span class="stat-value">${mentor.rating || 'N/A'}</span>
                        <span class="stat-label">⭐ Note</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${mentor.mentorships_count || 0}</span>
                        <span class="stat-label">👥 Élèves</span>
                    </div>
                </div>

                <div class="mentor-actions">
                    ${authManager.isLoggedIn() ? `
                        ${authManager.getCurrentUser()?.user_type === 'student' ? `
                            <button class="btn btn-primary" onclick="requestMentorship(${mentor.id})">
                                🤝 Demander mentorat
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="viewMentorProfile(${mentor.id})">
                            👁️ Voir profil
                        </button>
                        <button class="btn btn-outline" onclick="contactMentor(${mentor.id})">
                            💬 Contacter
                        </button>
                    ` : `
                        <p class="auth-required-msg">Connectez-vous pour contacter ce mentor</p>
                    `}
                </div>
            </div>
        `;
    }

    async requestMentorship(mentorId) {
        if (!authManager.isLoggedIn()) {
            showNotification('Connectez-vous pour demander un mentorat', 'error');
            return;
        }

        if (authManager.getCurrentUser()?.user_type !== 'student') {
            showNotification('Seuls les étudiants peuvent demander un mentorat', 'error');
            return;
        }

        const modalContent = `
            <div class="modal-header">
                <h3>Demande de Mentorat</h3>
                <button class="modal-close" onclick="hideModal()">&times;</button>
            </div>
            <form id="mentorshipRequestForm" onsubmit="handleMentorshipRequest(event, ${mentorId})">
                <div class="form-group">
                    <label>Matière souhaitée</label>
                    <select name="subject_id" required>
                        <option value="">Sélectionnez une matière</option>
                        <option value="1">Mathématiques</option>
                        <option value="2">Français</option>
                        <option value="3">Sciences</option>
                        <option value="4">Histoire-Géographie</option>
                        <option value="5">Anglais</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Objectifs du mentorat</label>
                    <textarea name="goals" required placeholder="Décrivez vos objectifs et ce que vous aimeriez apprendre..." rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label>Message pour le mentor</label>
                    <textarea name="message" placeholder="Message optionnel pour présenter votre demande..." rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="hideModal()">Annuler</button>
                    <button type="submit" class="btn btn-primary">Envoyer la demande</button>
                </div>
            </form>
        `;

        showModal(modalContent);
    }

    async submitMentorshipRequest(mentorId, requestData) {
        try {
            const response = await fetch('/api/mentorships/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.getToken()}`
                },
                body: JSON.stringify({
                    mentor_id: mentorId,
                    ...requestData
                })
            });

            if (response.ok) {
                showNotification('Demande de mentorat envoyée !', 'success');
                hideModal();
            } else {
                const error = await response.json();
                showNotification(error.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de l\'envoi de la demande', 'error');
        }
    }
}

// Instance globale
let mentorsManager;

// Fonctions globales
function requestMentorship(mentorId) {
    if (mentorsManager) {
        mentorsManager.requestMentorship(mentorId);
    }
}

function handleMentorshipRequest(event, mentorId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const requestData = Object.fromEntries(formData);
    
    if (mentorsManager) {
        mentorsManager.submitMentorshipRequest(mentorId, requestData);
    }
}

function viewMentorProfile(mentorId) {
    showNotification('Profil du mentor - Fonctionnalité en cours de développement', 'info');
}

function contactMentor(mentorId) {
    if (!authManager.isLoggedIn()) {
        showNotification('Connectez-vous pour contacter ce mentor', 'error');
        return;
    }
    showNotification('Messagerie - Fonctionnalité en cours de développement', 'info');
}

// Initialisation
function initializeMentors() {
    if (!mentorsManager) {
        mentorsManager = new MentorsManager();
    }
    mentorsManager.loadMentors();
}

// Exposition des fonctions
window.requestMentorship = requestMentorship;
window.handleMentorshipRequest = handleMentorshipRequest;
window.viewMentorProfile = viewMentorProfile;
window.contactMentor = contactMentor;

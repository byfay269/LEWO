
// Module des mentors
class MentorsManager {
    constructor() {
        this.sampleMentors = [
            {
                id: 1,
                name: "Dr. Ahmed Hassan",
                subjects: "Mathématiques, Physique",
                level: "Université",
                rating: 4.9,
                avatar: "AH",
                experience: "5 ans d'expérience"
            },
            {
                id: 2,
                name: "Mme Aïcha Saïd",
                subjects: "Français, Littérature",
                level: "Lycée",
                rating: 4.8,
                avatar: "AS",
                experience: "8 ans d'expérience"
            },
            {
                id: 3,
                name: "M. Ibrahim Ali",
                subjects: "Histoire, Géographie",
                level: "Collège/Lycée",
                rating: 4.7,
                avatar: "IA",
                experience: "3 ans d'expérience"
            },
            {
                id: 4,
                name: "Dr. Maryam Omar",
                subjects: "Biologie, Chimie",
                level: "Université",
                rating: 4.9,
                avatar: "MO",
                experience: "6 ans d'expérience"
            }
        ];
    }

    loadMentors() {
        const mentorsGrid = document.getElementById('mentorsGrid');
        if (mentorsGrid) {
            mentorsGrid.innerHTML = this.sampleMentors.map(mentor => this.createMentorHTML(mentor)).join('');
        }
    }

    createMentorHTML(mentor) {
        const stars = '⭐'.repeat(Math.floor(mentor.rating));
        return `
            <div class="mentor-card">
                <div class="mentor-avatar">${mentor.avatar}</div>
                <h3 class="mentor-name">${mentor.name}</h3>
                <p class="mentor-subjects">${mentor.subjects}</p>
                <div class="mentor-rating">${stars} ${mentor.rating}</div>
                <p style="color: #718096; font-size: 0.9rem; margin-bottom: 1rem;">${mentor.experience}</p>
                <button class="btn btn-primary" onclick="mentorsManager.contactMentor(${mentor.id})">
                    Contacter
                </button>
            </div>
        `;
    }

    contactMentor(mentorId) {
        if (!authManager.getCurrentUser()) {
            showLogin();
            return;
        }

        const mentor = this.sampleMentors.find(m => m.id === mentorId);
        showNotification(`Demande de contact envoyée à ${mentor.name}`, 'success');
    }
}

// Instance globale
const mentorsManager = new MentorsManager();

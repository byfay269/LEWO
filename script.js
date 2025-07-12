
// Variables globales
let currentUser = null;
let currentSection = 'accueil';

// Données de démonstration
const samplePosts = [
    {
        id: 1,
        title: "Aide sur les équations du second degré",
        content: "Bonjour, je n'arrive pas à résoudre cette équation : x² - 5x + 6 = 0. Quelqu'un peut-il m'expliquer la méthode ?",
        author: "Amina K.",
        subject: "Mathématiques",
        category: "Question",
        level: "Lycée",
        date: "Il y a 2h",
        replies: 3,
        likes: 5
    },
    {
        id: 2,
        title: "Exercice de français - analyse de texte",
        content: "Voici un exercice d'analyse que j'ai préparé pour mes camarades de première. N'hésitez pas à proposer vos réponses !",
        author: "Said M.",
        subject: "Français",
        category: "Exercice",
        level: "Lycée",
        date: "Il y a 4h",
        replies: 7,
        likes: 12
    },
    {
        id: 3,
        title: "Révisions BAC Sciences - Chimie organique",
        content: "Quelqu'un aurait-il des fiches de révision sur la chimie organique ? Je prépare mon BAC et j'ai du mal avec les nomenclatures.",
        author: "Fatima A.",
        subject: "Sciences",
        category: "Question",
        level: "Lycée",
        date: "Il y a 1 jour",
        replies: 15,
        likes: 8
    }
];

const sampleMentors = [
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

const sampleAnnales = [
    {
        id: 1,
        title: "Baccalauréat Mathématiques - Série C",
        year: "2024",
        exam: "Baccalauréat",
        subject: "Mathématiques",
        description: "Sujet complet avec corrigé détaillé",
        pages: 8,
        difficulty: "Difficile"
    },
    {
        id: 2,
        title: "Brevet Français - Épreuve écrite",
        year: "2023",
        exam: "Brevet",
        subject: "Français",
        description: "Analyse de texte et expression écrite",
        pages: 6,
        difficulty: "Moyen"
    },
    {
        id: 3,
        title: "BTS Physique-Chimie - Session principale",
        year: "2023",
        exam: "BTS",
        subject: "Sciences",
        description: "Épreuve pratique et théorique",
        pages: 12,
        difficulty: "Très difficile"
    },
    {
        id: 4,
        title: "Licence Histoire contemporaine - Partiel",
        year: "2022",
        exam: "Licence",
        subject: "Histoire",
        description: "Dissertation sur la période 1945-1975",
        pages: 4,
        difficulty: "Difficile"
    }
];

const sampleMetiers = [
    {
        id: 1,
        title: "Développeur Web",
        category: "sciences",
        icon: "💻",
        description: "Création et maintenance de sites web et applications",
        formation: "Bac+2 à Bac+5",
        salaire: "35 000 - 60 000 € / an",
        competences: ["HTML/CSS", "JavaScript", "Frameworks"],
        secteurs: ["Tech", "E-commerce", "Médias"]
    },
    {
        id: 2,
        title: "Infirmier(e)",
        category: "sante",
        icon: "🏥",
        description: "Soins et accompagnement des patients",
        formation: "Bac+3 (IFSI)",
        salaire: "28 000 - 45 000 € / an",
        competences: ["Soins", "Empathie", "Rigueur"],
        secteurs: ["Hôpital", "Clinique", "Libéral"]
    },
    {
        id: 3,
        title: "Professeur",
        category: "education",
        icon: "🎓",
        description: "Enseignement et formation des élèves",
        formation: "Bac+5 (Master MEEF)",
        salaire: "30 000 - 55 000 € / an",
        competences: ["Pédagogie", "Communication", "Discipline"],
        secteurs: ["Éducation nationale", "Privé", "Formation"]
    },
    {
        id: 4,
        title: "Commercial",
        category: "commerce",
        icon: "💼",
        description: "Vente et relation client",
        formation: "Bac+2 à Bac+5",
        salaire: "25 000 - 80 000 € / an",
        competences: ["Négociation", "Relationnel", "Persuasion"],
        secteurs: ["Tous secteurs", "B2B", "B2C"]
    },
    {
        id: 5,
        title: "Graphiste",
        category: "art",
        icon: "🎨",
        description: "Création visuelle et design graphique",
        formation: "Bac+2 à Bac+5",
        salaire: "22 000 - 45 000 € / an",
        competences: ["Créativité", "Logiciels PAO", "Tendances"],
        secteurs: ["Communication", "Édition", "Web"]
    },
    {
        id: 6,
        title: "Ingénieur",
        category: "sciences",
        icon: "⚙️",
        description: "Conception et développement de solutions techniques",
        formation: "Bac+5 (École d'ingénieur)",
        salaire: "40 000 - 80 000 € / an",
        competences: ["Analyse", "Innovation", "Gestion projet"],
        secteurs: ["Industrie", "IT", "Énergie"]
    }
];

let currentMetierCategory = 'tous';
let currentExamType = 'bac';

// Données de démonstration pour les résultats
const sampleResults = {
    bac: [
        {
            id: 1,
            name: "AHMED Said Ibrahim",
            numero: "BAC2024001",
            year: "2024",
            region: "ngazidja",
            serie: "C",
            mention: "Très Bien",
            status: "admitted",
            moyenne: 16.75
        },
        {
            id: 2,
            name: "FATIMA Aïcha Mohamed",
            numero: "BAC2024002", 
            year: "2024",
            region: "ndzuani",
            serie: "D",
            mention: "Bien",
            status: "admitted",
            moyenne: 14.25
        },
        {
            id: 3,
            name: "IBRAHIM Ali Soilihi",
            numero: "BAC2024003",
            year: "2024", 
            region: "mwali",
            serie: "L",
            mention: "Assez Bien",
            status: "admitted",
            moyenne: 12.50
        },
        {
            id: 4,
            name: "MARIAMA Hassan Abdou",
            numero: "BAC2024004",
            year: "2024",
            region: "ngazidja",
            serie: "S",
            mention: "-",
            status: "failed",
            moyenne: 8.75
        }
    ],
    bepc: [
        {
            id: 1,
            name: "MOHAMED Anli Said",
            numero: "BEPC2024001",
            year: "2024",
            region: "ngazidja",
            etablissement: "Collège de Moroni",
            mention: "Bien",
            status: "admitted",
            moyenne: 13.80
        },
        {
            id: 2,
            name: "ZAINA Combo Moussa",
            numero: "BEPC2024002",
            year: "2024",
            region: "ndzuani",
            etablissement: "Collège de Mutsamudu",
            mention: "Assez Bien",
            status: "admitted",
            moyenne: 11.60
        },
        {
            id: 3,
            name: "HAMADI Abdou Salim",
            numero: "BEPC2024003",
            year: "2024",
            region: "mwali",
            etablissement: "Collège de Fomboni",
            mention: "-",
            status: "failed",
            moyenne: 9.25
        }
    ],
    concours: [
        {
            id: 1,
            name: "AMINA Saïd Omar",
            numero: "CONC2024001",
            year: "2024",
            region: "ngazidja",
            ecole_origine: "EPP Moroni Centre",
            rang: 1,
            status: "admitted",
            note: 18.5
        },
        {
            id: 2,
            name: "YOUSSOUF Ali Hassan",
            numero: "CONC2024002", 
            year: "2024",
            region: "ndzuani",
            ecole_origine: "EPP Mutsamudu",
            rang: 15,
            status: "admitted",
            note: 16.25
        },
        {
            id: 3,
            name: "SALIMA Mohamed Abdou",
            numero: "CONC2024003",
            year: "2024",
            region: "mwali",
            ecole_origine: "EPP Fomboni",
            rang: 156,
            status: "failed",
            note: 8.75
        }
    ]
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadForumPosts();
    loadMentors();
    loadAnnales();
    loadMetiers();
});

function initializeApp() {
    // Gestion de la navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
        });
    });

    // Fermeture des modales en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Gestion des formulaires
    setupFormHandlers();
    
    // Initialiser les résultats
    loadResultats();
}

function showSection(sectionName) {
    // Vérifier si la section nécessite une authentification
    if ((sectionName === 'annales' || sectionName === 'metiers' || sectionName === 'resultats') && !currentUser) {
        showNotification('Veuillez vous connecter pour accéder à cette section', 'error');
        showLogin();
        return;
    }

    // Cacher toutes les sections
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
    if (!currentUser) {
        showLogin();
        return;
    }
    document.getElementById('newPostModal').style.display = 'block';
}

function closeModal(modalId) {
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
    forumPosts.innerHTML = samplePosts.map(post => createPostHTML(post)).join('');
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
function loadMentors() {
    const mentorsGrid = document.getElementById('mentorsGrid');
    mentorsGrid.innerHTML = sampleMentors.map(mentor => createMentorHTML(mentor)).join('');
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
        });
    }

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

function handleLogin() {
    // Simulation de connexion
    const email = document.querySelector('#loginModal input[type="email"]').value;
    
    currentUser = {
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
    updateAuthButtons();
    showNotification('Connexion réussie !', 'success');
}

function handleRegister() {
    // Simulation d'inscription
    const firstname = document.querySelector('#registerModal input[placeholder="Prénom"]').value;
    const lastname = document.querySelector('#registerModal input[placeholder="Nom"]').value;
    const email = document.querySelector('#registerModal input[type="email"]').value;
    const userType = document.querySelector('#registerModal select').value;
    const educationLevel = document.querySelectorAll('#registerModal select')[1].value;
    
    currentUser = {
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
    updateAuthButtons();
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
        author: currentUser.name,
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
    if (currentUser) {
        authButtons.innerHTML = `
            <span style="color: rgba(255,255,255,0.9);">Bonjour, ${currentUser.name}</span>
            <button class="btn btn-outline" onclick="logout()">Déconnexion</button>
        `;
        
        // Rendre les sections authentifiées disponibles
        document.querySelectorAll('.auth-required').forEach(link => {
            link.classList.add('available');
        });
        
        // Mettre à jour le profil
        updateProfileSection();
    }
}

// Chargement des annales
function loadAnnales() {
    const annalesGrid = document.getElementById('annalesGrid');
    annalesGrid.innerHTML = sampleAnnales.map(annale => createAnnaleHTML(annale)).join('');
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
function loadMetiers() {
    const metiersGrid = document.getElementById('metiersGrid');
    const filteredMetiers = currentMetierCategory === 'tous' 
        ? sampleMetiers 
        : sampleMetiers.filter(metier => metier.category === currentMetierCategory);
    
    metiersGrid.innerHTML = filteredMetiers.map(metier => createMetierHTML(metier)).join('');
}

function createMetierHTML(metier) {
    return `
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

function showMetierCategory(category) {
    currentMetierCategory = category;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
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
    currentUser = null;
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
    if (currentSection === 'annales' || currentSection === 'metiers') {
        showSection('accueil');
    }
    
    showNotification('Déconnexion réussie', 'info');
}

function contactMentor(mentorId) {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const mentor = sampleMentors.find(m => m.id === mentorId);
    showNotification(`Demande de contact envoyée à ${mentor.name}`, 'success');
}

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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fonctions de gestion du profil
function updateProfileSection() {
    const profileContent = document.getElementById('profileContent');
    if (!currentUser) {
        profileContent.innerHTML = '<p class="text-center">Connectez-vous pour voir votre profil</p>';
        return;
    }

    const user = currentUser;
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

function showEditProfile() {
    if (!currentUser) {
        showLogin();
        return;
    }

    // Pré-remplir le formulaire avec les données actuelles
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editUserType').value = currentUser.type || '';
    document.getElementById('editEducationLevel').value = currentUser.educationLevel || '';
    document.getElementById('editInstitution').value = currentUser.institution || '';
    document.getElementById('editLocation').value = currentUser.location || '';
    document.getElementById('editBio').value = currentUser.bio || '';

    // Cocher les centres d'intérêt existants
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    interestCheckboxes.forEach(checkbox => {
        checkbox.checked = currentUser.interests && currentUser.interests.includes(checkbox.value);
    });

    // Afficher la photo actuelle
    const currentPhoto = document.getElementById('currentPhoto');
    if (currentUser.photo) {
        currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${currentUser.photo}" alt="Photo actuelle">`;
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
    currentUser = {
        ...currentUser,
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
            currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${photoUrl}" alt="Nouvelle photo">`;
            
            // Sauvegarder dans l'utilisateur actuel
            if (currentUser) {
                currentUser.photo = photoUrl;
            }
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    const currentPhoto = document.getElementById('currentPhoto');
    currentPhoto.querySelector('.profile-avatar-large').innerHTML = '👤';
    
    if (currentUser) {
        currentUser.photo = null;
    }
    
    document.getElementById('photoInput').value = '';
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

// Recherche dans le forum
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterPosts(searchTerm);
    });
}

function filterPosts(searchTerm) {
    const filteredPosts = samplePosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.subject.toLowerCase().includes(searchTerm)
    );
    
    const forumPosts = document.getElementById('forumPosts');
    forumPosts.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
}

// Chargement des résultats d'examens
function loadResultats() {
    showExamResults('bac');
}

function showExamResults(examType) {
    currentExamType = examType;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.exam-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Charger les résultats
    loadExamResults();
}

function loadExamResults() {
    const results = sampleResults[currentExamType] || [];
    const content = document.getElementById('resultatsContent');
    
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
                <td>${result.serie}</td>
                <td>${result.moyenne}/20</td>
                <td class="result-mention">${result.mention}</td>
            `;
            break;
        case 'bepc':
            specificCells = `
                <td>${result.etablissement}</td>
                <td>${result.moyenne}/20</td>
                <td class="result-mention">${result.mention}</td>
            `;
            break;
        case 'concours':
            specificCells = `
                <td>${result.ecole_origine}</td>
                <td>${result.note}/20</td>
                <td>${result.rang}</td>
            `;
            break;
    }
    
    return `
        <tr>
            <td><strong>${result.name}</strong></td>
            <td>${result.numero}</td>
            ${specificCells}
            <td>
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
    
    document.getElementById('totalCandidates').textContent = total;
    document.getElementById('admittedCandidates').textContent = admitted;
    document.getElementById('successRate').textContent = successRate + '%';
}

function searchResults() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const yearFilter = document.getElementById('yearFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    
    let filteredResults = sampleResults[currentExamType] || [];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
        filteredResults = filteredResults.filter(result => 
            result.name.toLowerCase().includes(searchTerm) ||
            result.numero.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrer par année
    if (yearFilter) {
        filteredResults = filteredResults.filter(result => result.year === yearFilter);
    }
    
    // Filtrer par région
    if (regionFilter) {
        filteredResults = filteredResults.filter(result => result.region === regionFilter);
    }
    
    const content = document.getElementById('resultatsContent');
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

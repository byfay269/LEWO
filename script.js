// Variables globales
let currentUser = null;
let currentSection = 'accueil';

// Gestionnaire d'authentification
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.initializeUser();
    }

    async initializeUser() {
        if (this.token) {
            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateAuthButtons();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Erreur de vérification du token:', error);
                this.logout();
            }
        }
    }

    updateAuthButtons() {
        const authButtons = document.querySelector('.auth-buttons');
        const adminLinks = document.querySelectorAll('.admin-only');
        const authRequiredLinks = document.querySelectorAll('.auth-required');

        if (this.currentUser) {
            authButtons.innerHTML = `
                <span class="user-info">👋 ${this.currentUser.first_name || this.currentUser.email}</span>
                <button class="btn btn-outline" onclick="authManager.logout()">Déconnexion</button>
            `;

            // Afficher les liens admin si l'utilisateur est admin
            adminLinks.forEach(link => {
                link.style.display = this.currentUser.user_type === 'admin' ? 'block' : 'none';
            });

            // Afficher les liens authentifiés
            authRequiredLinks.forEach(link => {
                link.style.display = 'block';
            });
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" onclick="showLogin()">Connexion</button>
                <button class="btn btn-primary" onclick="showRegister()">S'inscrire</button>
            `;

            // Masquer les liens admin et authentifiés
            adminLinks.forEach(link => link.style.display = 'none');
            authRequiredLinks.forEach(link => link.style.display = 'none');
        }
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.updateAuthButtons();
                hideModal();
                showNotification('Connexion réussie !', 'success');
                return true;
            } else {
                const error = await response.json();
                showNotification(error.message, 'error');
                return false;
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showNotification('Erreur de connexion', 'error');
            return false;
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                showNotification('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
                showLogin();
                return true;
            } else {
                const error = await response.json();
                showNotification(error.message, 'error');
                return false;
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            showNotification('Erreur d\'inscription', 'error');
            return false;
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.updateAuthButtons();
        showNotification('Déconnexion réussie', 'success');
        navigateToSection('accueil');
    }

    getToken() {
        return this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.user_type === 'admin';
    }
}

// Instance globale du gestionnaire d'authentification
let authManager;

// Variables globales pour la navigation
let currentSection = 'accueil';
// Fichier principal - Variables globales et navigation
let appCurrentSection = 'accueil';
let currentExamType = 'bac';

// Navigation entre pages
function navigateToSection(section) {
    const pageContent = document.getElementById('pageContent');

    // Vérifier si la section nécessite une authentification
    if ((section === 'annales' || section === 'metiers' || section === 'resultats') && !authManager.currentUser) {
        showNotification('Veuillez vous connecter pour accéder à cette section', 'error');
        showLogin();
        return;
    }

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[href="#${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Charger le contenu de la page
    loadPageContent(section);
    appCurrentSection = section;
}

async function loadPageContent(section) {
    const pageContent = document.getElementById('pageContent');

    try {
        const response = await fetch(`pages/${section}.html`);
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.page-content');

            if (content) {
                pageContent.innerHTML = content.innerHTML;
                initializePageContent(section);
            }
        } else {
            console.error(`Erreur lors du chargement de la page ${section}`);
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
    }
}

function initializePageContent(section) {
    switch(section) {
        case 'forum':
            forumManager.loadPosts();
            break;
        case 'mentors':
            mentorsManager.loadMentors();
            break;
        case 'annales':
            contentManager.loadAnnales();
            break;
        case 'metiers':
            contentManager.loadMetiers();
            break;
        case 'profil':
            profileManager.loadProfile();
            break;
        case 'admin':
            adminManager.loadDashboard();
            break;
    }
}

// Fonction d'initialisation spécifique à chaque page
function initializePageSpecific(section) {
    switch(section) {
        case 'forum':
            if (typeof initializeForum === 'function') {
                initializeForum();
            }
            break;
        case 'mentors':
            if (typeof initializeMentors === 'function') {
                initializeMentors();
            }
            break;
        case 'annales':
        case 'resultats':
        case 'metiers':
            if (typeof initializeContentPage === 'function') {
                initializeContentPage(section);
            }
            break;
        case 'profil':
            if (typeof initializeProfile === 'function') {
                initializeProfile();
            }
            break;
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialiser tous les modules
        authManager.init();
        forumManager.init();
        mentorsManager.init();
        contentManager.init();
        profileManager.init();
        adminManager.init();

        // Gestion de la navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = this.getAttribute('href').substring(1);
                navigateToSection(targetSection);
            });
        });

        // Fermeture des modales en cliquant à l'extérieur
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Mettre à jour les boutons d'authentification
        authManager.updateAuthButtons();

        // Initialiser la page spécifique
        initializePageSpecific(currentSection);

        console.log('Application LEWO initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors du chargement de l\'application', 'error');
    }
});

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

// Données d'administration (à remplacer par une base de données)
const adminUsers = [
    {
        id: 1,
        firstName: "Admin",
        lastName: "LEWO",
        email: "admin@lewo.com",
        type: "admin",
        educationLevel: "universite",
        status: "active",
        joinDate: new Date(),
        avatar: "AL"
    },
    {
        id: 2,
        firstName: "Utilisateur",
        lastName: "Standard",
        email: "user@lewo.com",
        type: "student",
        educationLevel: "lycee",
        status: "active",
        joinDate: new Date(),
        avatar: "US"
    }
];

const adminMentorships = [
    {
        id: 1,
        mentor: "Dr. Ahmed Hassan",
        student: "Amina K.",
        subject: "Mathématiques",
        status: "active",
        startDate: new Date(),
        progress: 75
    },
    {
        id: 2,
        mentor: "Mme Aïcha Saïd",
        student: "Said M.",
        subject: "Français",
        status: "pending",
        startDate: new Date(),
        progress: 20
    }
];

const adminReports = [
    {
        id: 1,
        reporter: "Utilisateur Standard",
        type: "spam",
        content: "Ce post est un spam",
        status: "pending",
        date: new Date(),
        urgent: true
    },
    {
        id: 2,
        reporter: "Amina K.",
        type: "inappropriate",
        content: "Ce contenu est inapproprié",
        status: "resolved",
        date: new Date(),
        urgent: false
    }
];

// Variables pour l'admin
let currentAdminTab = 'dashboard';

// Gestion d'erreur globale
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    // Éviter que les erreurs bloquent l'application
    return true;
});

// Recherche dans le forum
function setupSearchHandler() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterPosts(searchTerm);
        });
    }
}

// Appel après l'initialisation
setTimeout(setupSearchHandler, 100);

function showSection(sectionName) {
    // Vérifier si la section nécessite une authentification
    if ((sectionName === 'annales' || sectionName === 'metiers' || sectionName === 'resultats') && !authManager.currentUser) {
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
    if (!authManager.currentUser) {
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
function loadMentors() {
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

function handleRegister() {
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
function loadAnnales() {
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
function loadMetiers() {
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
    if (!authManager.currentUser) {
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonctions de gestion du profil
function updateProfileSection() {
    const profileContent = document.getElementById('profileContent');
    if (!authManager.currentUser) {
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
    if (!authManager.currentUser) {
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
function loadResultats() {
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
        cascase 'posts':
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
}inUsers.length;
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

function loadAdminUsers() {
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

function loadAdminPosts() {
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

function loadAdminMentorships() {
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

function loadAdminReports() {
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

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le gestionnaire d'authentification
    authManager = new AuthManager();

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            navigateToSection(section);
        });
    });

     // Initialisation
     authManager.updateAuthButtons();

    // Charger les managers
    forumManager.init();
    mentorsManager.init();
    contentManager.init();
    adminManager.init();
    profileManager.init();
});
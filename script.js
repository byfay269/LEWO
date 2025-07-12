
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
}

function showSection(sectionName) {
    // Vérifier si la section nécessite une authentification
    if ((sectionName === 'annales' || sectionName === 'metiers') && !currentUser) {
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
}

function handleLogin() {
    // Simulation de connexion
    const email = document.querySelector('#loginModal input[type="email"]').value;
    
    currentUser = {
        email: email,
        name: "Utilisateur",
        type: "student"
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
    
    currentUser = {
        email: email,
        name: `${firstname} ${lastname}`,
        type: "student"
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


// Module forum
const forumManager = {
    posts: [
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
        }
    ],

    init() {
        this.setupFormHandlers();
    },

    setupFormHandlers() {
        const postForm = document.querySelector('#newPostModal .post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewPost();
            });
        }
    },

    loadPosts() {
        const forumPosts = document.getElementById('forumPosts');
        if (forumPosts) {
            forumPosts.innerHTML = this.posts.map(post => this.createPostHTML(post)).join('');
        }
    },

    createPostHTML(post) {
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
    },

    handleNewPost() {
        if (!authManager.currentUser) {
            showLogin();
            return;
        }

        const title = document.querySelector('#newPostModal input[placeholder="Titre de votre post"]').value;
        const content = document.querySelector('#newPostModal textarea').value;

        const newPost = {
            id: this.posts.length + 1,
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

        this.posts.unshift(newPost);
        this.loadPosts();
        closeModal('newPostModal');
        showNotification('Post publié avec succès !', 'success');
    },

    filterPosts(searchTerm) {
        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.subject.toLowerCase().includes(searchTerm)
        );

        const forumPosts = document.getElementById('forumPosts');
        if (forumPosts) {
            forumPosts.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');
        }
    }
};

function showNewPost() {
    if (!authManager.currentUser) {
        showLogin();
        return;
    }
    document.getElementById('newPostModal').style.display = 'block';
}

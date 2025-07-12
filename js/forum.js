
// Module du forum
class ForumManager {
    constructor() {
        this.samplePosts = [
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
    }

    loadForumPosts() {
        const forumPosts = document.getElementById('forumPosts');
        if (forumPosts) {
            forumPosts.innerHTML = this.samplePosts.map(post => this.createPostHTML(post)).join('');
        }
    }

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
    }

    handleNewPost() {
        const title = document.querySelector('#newPostModal input[placeholder="Titre de votre post"]').value;
        const content = document.querySelector('#newPostModal textarea').value;

        // Ajouter le nouveau post (simulation)
        const newPost = {
            id: this.samplePosts.length + 1,
            title: title,
            content: content,
            author: authManager.getCurrentUser().name,
            subject: "Général",
            category: "Question",
            level: "Lycée",
            date: "À l'instant",
            replies: 0,
            likes: 0
        };

        this.samplePosts.unshift(newPost);
        this.loadForumPosts();
        closeModal('newPostModal');
        showNotification('Post publié avec succès !', 'success');
    }

    filterPosts(searchTerm) {
        const filteredPosts = this.samplePosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.subject.toLowerCase().includes(searchTerm)
        );

        const forumPosts = document.getElementById('forumPosts');
        if (forumPosts) {
            forumPosts.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');
        }
    }
}

// Instance globale
const forumManager = new ForumManager();

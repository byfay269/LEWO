
// Module d'administration
class AdminManager {
    constructor() {
        this.currentAdminTab = 'dashboard';
        this.initializeAdminData();
    }

    initializeAdminData() {
        this.adminUsers = [
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
            }
        ];

        this.adminMentorships = [
            {
                id: 1,
                mentor: "Dr. Ahmed Hassan",
                student: "Amina K.",
                subject: "Mathématiques",
                status: "active",
                startDate: new Date(),
                progress: 75
            }
        ];

        this.adminReports = [
            {
                id: 1,
                reporter: "Utilisateur Standard",
                type: "spam",
                content: "Ce post est un spam",
                status: "pending",
                date: new Date(),
                urgent: true
            }
        ];
    }

    showAdminTab(tabName, buttonElement = null) {
        this.currentAdminTab = tabName;

        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        if (buttonElement) {
            buttonElement.classList.add('active');
        }

        document.querySelectorAll('.admin-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`admin-${tabName}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        switch(tabName) {
            case 'dashboard':
                this.loadAdminDashboard();
                break;
            case 'users':
                this.loadAdminUsers();
                break;
            case 'posts':
                this.loadAdminPosts();
                break;
            case 'mentorships':
                this.loadAdminMentorships();
                break;
            case 'reports':
                this.loadAdminReports();
                break;
        }
    }

    loadAdminDashboard() {
        const totalUsersEl = document.getElementById('totalUsers');
        const totalPostsEl = document.getElementById('totalPosts');
        const activeMentorshipsEl = document.getElementById('activeMentorships');
        const pendingReportsEl = document.getElementById('pendingReports');

        if (totalUsersEl) totalUsersEl.textContent = this.adminUsers.length;
        if (totalPostsEl) totalPostsEl.textContent = forumManager.samplePosts.length;
        if (activeMentorshipsEl) activeMentorshipsEl.textContent = this.adminMentorships.filter(m => m.status === 'active').length;
        if (pendingReportsEl) pendingReportsEl.textContent = this.adminReports.filter(r => r.status === 'pending').length;
    }

    loadAdminUsers() {
        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.innerHTML = this.adminUsers.map(user => `
                <tr>
                    <td>
                        <div class="user-avatar-table">${user.avatar}</div>
                    </td>
                    <td><strong>${user.firstName} ${user.lastName}</strong></td>
                    <td>${user.email}</td>
                    <td>${profileManager.getUserTypeLabel(user.type)}</td>
                    <td>${profileManager.getEducationLevelLabel(user.educationLevel)}</td>
                    <td>
                        <span class="status-badge status-${user.status}">
                            ${user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                    </td>
                    <td>${new Date(user.joinDate).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-view" onclick="adminManager.viewUser(${user.id})" title="Voir">👁️</button>
                            <button class="btn-icon btn-edit" onclick="adminManager.editUser(${user.id})" title="Modifier">✏️</button>
                            <button class="btn-icon btn-delete" onclick="adminManager.deleteUser(${user.id})" title="Supprimer">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadAdminPosts() {
        const postsGrid = document.getElementById('adminPostsGrid');
        if (postsGrid) {
            postsGrid.innerHTML = forumManager.samplePosts.map(post => `
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
                            <button class="btn-icon btn-view" onclick="adminManager.viewPost(${post.id})" title="Voir">👁️</button>
                            <button class="btn-icon btn-edit" onclick="adminManager.editPost(${post.id})" title="Modifier">✏️</button>
                            <button class="btn-icon btn-delete" onclick="adminManager.deletePost(${post.id})" title="Supprimer">🗑️</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadAdminMentorships() {
        const tableBody = document.getElementById('mentorshipsTableBody');
        if (tableBody) {
            tableBody.innerHTML = this.adminMentorships.map(mentorship => `
                <tr>
                    <td><strong>${mentorship.mentor}</strong></td>
                    <td>${mentorship.student}</td>
                    <td>${mentorship.subject}</td>
                    <td>
                        <span class="status-badge status-${mentorship.status}">
                            ${mentorship.status === 'active' ? 'Actif' : 'En attente'}
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
                            <button class="btn-icon btn-view" onclick="adminManager.viewMentorship(${mentorship.id})" title="Voir">👁️</button>
                            <button class="btn-icon btn-edit" onclick="adminManager.editMentorship(${mentorship.id})" title="Modifier">✏️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadAdminReports() {
        const reportsList = document.getElementById('reportsList');
        if (reportsList) {
            reportsList.innerHTML = this.adminReports.map(report => `
                <div class="report-card ${report.urgent ? 'urgent' : ''} ${report.status === 'resolved' ? 'resolved' : ''}">
                    <div class="report-header">
                        <div>
                            <span class="report-type">${report.type === 'spam' ? 'Spam' : 'Contenu inapproprié'}</span>
                            <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #6b7280;">
                                Signalé par ${report.reporter} • ${new Date(report.date).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                        <span class="status-badge status-${report.status}">
                            ${report.status === 'pending' ? 'En attente' : 'Traité'}
                        </span>
                    </div>
                    <div class="report-content">${report.content}</div>
                    <div class="report-actions">
                        <button class="btn btn-primary" onclick="adminManager.resolveReport(${report.id})">Traiter</button>
                        <button class="btn btn-outline" onclick="adminManager.dismissReport(${report.id})">Rejeter</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Actions admin
    viewUser(userId) {
        showNotification(`Consultation du profil utilisateur #${userId}`, 'info');
    }

    editUser(userId) {
        showNotification(`Édition de l'utilisateur #${userId}`, 'info');
    }

    deleteUser(userId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            const index = this.adminUsers.findIndex(u => u.id === userId);
            if (index > -1) {
                this.adminUsers.splice(index, 1);
                this.loadAdminUsers();
                showNotification('Utilisateur supprimé avec succès', 'success');
            }
        }
    }

    viewPost(postId) {
        showNotification(`Consultation du post #${postId}`, 'info');
    }

    editPost(postId) {
        showNotification(`Édition du post #${postId}`, 'info');
    }

    deletePost(postId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
            showNotification('Post supprimé avec succès', 'success');
        }
    }

    viewMentorship(mentorshipId) {
        showNotification(`Consultation du mentorat #${mentorshipId}`, 'info');
    }

    editMentorship(mentorshipId) {
        showNotification(`Édition du mentorat #${mentorshipId}`, 'info');
    }

    resolveReport(reportId) {
        const report = this.adminReports.find(r => r.id === reportId);
        if (report) {
            report.status = 'resolved';
            this.loadAdminReports();
            showNotification('Signalement traité avec succès', 'success');
        }
    }

    dismissReport(reportId) {
        const report = this.adminReports.find(r => r.id === reportId);
        if (report) {
            report.status = 'dismissed';
            this.loadAdminReports();
            showNotification('Signalement rejeté', 'info');
        }
    }
}

// Instance globale
const adminManager = new AdminManager();

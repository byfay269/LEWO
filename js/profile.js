// Module profil
const profileManager = {
    init() {
        this.setupFormHandlers();
    },

    setupFormHandlers() {
        const profileForm = document.querySelector('#profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate();
            });
        }

        const photoInput = document.getElementById('photoInput');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoChange(e);
            });
        }
    },

    loadProfile() {
        // Chargement du profil
        this.updateProfileSection();
    },

    updateProfileSection() {
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
                    <div class="profile-actions">
                        <button class="btn btn-primary btn-large" onclick="showEditProfile()">
                            ✏️ Modifier mon profil
                        </button>
                    </div>
                </div>
            `;
        }
    },

    handleProfileUpdate() {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const email = document.getElementById('editEmail').value;

        if (authManager.currentUser) {
            authManager.currentUser.firstName = firstName;
            authManager.currentUser.lastName = lastName;
            authManager.currentUser.name = `${firstName} ${lastName}`;
            authManager.currentUser.email = email;
        }

        closeModal('editProfileModal');
        this.updateProfileSection();
        showNotification('Profil mis à jour avec succès !', 'success');
    },

    handlePhotoChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La photo ne doit pas dépasser 5 MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const photoUrl = e.target.result;
                if (authManager.currentUser) {
                    authManager.currentUser.photo = photoUrl;
                }
            };
            reader.readAsDataURL(file);
        }
    }
};

function showEditProfile() {
    if (!authManager.currentUser) {
        showLogin();
        return;
    }

    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');

    if (editFirstName) editFirstName.value = authManager.currentUser.firstName || '';
    if (editLastName) editLastName.value = authManager.currentUser.lastName || '';
    if (editEmail) editEmail.value = authManager.currentUser.email || '';

    document.getElementById('editProfileModal').style.display = 'block';
}

function removePhoto() {
    const currentPhoto = document.getElementById('currentPhoto');
    if (currentPhoto) {
        currentPhoto.querySelector('.profile-avatar-large').innerHTML = '👤';
    }

    if (authManager.currentUser) {
        authManager.currentUser.photo = null;
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
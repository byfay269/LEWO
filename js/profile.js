
// Module de gestion des profils
class ProfileManager {
    updateProfileSection() {
        const profileContent = document.getElementById('profileContent');
        const user = authManager.getCurrentUser();
        
        if (!user) {
            if (profileContent) {
                profileContent.innerHTML = '<p class="text-center">Connectez-vous pour voir votre profil</p>';
            }
            return;
        }

        if (profileContent) {
            profileContent.innerHTML = `
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar-display">
                            ${user.photo ? `<img src="${user.photo}" alt="Photo de profil">` : '👤'}
                        </div>
                        <h2 class="profile-name">${user.name}</h2>
                        <span class="profile-type">${this.getUserTypeLabel(user.type)}</span>
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
                                        <div class="detail-value">${this.getEducationLevelLabel(user.educationLevel)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                            <button class="btn btn-primary btn-large" onclick="profileManager.showEditProfile()">
                                ✏️ Modifier mon profil
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showEditProfile() {
        const user = authManager.getCurrentUser();
        if (!user) {
            showLogin();
            return;
        }

        // Pré-remplir le formulaire
        const form = document.getElementById('editProfileModal');
        if (form) {
            const inputs = {
                editFirstName: user.firstName || '',
                editLastName: user.lastName || '',
                editEmail: user.email || '',
                editUserType: user.type || '',
                editEducationLevel: user.educationLevel || '',
                editInstitution: user.institution || '',
                editLocation: user.location || '',
                editBio: user.bio || ''
            };

            Object.keys(inputs).forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = inputs[id];
            });

            // Cocher les centres d'intérêt
            const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
            interestCheckboxes.forEach(checkbox => {
                checkbox.checked = user.interests && user.interests.includes(checkbox.value);
            });

            // Afficher la photo actuelle
            const currentPhoto = document.getElementById('currentPhoto');
            if (currentPhoto && user.photo) {
                currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${user.photo}" alt="Photo actuelle">`;
            }

            form.style.display = 'block';
        }
    }

    handleProfileUpdate() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const email = document.getElementById('editEmail').value;
        const userType = document.getElementById('editUserType').value;
        const educationLevel = document.getElementById('editEducationLevel').value;
        const institution = document.getElementById('editInstitution').value;
        const location = document.getElementById('editLocation').value;
        const bio = document.getElementById('editBio').value;

        const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(checkbox => checkbox.value);

        // Mettre à jour l'utilisateur
        Object.assign(user, {
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
        });

        closeModal('editProfileModal');
        this.updateProfileSection();
        showNotification('Profil mis à jour avec succès !', 'success');
    }

    handlePhotoChange(event) {
        const file = event.target.files[0];
        const user = authManager.getCurrentUser();
        
        if (file && user) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La photo ne doit pas dépasser 5 MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const photoUrl = e.target.result;
                const currentPhoto = document.getElementById('currentPhoto');
                if (currentPhoto) {
                    currentPhoto.querySelector('.profile-avatar-large').innerHTML = `<img src="${photoUrl}" alt="Nouvelle photo">`;
                }
                user.photo = photoUrl;
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto() {
        const user = authManager.getCurrentUser();
        const currentPhoto = document.getElementById('currentPhoto');
        
        if (currentPhoto) {
            currentPhoto.querySelector('.profile-avatar-large').innerHTML = '👤';
        }

        if (user) {
            user.photo = null;
        }

        const photoInput = document.getElementById('photoInput');
        if (photoInput) {
            photoInput.value = '';
        }
        
        showNotification('Photo supprimée', 'info');
    }

    getUserTypeLabel(type) {
        switch(type) {
            case 'student': return 'Élève/Étudiant';
            case 'mentor': return 'Mentor';
            case 'admin': return 'Administrateur';
            default: return 'Utilisateur';
        }
    }

    getEducationLevelLabel(level) {
        switch(level) {
            case 'college': return 'Collège';
            case 'lycee': return 'Lycée';
            case 'universite': return 'Université';
            case 'professionnel': return 'Professionnel';
            default: return 'Non spécifié';
        }
    }
}

// Instance globale
const profileManager = new ProfileManager();

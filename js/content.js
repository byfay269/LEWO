
// Gestion des annales d'examens
class AnnalesManager {
    constructor() {
        this.currentFilters = {
            year: '',
            exam: '',
            subject: ''
        };
    }

    async loadAnnales() {
        try {
            const response = await fetch('/api/annales', {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.displayAnnales(data.annales);
            } else {
                showNotification('Erreur lors du chargement des annales', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion', 'error');
        }
    }

    displayAnnales(annales) {
        const grid = document.getElementById('annalesGrid');
        if (!grid) return;

        if (annales.length === 0) {
            grid.innerHTML = '<p class="text-center">Aucune annale disponible pour le moment.</p>';
            return;
        }

        grid.innerHTML = annales.map(annale => `
            <div class="annale-card">
                <div class="annale-header">
                    <h3>${annale.title}</h3>
                    <span class="annale-year">${annale.year}</span>
                </div>
                <div class="annale-info">
                    <p><strong>Examen:</strong> ${annale.exam_type}</p>
                    <p><strong>Matière:</strong> ${annale.subject}</p>
                    <p><strong>Durée:</strong> ${annale.duration || 'Non spécifié'}</p>
                </div>
                <div class="annale-actions">
                    ${authManager.isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="downloadAnnale(${annale.id})">
                            📥 Télécharger
                        </button>
                        <button class="btn btn-outline" onclick="viewAnnale(${annale.id})">
                            👁️ Voir
                        </button>
                    ` : `
                        <p class="auth-required-msg">Connectez-vous pour télécharger</p>
                    `}
                </div>
            </div>
        `).join('');
    }

    async filterAnnales() {
        const year = document.querySelector('.filter-select[value]')?.value || '';
        const exam = document.querySelectorAll('.filter-select')[1]?.value || '';
        const subject = document.querySelectorAll('.filter-select')[2]?.value || '';

        this.currentFilters = { year, exam, subject };
        
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (exam) params.append('exam', exam);
        if (subject) params.append('subject', subject);

        try {
            const response = await fetch(`/api/annales?${params}`, {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.displayAnnales(data.annales);
            }
        } catch (error) {
            console.error('Erreur lors du filtrage:', error);
        }
    }
}

// Gestion des résultats d'examens
class ResultatsManager {
    constructor() {
        this.currentExam = 'bac';
        this.currentFilters = {};
    }

    async showExamResults(examType, element) {
        // Mise à jour de l'interface
        document.querySelectorAll('.exam-tab-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        
        this.currentExam = examType;
        await this.loadResults();
    }

    async loadResults() {
        try {
            const params = new URLSearchParams();
            params.append('exam_type', this.currentExam);
            
            Object.entries(this.currentFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`/api/results?${params}`, {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.displayResults(data.results);
                this.updateStats(data.stats);
            } else {
                showNotification('Erreur lors du chargement des résultats', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion', 'error');
        }
    }

    displayResults(results) {
        const content = document.getElementById('resultatsContent');
        if (!content) return;

        if (results.length === 0) {
            content.innerHTML = '<p class="text-center">Aucun résultat disponible.</p>';
            return;
        }

        content.innerHTML = `
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Numéro</th>
                            <th>Région</th>
                            <th>Établissement</th>
                            <th>Note</th>
                            <th>Mention</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(result => `
                            <tr>
                                <td>${result.student_name}</td>
                                <td>${result.student_number}</td>
                                <td>${result.region}</td>
                                <td>${result.school_name || 'N/A'}</td>
                                <td>${result.final_grade || 'N/A'}</td>
                                <td><span class="mention-badge mention-${result.mention}">${this.getMentionText(result.mention)}</span></td>
                                <td><span class="status-badge status-${result.status}">${this.getStatusText(result.status)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    updateStats(stats) {
        if (stats) {
            document.getElementById('totalCandidates').textContent = stats.total || 0;
            document.getElementById('admittedCandidates').textContent = stats.admitted || 0;
            document.getElementById('successRate').textContent = stats.successRate ? `${stats.successRate}%` : '0%';
        }
    }

    getMentionText(mention) {
        const mentions = {
            'tres_bien': 'Très bien',
            'bien': 'Bien',
            'assez_bien': 'Assez bien',
            'passable': 'Passable'
        };
        return mentions[mention] || mention;
    }

    getStatusText(status) {
        return status === 'admitted' ? 'Admis' : 'Non admis';
    }

    async searchResults() {
        const yearFilter = document.getElementById('yearFilter')?.value || '';
        const regionFilter = document.getElementById('regionFilter')?.value || '';
        const studentSearch = document.getElementById('studentSearch')?.value || '';

        this.currentFilters = {
            year: yearFilter,
            region: regionFilter,
            search: studentSearch
        };

        await this.loadResults();
    }
}

// Gestion des métiers
class MetiersManager {
    constructor() {
        this.currentCategory = 'tous';
    }

    async showMetierCategory(category, element) {
        // Mise à jour de l'interface
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        
        this.currentCategory = category;
        await this.loadMetiers();
    }

    async loadMetiers() {
        try {
            const params = new URLSearchParams();
            if (this.currentCategory !== 'tous') {
                params.append('category', this.currentCategory);
            }

            const response = await fetch(`/api/careers?${params}`, {
                headers: authManager.isLoggedIn() ? {
                    'Authorization': `Bearer ${authManager.getToken()}`
                } : {}
            });

            if (response.ok) {
                const data = await response.json();
                this.displayMetiers(data.careers);
            } else {
                showNotification('Erreur lors du chargement des métiers', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion', 'error');
        }
    }

    displayMetiers(metiers) {
        const grid = document.getElementById('metiersGrid');
        if (!grid) return;

        if (metiers.length === 0) {
            grid.innerHTML = '<p class="text-center">Aucun métier disponible dans cette catégorie.</p>';
            return;
        }

        grid.innerHTML = metiers.map(metier => `
            <div class="metier-card">
                <div class="metier-icon">${metier.icon_emoji || '💼'}</div>
                <h3>${metier.title}</h3>
                <p class="metier-description">${metier.description}</p>
                <div class="metier-details">
                    <p><strong>Formation:</strong> ${metier.required_education}</p>
                    <p><strong>Salaire:</strong> ${metier.salary_range_min}€ - ${metier.salary_range_max}€</p>
                </div>
                <div class="metier-skills">
                    <h4>Compétences clés:</h4>
                    <div class="skills-tags">
                        ${JSON.parse(metier.skills || '[]').map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="metier-sectors">
                    <h4>Secteurs:</h4>
                    <div class="sectors-tags">
                        ${JSON.parse(metier.sectors || '[]').map(sector => 
                            `<span class="sector-tag">${sector}</span>`
                        ).join('')}
                    </div>
                </div>
                ${authManager.isLoggedIn() ? `
                    <button class="btn btn-primary" onclick="showMetierDetails(${metier.id})">
                        En savoir plus
                    </button>
                ` : ''}
            </div>
        `).join('');
    }
}

// Instances globales
let annalesManager, resultatsManager, metiersManager;

// Fonctions globales pour l'interface
async function downloadAnnale(id) {
    if (!authManager.isLoggedIn()) {
        showNotification('Connectez-vous pour télécharger', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/annales/${id}/download`, {
            headers: {
                'Authorization': `Bearer ${authManager.getToken()}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `annale_${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            showNotification('Erreur lors du téléchargement', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de téléchargement', 'error');
    }
}

async function viewAnnale(id) {
    // Implémenter la visualisation en ligne
    showNotification('Fonctionnalité en cours de développement', 'info');
}

function showMetierDetails(id) {
    // Implémenter l'affichage des détails du métier
    showNotification('Détails du métier - Fonctionnalité en cours de développement', 'info');
}

// Fonction d'initialisation pour chaque page
function initializeContentPage(pageType) {
    switch(pageType) {
        case 'annales':
            if (!annalesManager) annalesManager = new AnnalesManager();
            annalesManager.loadAnnales();
            break;
        case 'resultats':
            if (!resultatsManager) resultatsManager = new ResultatsManager();
            resultatsManager.loadResults();
            break;
        case 'metiers':
            if (!metiersManager) metiersManager = new MetiersManager();
            metiersManager.loadMetiers();
            break;
    }
}

// Exposition des fonctions pour l'HTML
window.showExamResults = (examType, element) => resultatsManager?.showExamResults(examType, element);
window.showMetierCategory = (category, element) => metiersManager?.showMetierCategory(category, element);
window.searchResults = () => resultatsManager?.searchResults();

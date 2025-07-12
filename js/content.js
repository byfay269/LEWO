
// Module de contenu (Annales, Métiers, Résultats)
class ContentManager {
    constructor() {
        this.initializeData();
        this.currentMetierCategory = 'tous';
        this.currentExamType = 'bac';
    }

    initializeData() {
        this.sampleAnnales = [
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
            }
        ];

        this.sampleMetiers = [
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
            }
        ];

        this.sampleResults = {
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
                }
            ]
        };
    }

    // Gestion des annales
    loadAnnales() {
        const annalesGrid = document.getElementById('annalesGrid');
        if (annalesGrid) {
            annalesGrid.innerHTML = this.sampleAnnales.map(annale => this.createAnnaleHTML(annale)).join('');
        }
    }

    createAnnaleHTML(annale) {
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
                    <button class="btn-download" onclick="contentManager.downloadAnnale(${annale.id})">
                        📥 Télécharger
                    </button>
                    <button class="btn-preview" onclick="contentManager.previewAnnale(${annale.id})">
                        👁️ Aperçu
                    </button>
                </div>
            </div>
        `;
    }

    downloadAnnale(annaleId) {
        const annale = this.sampleAnnales.find(a => a.id === annaleId);
        showNotification(`Téléchargement de "${annale.title}" en cours...`, 'info');
    }

    previewAnnale(annaleId) {
        const annale = this.sampleAnnales.find(a => a.id === annaleId);
        showNotification(`Aperçu de "${annale.title}" ouvert`, 'info');
    }

    // Gestion des métiers
    loadMetiers() {
        const metiersGrid = document.getElementById('metiersGrid');
        if (metiersGrid) {
            const filteredMetiers = this.currentMetierCategory === 'tous' 
                ? this.sampleMetiers 
                : this.sampleMetiers.filter(metier => metier.category === this.currentMetierCategory);

            metiersGrid.innerHTML = filteredMetiers.map(metier => this.createMetierHTML(metier)).join('');
        }
    }

    createMetierHTML(metier) {
        return `
            <div class="metier-card" onclick="contentManager.openMetierDetails(${metier.id})">
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

    showMetierCategory(category, buttonElement = null) {
        this.currentMetierCategory = category;

        // Mettre à jour les boutons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (buttonElement) {
            buttonElement.classList.add('active');
        }

        this.loadMetiers();
    }

    openMetierDetails(metierId) {
        const metier = this.sampleMetiers.find(m => m.id === metierId);
        showNotification(`Détails du métier "${metier.title}" - Formation: ${metier.formation}`, 'info');
    }

    // Gestion des résultats
    loadResultats() {
        this.showExamResults('bac');
    }

    showExamResults(examType, buttonElement = null) {
        this.currentExamType = examType;

        // Mettre à jour les boutons
        document.querySelectorAll('.exam-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (buttonElement) {
            buttonElement.classList.add('active');
        }

        this.loadExamResults();
    }

    loadExamResults() {
        const results = this.sampleResults[this.currentExamType] || [];
        const content = document.getElementById('resultatsContent');

        if (!content) return;

        content.innerHTML = `
            <div class="loading-results">
                <div class="loading-spinner"></div>
                <p>Chargement des résultats...</p>
            </div>
        `;

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
                content.innerHTML = this.createResultsTableHTML(results);
                this.updateResultsStats(results);
            }
        }, 1000);
    }

    createResultsTableHTML(results) {
        const headers = this.getTableHeaders(this.currentExamType);

        return `
            <table class="resultats-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => this.createResultRowHTML(result)).join('')}
                </tbody>
            </table>
        `;
    }

    getTableHeaders(examType) {
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

    createResultRowHTML(result) {
        let specificCells = '';

        switch(this.currentExamType) {
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

    updateResultsStats(results) {
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

    searchResults() {
        const searchInput = document.getElementById('studentSearch');
        const yearFilter = document.getElementById('yearFilter');
        const regionFilter = document.getElementById('regionFilter');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const yearFilterValue = yearFilter ? yearFilter.value : '';
        const regionFilterValue = regionFilter ? regionFilter.value : '';

        let filteredResults = this.sampleResults[this.currentExamType] || [];

        if (searchTerm) {
            filteredResults = filteredResults.filter(result => 
                result.name.toLowerCase().includes(searchTerm) ||
                result.numero.toLowerCase().includes(searchTerm)
            );
        }

        if (yearFilterValue) {
            filteredResults = filteredResults.filter(result => result.year === yearFilterValue);
        }

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
            content.innerHTML = this.createResultsTableHTML(filteredResults);
            this.updateResultsStats(filteredResults);
        }
    }
}

// Instance globale
const contentManager = new ContentManager();

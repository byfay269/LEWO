// Module contenu (annales, métiers, résultats)
const contentManager = {
    annales: [
        {
            id: 1,
            title: "Baccalauréat Mathématiques - Série C",
            year: "2024",
            exam: "Baccalauréat",
            subject: "Mathématiques",
            description: "Sujet complet avec corrigé détaillé",
            pages: 8,
            difficulty: "Difficile"
        }
    ],

    metiers: [
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
        }
    ],

    init() {
        // Initialisation du module
    },

    loadAnnales() {
        const annalesGrid = document.getElementById('annalesGrid');
        if (annalesGrid) {
            annalesGrid.innerHTML = this.annales.map(annale => this.createAnnaleHTML(annale)).join('');
        }
    },

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
                    <button class="btn-download" onclick="downloadAnnale(${annale.id})">
                        📥 Télécharger
                    </button>
                    <button class="btn-preview" onclick="previewAnnale(${annale.id})">
                        👁️ Aperçu
                    </button>
                </div>
            </div>
        `;
    },

    loadMetiers() {
        const metiersGrid = document.getElementById('metiersGrid');
        if (metiersGrid) {
            metiersGrid.innerHTML = this.metiers.map(metier => this.createMetierHTML(metier)).join('');
        }
    },

    createMetierHTML(metier) {
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
};

function downloadAnnale(annaleId) {
    const annale = contentManager.annales.find(a => a.id === annaleId);
    if (annale) {
        showNotification(`Téléchargement de "${annale.title}" en cours...`, 'info');
    }
}

function previewAnnale(annaleId) {
    const annale = contentManager.annales.find(a => a.id === annaleId);
    if (annale) {
        showNotification(`Aperçu de "${annale.title}" ouvert`, 'info');
    }
}

function openMetierDetails(metierId) {
    const metier = contentManager.metiers.find(m => m.id === metierId);
    if (metier) {
        showNotification(`Détails du métier "${metier.title}" - Formation: ${metier.formation}`, 'info');
    }
}
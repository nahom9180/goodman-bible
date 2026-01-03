// No 'import' statements. This script assumes script.js has already been loaded.

document.addEventListener('DOMContentLoaded', () => {
    const skipCheckbox = document.getElementById('skipStartupCheckbox');
    const fullBibleBtn = document.getElementById('fullBibleBtn');
    const collectionsListContainer = document.getElementById('recentCollectionsList');

    // Apply the dark theme directly for a consistent "nightly" look
    function applyNightlyTheme() {
        const nightlyTheme = {
            '--bg-color': '#1a1a1d',
            '--text-color': '#c5c6c7',
            '--brand-color': '#DC143C',
            '--verse-card-bg': '#2c2f33',
            '--options-panel-border': '#4f4f52',
            '--options-panel-item-hover-bg': 'rgba(255, 255, 255, 0.05)',
            '--button-text-color': '#ffffff',
            '--button-hover-bg': '#b21030',
        };
        for (const key in nightlyTheme) {
            document.documentElement.style.setProperty(key, nightlyTheme[key]);
        }
    }

    async function displayAllCollections() {
        try {
            // These functions are now globally available from script.js and we assume DB is initialized
            const collections = await getAllCollectionsFromDB();
            const indices = getStoredCollectionIndices();

            collections.sort((a, b) => a.name.localeCompare(b.name));

            collectionsListContainer.innerHTML = ''; 

            if (collections.length === 0) {
                const noCollectionsMsg = document.querySelector('.no-recents-message');
                if(noCollectionsMsg) noCollectionsMsg.style.display = 'block';
                return;
            }

            collections.forEach(coll => {
                const savedIndex = indices[coll.name];
                const totalVerses = (coll.verses || []).length;
                
                const progress = (savedIndex !== undefined && totalVerses > 0) 
                    ? ((savedIndex + 1) / totalVerses) * 100 
                    : 0;

                const itemLink = document.createElement('a');
                itemLink.href = 'app.html';
                itemLink.className = 'recent-collection-item';
                itemLink.dataset.collectionName = coll.name;

                itemLink.innerHTML = `
                    <span class="recent-collection-name">${coll.name}</span>
                    <div class="recent-progress-bg">
                        <div class="recent-progress-fill" style="width: ${progress.toFixed(2)}%;"></div>
                    </div>
                `;

                itemLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.setItem('bibleAppLastActiveCollectionName', this.dataset.collectionName);
                    localStorage.removeItem('bibleAppFullBibleIndex');
                    window.location.href = this.href;
                });

                collectionsListContainer.appendChild(itemLink);
            });

        } catch (error) {
            console.error("Failed to display collections:", error);
            collectionsListContainer.innerHTML = '<p class="no-recents-message">Error loading collections. Please try refreshing the page.</p>';
        }
    }

    // --- Button Event Listeners ---
    if (fullBibleBtn) {
        fullBibleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bibleAppLastActiveCollectionName');
            window.location.href = e.currentTarget.href;
        });
    }

    // --- Skip startup checkbox logic ---
    const skipKey = 'skipStartupPage';
    if (localStorage.getItem(skipKey) === 'true') {
        document.body.style.display = 'none';
        window.location.href = 'app.html';
        return; // Important: stop execution if we are redirecting
    }
    if (skipCheckbox) {
        skipCheckbox.checked = localStorage.getItem(skipKey) === 'true';
        skipCheckbox.addEventListener('change', function() {
            localStorage.setItem(skipKey, this.checked ? 'true' : 'false');
        });
    }
    
    // --- Main Initialization Function ---
    async function initializeStartupPage() {
        applyNightlyTheme();

        try {
            // This is the crucial change: Wait for the DB to be fully initialized.
            // The initDB function (from script.js) sets the global 'db' variable that other functions need.
            await initDB();

            // Now that we are certain the database is ready, we can safely display the collections.
            await displayAllCollections();

        } catch (error) {
            console.error("Fatal Error during startup page initialization:", error);
            if (collectionsListContainer) {
                collectionsListContainer.innerHTML = '<p class="no-recents-message" style="color: var(--brand-color);">Could not connect to the database. Please ensure your browser allows local storage and try refreshing.</p>';
            }
        }
    }

    // --- Run Initialization ---
    initializeStartupPage();
});
import { openDatabase, getBibleCount, addBibleToIndexedDB } from '../database/db.js';
import { parseBibleXML } from '../utils/parser.js';

document.addEventListener('DOMContentLoaded', () => {
    const installBiblesModal = document.getElementById('installBiblesModal');
    const closeInstallModalBtn = document.getElementById('closeInstallModalBtn');
    const installSelectedBiblesBtn = document.getElementById('installSelectedBiblesBtn');
    const installProgressBarLabel = document.getElementById('installProgressBarLabel');
    const installProgressBarFill = document.getElementById('installProgressBarFill');
    const openInstallModalBtn = document.getElementById('openInstallModalBtn');
    const skipCheckbox = document.getElementById('skipStartupCheckbox');

    const defaultBibles = [
        { id: 'EnglishNKJBible.xml', name: 'New King James Bible', url: 'https://cdn.jsdelivr.net/gh/Beblia/Holy-Bible-XML-Format/EnglishNKJBible.xml' },
        { id: 'EnglishAmplifiedBible.xml', name: 'Amplified Bible', url: 'https://cdn.jsdelivr.net/gh/Beblia/Holy-Bible-XML-Format/EnglishAmplifiedBible.xml' },
        { id: 'AmharicNASVBible.xml', name: 'Amharic NASV', url: 'https://cdn.jsdelivr.net/gh/Beblia/Holy-Bible-XML-Format/AmharicNASVBible.xml' },
        { id: 'AmharicNSTBible.xml', name: 'Amharic NST', url: 'https://cdn.jsdelivr.net/gh/Beblia/Holy-Bible-XML-Format/AmharicNSTBible.xml' }
    ];

    function showModal(modalElement) {
        modalElement.style.display = 'block';
        setTimeout(() => modalElement.classList.add('visible'), 10);
    }

    function hideModal(modalElement) {
        modalElement.classList.remove('visible');
        setTimeout(() => modalElement.style.display = 'none', 300);
    }

    async function checkAndShowInstallModal() {
        try {
            const count = await getBibleCount();
            if (count === 0) {
                showModal(installBiblesModal);
            }
        } catch (error) {
            console.error('Failed to check Bible count, showing modal as fallback:', error);
            showModal(installBiblesModal);
        }
    }

    async function installSelectedBibles() {
        const selectedBibles = Array.from(document.querySelectorAll('input[name="bibleToInstall"]:checked'))
                                  .map(checkbox => ({
                                      id: checkbox.value,
                                      name: checkbox.dataset.name,
                                      url: defaultBibles.find(b => b.id === checkbox.value).url
                                  }));

        if (selectedBibles.length === 0) {
            alert('Please select at least one Bible to install.');
            return;
        }

        installSelectedBiblesBtn.disabled = true;
        installProgressBarLabel.textContent = 'Starting installation...';
        installProgressBarFill.style.width = '0%';

        for (let i = 0; i < selectedBibles.length; i++) {
            const bible = selectedBibles[i];
            installProgressBarLabel.textContent = `Installing ${bible.name} (${i + 1}/${selectedBibles.length})...`;
            installProgressBarFill.style.width = `${((i + 0.5) / selectedBibles.length) * 100}%`;

            try {
                const response = await fetch(bible.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const xmlText = await response.text();
                const parsedBible = parseBibleXML(xmlText);
                await addBibleToIndexedDB(parsedBible);
                console.log(`${bible.name} installed successfully.`);
                installProgressBarFill.style.width = `${((i + 1) / selectedBibles.length) * 100}%`;
            } catch (error) {
                console.error(`Failed to install ${bible.name}:`, error);
                installProgressBarLabel.textContent = `Error installing ${bible.name}. See console for details.`;
                installProgressBarFill.style.backgroundColor = 'red';
                return; 
            }
        }

        installProgressBarLabel.textContent = 'Installation complete!';
        installProgressBarFill.style.width = '100%';
        installProgressBarFill.style.backgroundColor = 'var(--brand-color)'; 

        setTimeout(() => {
            hideModal(installBiblesModal);
            window.location.href = 'app.html';
        }, 1500);
    }

    // Skip startup checkbox logic
    const skipKey = 'skipStartupPage';
    if (localStorage.getItem(skipKey) === 'true') {
        document.body.style.display = 'none';
        window.location.href = 'app.html';
        return;
    }
    skipCheckbox.checked = localStorage.getItem(skipKey) === 'true';
    skipCheckbox.addEventListener('change', function() {
        localStorage.setItem(skipKey, this.checked ? 'true' : 'false');
    });
    
    // Event Listeners
    closeInstallModalBtn.addEventListener('click', () => hideModal(installBiblesModal));
    installSelectedBiblesBtn.addEventListener('click', installSelectedBibles);
    openInstallModalBtn.addEventListener('click', () => showModal(installBiblesModal));

    // Initial check
    checkAndShowInstallModal();
});

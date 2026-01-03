// scripts/tsk_manager.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const TSK_STORE_NAME = 'tsk_data'; 

    // --- 1. DEFINE MAP (Fallback) ---
    const LOCAL_TSK_MAP = {
        "ge": "Genesis", "ex": "Exodus", "le": "Leviticus", "nu": "Numbers", "de": "Deuteronomy",
        "jos": "Joshua", "jud": "Judges", "ru": "Ruth", "1sa": "1 Samuel", "2sa": "2 Samuel",
        "1ki": "1 Kings", "2ki": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles", "ezr": "Ezra",
        "ne": "Nehemiah", "es": "Esther", "job": "Job", "ps": "Psalms", "pr": "Proverbs",
        "ec": "Ecclesiastes", "so": "Song of Solomon", "isa": "Isaiah", "jer": "Jeremiah", "la": "Lamentations",
        "eze": "Ezekiel", "da": "Daniel", "ho": "Hosea", "joe": "Joel", "am": "Amos",
        "ob": "Obadiah", "jon": "Jonah", "mic": "Micah", "na": "Nahum", "hab": "Habakkuk",
        "zep": "Zephaniah", "hag": "Haggai", "zec": "Zechariah", "mal": "Malachi", "mt": "Matthew",
        "mr": "Mark", "lu": "Luke", "joh": "John", "ac": "Acts", "ro": "Romans",
        "1co": "1 Corinthians", "2co": "2 Corinthians", "ga": "Galatians", "eph": "Ephesians", "php": "Philippians",
        "col": "Colossians", "1th": "1 Thessalonians", "2th": "2 Thessalonians", "1ti": "1 Timothy", "2ti": "2 Timothy",
        "tit": "Titus", "phm": "Philemon", "heb": "Hebrews", "jas": "James", "1pe": "1 Peter",
        "2pe": "2 Peter", "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", "jude": "Jude", "re": "Revelation"
    };

    // --- 2. INJECT CSS FOR FULL SCREEN ---
    const style = document.createElement('style');
    style.innerHTML = `
        .tsk-full-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--bg-color);
            z-index: 2000; /* Above everything */
            display: flex;
            flex-direction: column;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .tsk-full-screen.active {
            transform: translateY(0);
        }
        
        /* Desktop Layout: Side by Side */
        @media (min-width: 768px) {
            .tsk-body-container {
                flex-direction: row !important;
            }
            #tskListPane {
                flex: 1;
                border-right: 1px solid var(--options-panel-border);
            }
            #tskPreviewPane {
                flex: 1;
                border-bottom: none !important;
                border-left: 1px solid var(--options-panel-border);
            }
        }

        /* Mobile Layout: Top/Bottom */
        @media (max-width: 767px) {
            .tsk-body-container {
                flex-direction: column !important;
            }
            #tskPreviewPane {
                flex: 0 0 35%; /* Fixed height for preview on mobile */
                border-bottom: 2px solid var(--brand-color);
            }
            #tskListPane {
                flex: 1;
            }
        }
    `;
    document.head.appendChild(style);


    // --- 3. DOM INJECTION (Full Screen Structure) ---
    if (!document.getElementById('tskPanel')) {
        const panelHTML = `
            <div id="tskPanel" class="tsk-full-screen">
                
                <!-- Header (Fixed Top) -->
                <div class="side-panel-header" style="flex: 0 0 auto; background-color: var(--navbar-bg); color: var(--navbar-text);">
                    <h2 class="side-panel-title" id="tskPanelTitle" style="color: var(--brand-color); cursor: pointer;" title="Click to show original verse">Treasury</h2>
                    <button id="panelCloseBtnTsk" class="modal-close-btn" style="color: var(--navbar-text); font-size: 2rem;">&times;</button>
                </div>

                <!-- Body Container (Flexible) -->
                <div class="tsk-body-container" style="flex: 1 1 auto; display:flex; overflow:hidden;">
                    
                    <!-- SECTION 1: PREVIEW PANE -->
                    <div id="tskPreviewPane" style="
                        padding: 20px; 
                        background-color: var(--verse-card-bg); 
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    ">
                        <div style="font-size:0.9em; color:var(--brand-color); margin-bottom:10px; font-weight:bold; text-transform: uppercase; border-bottom: 1px solid var(--options-panel-border); padding-bottom: 5px;">
                            Preview: <span id="tskPreviewRef" style="color: var(--text-color);">...</span>
                        </div>
                        <div id="tskPreviewText" style="
                            font-style: italic; 
                            color: var(--verse-text-color); 
                            font-family: var(--verse-font-family);
                            font-size: 1.1em;
                            margin-bottom: 15px;
                            overflow-y: auto;
                            flex-grow: 1;
                        ">
                            Tap a reference to view text here.
                        </div>
                        <button id="tskJumpBtn" class="dm-button" style="
                            width: 100%;
                            padding: 12px;
                            font-weight: bold;
                            display:none; 
                        ">
                            Go to this Verse
                        </button>
                    </div>

                    <!-- SECTION 2: LIST PANE -->
                    <div id="tskListPane" style="
                        overflow-y: auto; 
                        padding: 15px;
                        background-color: var(--bg-color);
                    ">
                        <!-- Content -->
                    </div>

                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    // --- 4. BIND TO BRAND REF (Safe Method) ---
    const brandArea = document.getElementById('dynamicBrandArea');
    if (brandArea) {
        brandArea.style.cursor = 'pointer';
        brandArea.title = "Open Treasury (TSK)";
        
        brandArea.addEventListener('click', (e) => {
            e.preventDefault();
            openTskPanel();
        });
        
        console.log("TSK Manager: Attached to dynamicBrandArea");
    } else {
        console.warn("TSK Manager: #dynamicBrandArea not found.");
    }

    // --- Elements ---
    const tskPanel = document.getElementById('tskPanel');
    const panelCloseBtnTsk = document.getElementById('panelCloseBtnTsk');
    const tskPanelTitle = document.getElementById('tskPanelTitle');
    const tskPreviewRef = document.getElementById('tskPreviewRef');
    const tskPreviewText = document.getElementById('tskPreviewText');
    const tskJumpBtn = document.getElementById('tskJumpBtn');
    const tskListPane = document.getElementById('tskListPane');

    // --- Helpers ---

    function getFullBookName(abbrev) {
        const lowerAbbrev = abbrev.toLowerCase();
        if (window.TSK_ABBREV_MAP && window.TSK_ABBREV_MAP[lowerAbbrev]) {
            return window.TSK_ABBREV_MAP[lowerAbbrev];
        }
        if (LOCAL_TSK_MAP[lowerAbbrev]) {
            return LOCAL_TSK_MAP[lowerAbbrev];
        }
        return abbrev.charAt(0).toUpperCase() + abbrev.slice(1);
    }

    function linkifyTskRefs(refString) {
        if (!refString) return "";
        const segments = refString.split(';');
        
        const htmlParts = segments.map(segment => {
            let text = segment.trim();
            if (!text) return "";

            const match = text.match(/^([1-3]?[a-zA-Z]+)\s+(\d+):(\d+)(?:-(\d+))?(.*)$/);

            if (match) {
                const rawAbbrev = match[1];
                const chapter = match[2];
                const startVerse = match[3];
                const rangeEnd = match[4]; 
                const remainder = match[5]; 

                const fullBookName = getFullBookName(rawAbbrev);
                
                const mainDisplayRef = `${rawAbbrev} ${chapter}:${startVerse}${rangeEnd ? '-'+rangeEnd : ''}`;
                const mainDataRef = `${fullBookName} ${chapter}:${startVerse}`;
                
                let html = `<span class="tsk-ref-link" data-ref="${mainDataRef}">${mainDisplayRef}</span>`;

                if (remainder && remainder.trim().length > 0) {
                    const extras = remainder.split(',');
                    extras.forEach(extra => {
                        const cleanExtra = extra.trim();
                        if (/^\d+$/.test(cleanExtra)) {
                            const extraDataRef = `${fullBookName} ${chapter}:${cleanExtra}`;
                            html += `, <span class="tsk-ref-link" data-ref="${extraDataRef}">${cleanExtra}</span>`;
                        } 
                        else if (/^\d+-\d+$/.test(cleanExtra)) {
                            const rangeStart = cleanExtra.split('-')[0];
                            const extraDataRef = `${fullBookName} ${chapter}:${rangeStart}`;
                            html += `, <span class="tsk-ref-link" data-ref="${extraDataRef}">${cleanExtra}</span>`;
                        }
                        else if (cleanExtra) {
                            html += `, ${cleanExtra}`;
                        }
                    });
                }
                return html;
            } else {
                return text;
            }
        });
        return htmlParts.join('; ');
    }

    function getVerseTextForPreview(refKey) {
        if (!window.fullBibleVerses || window.fullBibleVerses.length === 0) {
            return "Active Bible translation not loaded.";
        }
        const parts = window.parseBibleReferenceWithNote(refKey);
        if (!parts) return `Invalid Ref: ${refKey}`;

        const targetBook = parts.book.toLowerCase();
        const found = window.fullBibleVerses.find(v => 
            (v._book.toLowerCase() === targetBook) &&
            v._chapter === parts.chapter &&
            v._verse === parts.startVerse
        );
        return found ? found.text : `(Text not found for ${refKey})`;
    }

    function updatePreviewPane(refString) {
        tskPreviewRef.textContent = refString;
        tskPreviewText.textContent = getVerseTextForPreview(refString);
        
        // Show button to jump to the previewed verse
        tskJumpBtn.style.display = 'block'; 
        
        tskJumpBtn.onclick = () => {
            if (typeof window.jumpToReference === 'function') {
                window.jumpToReference(refString);
                closeTskPanel(); 
            }
        };
    }

    // --- Logic: Open Panel ---
    async function openTskPanel() {
        tskPanel.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling

        if (!db) {
            tskListPane.innerHTML = '<p>Database not ready.</p>';
            return;
        }

        let currentVerse = null;
        if (typeof window.getCurrentVerseData === 'function') {
            currentVerse = await window.getCurrentVerseData();
        }

        if (!currentVerse || !currentVerse.reference) {
            tskListPane.innerHTML = '<div style="padding:20px; text-align:center;">No active verse selected.</div>';
            tskPreviewText.textContent = "Select a verse in the Bible first.";
            tskJumpBtn.style.display = 'none';
            return;
        }

        const refKey = currentVerse.reference;
        const verseText = currentVerse.text || "Loading text...";

        // --- SETUP TITLE CLICK BEHAVIOR ---
        tskPanelTitle.textContent = `TSK: ${refKey}`;
        tskPanelTitle.onclick = () => {
            // 1. Reset Preview Pane to Source Verse
            tskPreviewRef.textContent = refKey;
            tskPreviewText.textContent = verseText;
            
            // 2. Hide jump button (we are already there)
            tskJumpBtn.style.display = 'none';

            // 3. Reset list highlighting
            const links = tskListPane.querySelectorAll('.tsk-ref-link');
            links.forEach(l => {
                l.style.fontWeight = 'normal';
                l.style.textDecoration = 'none';
            });
        };

        // --- INIT PREVIEW WITH SOURCE VERSE ---
        tskPreviewRef.textContent = refKey;
        tskPreviewText.textContent = verseText;
        tskJumpBtn.style.display = 'none';

        tskListPane.innerHTML = '<div style="padding:20px;">Loading Treasury data...</div>';

        try {
            const transaction = db.transaction(TSK_STORE_NAME, 'readonly');
            const store = transaction.objectStore(TSK_STORE_NAME);
            const request = store.get(refKey);

            request.onsuccess = () => {
                const result = request.result;
                
                if (!result || !result.entries || result.entries.length === 0) {
                    tskListPane.innerHTML = `
                        <div style="text-align:center; opacity:0.7; margin-top:40px;">
                            <h3>No TSK Entries</h3>
                            <p>No cross-references found for <strong>${refKey}</strong>.</p>
                        </div>`;
                    return;
                }

                // Build List
                let html = `<div class="tsk-content" style="padding-bottom:50px;">`;
                result.entries.forEach(entry => {
                    const linkedRefs = linkifyTskRefs(entry.refs);
                    
                    html += `
                        <div class="tsk-item" style="padding:15px 0; border-bottom:1px solid var(--options-panel-item-hover-bg);">
                            <div class="tsk-word" style="font-size:1.1em; font-weight:bold; color:var(--brand-color); margin-bottom:6px;">${entry.word}</div>
                            <div class="tsk-refs" style="line-height:1.6; color:var(--text-color); font-size:1em;">${linkedRefs}</div>
                        </div>
                    `;
                });
                html += `</div>`;
                
                tskListPane.innerHTML = html;

                // Attach Listeners
                const links = tskListPane.querySelectorAll('.tsk-ref-link');
                links.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Clear old highlights
                        links.forEach(l => {
                            l.style.fontWeight = 'normal';
                            l.style.textDecoration = 'none';
                        });
                        
                        // Set new highlight
                        e.target.style.fontWeight = 'bold';
                        e.target.style.textDecoration = 'underline';

                        const targetRef = e.target.dataset.ref;
                        updatePreviewPane(targetRef);
                    });
                });
            };

            request.onerror = (e) => {
                tskListPane.innerHTML = '<p style="color:var(--brand-color);">Error loading TSK data.</p>';
            };
        } catch (err) {
            tskListPane.innerHTML = `<p>Error: ${err.message}.</p>`;
        }
    }

    function closeTskPanel() {
        tskPanel.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    // --- Init ---
    if (panelCloseBtnTsk) panelCloseBtnTsk.addEventListener('click', closeTskPanel);

    window.openTskPanel = openTskPanel;
});
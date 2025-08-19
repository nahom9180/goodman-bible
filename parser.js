const BIBLE_BOOK_NAMES_BY_NUMBER = [
    null, "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

function getBookNameByStandardNumber(bookNumber) {
    const num = parseInt(bookNumber, 10);
    if (num >= 1 && num < BIBLE_BOOK_NAMES_BY_NUMBER.length) {
        return BIBLE_BOOK_NAMES_BY_NUMBER[num];
    }
    console.warn(`Book number ${bookNumber} not found in standard list.`);
    return `Book ${bookNumber}`;
}

export function parseXMLData(xmlText, fileName) {
    const parsedVerses = [];
    const translationId = fileName;
    let displayName = fileName.replace(/\.xml$/i, '').replace(/_/g, ' ');

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const errNode = xmlDoc.querySelector("parsererror");
        if (errNode) {
            const errorDetails = errNode.textContent || "Unknown XML parsing error.";
            console.error("XML Parse Error Details:", errorDetails);
            throw new Error("XML Parse Error: " + errorDetails.split('\n')[0]);
        }

        const zefaniaBooks = xmlDoc.getElementsByTagName("b");
        if (zefaniaBooks.length > 0) {
            console.log("Attempting to parse as Zefania XML format...");
            for (const bookNode of zefaniaBooks) {
                const bookName = bookNode.getAttribute("n");
                if (!bookName) continue;
                const chapters = bookNode.getElementsByTagName("c");
                for (const chapNode of chapters) {
                    const chapNumStr = chapNode.getAttribute("n");
                    if (!chapNumStr) continue;
                    const chapNum = parseInt(chapNumStr);
                    const verseNodes = chapNode.getElementsByTagName("v");
                    for (const vNode of verseNodes) {
                        const vNumStr = vNode.getAttribute("n");
                        if (!vNumStr) continue;
                        const vNum = parseInt(vNumStr);
                        let vText = vNode.textContent.trim().replace(/^\d+\s*/, '');
                        parsedVerses.push({
                            text: vText,
                            reference: `${bookName} ${chapNum}:${vNum}`,
                            _book: bookName.trim().toLowerCase(),
                            _chapter: chapNum,
                            _verse: vNum
                        });
                    }
                }
            }
            if (parsedVerses.length > 0) {
                let zefaniaTitleNode = xmlDoc.querySelector("information title") ||
                                       xmlDoc.querySelector("information key[name='title']") ||
                                       xmlDoc.querySelector("identification title");
                if (zefaniaTitleNode && zefaniaTitleNode.textContent) {
                    displayName = zefaniaTitleNode.textContent.trim();
                }
            }
        }

        if (parsedVerses.length === 0) {
            console.log("Zefania parsing yielded no verses. Attempting numbered book format...");
            const bibleNode = xmlDoc.querySelector("bible");
            if (bibleNode) {
                const translationAttr = bibleNode.getAttribute("translation");
                if (translationAttr) displayName = translationAttr.trim();

                const bookNodes = xmlDoc.getElementsByTagName("book");
                if (bookNodes.length > 0) {
                    for (const bookNode of bookNodes) {
                        const bookNumberAttr = bookNode.getAttribute("number");
                        if (!bookNumberAttr) continue;
                        const bookName = getBookNameByStandardNumber(bookNumberAttr);
                        const chapters = bookNode.getElementsByTagName("chapter");
                        for (const chapNode of chapters) {
                            const chapNumAttr = chapNode.getAttribute("number");
                            if (!chapNumAttr) continue;
                            const chapNum = parseInt(chapNumAttr);
                            const verseNodes = chapNode.getElementsByTagName("verse");
                            for (const vNode of verseNodes) {
                                const vNumAttr = vNode.getAttribute("number");
                                if (!vNumAttr) continue;
                                const vNum = parseInt(vNumAttr);
                                let vText = vNode.textContent.trim();
                                parsedVerses.push({
                                    text: vText,
                                    reference: `${bookName} ${chapNum}:${vNum}`,
                                    _book: bookName.trim().toLowerCase(),
                                    _chapter: chapNum,
                                    _verse: vNum
                                });
                            }
                        }
                    }
                }
            }
        }
        if (parsedVerses.length === 0) {
            throw new Error("No verses found in XML after attempting all known formats.");
        }
        return { verses: parsedVerses, translationId: translationId, displayName: displayName };
    } catch (error) {
        console.error("XML Parsing Critical Error:", error, "Input filename:", fileName);
        return null;
    }
}

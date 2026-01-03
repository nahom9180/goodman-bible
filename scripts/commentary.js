// scripts/commentary.js

// 1. Map TSK Numbers (1-66) to Full Book Names
const TSK_BOOK_MAP = {
    1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
    6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
    16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
    21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
    26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
    31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
    36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
    41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
    46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
    51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
    56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
    61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
};

// 2. Map TSK Abbreviations (from readme) to Full Book Names for link detection
const TSK_ABBREV_MAP = {
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

/**
 * Generates the ID used in IndexedDB.
 * Format: "BookName Chapter:Verse" (e.g., "Genesis 1:1")
 */
function getTskId(bookNum, chapter, verse) {
    const bookName = TSK_BOOK_MAP[parseInt(bookNum)];
    if (!bookName) return null;
    return `${bookName} ${chapter}:${verse}`;
}

/**
 * Parses the TSK reference string (e.g., "ge 1:1") and returns a clean 
 * reference object or null if invalid.
 */
function parseTskReference(refString) {
    // TSK format is roughly: "abbrev chapter:verse" or "abbrev chapter:verse-verse"
    // Regex looks for: start of string, known abbreviation, space, numbers
    const parts = refString.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const abbrev = parts[0].toLowerCase();
    const numbers = parts[1];

    if (TSK_ABBREV_MAP[abbrev]) {
        return {
            book: TSK_ABBREV_MAP[abbrev],
            ref: `${TSK_ABBREV_MAP[abbrev]} ${numbers}`,
            original: refString
        };
    }
    return null;
}

// Expose globally
window.getTskId = getTskId;
window.parseTskReference = parseTskReference;
window.TSK_ABBREV_MAP = TSK_ABBREV_MAP;
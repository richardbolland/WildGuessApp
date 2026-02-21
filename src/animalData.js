import { useState, useEffect } from 'react';

const SHEET_URLS = {
    "Africa": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=0&single=true&output=csv", 
    "Asia": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=1068676948&single=true&output=csv",
    "Europe": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=1320626933&single=true&output=csv",
    "North America": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=1830200360&single=true&output=csv", // <-- Added the space here!
    "South America": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=1119979844&single=true&output=csv",
    "Oceania": "https://docs.google.com/spreadsheets/d/e/YOUR_OCEANIA_LINK_HERE/pub?output=csv",
    
    // FALLBACK
    "Any": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqewGCZNbrYaCLnvN3EBwCLLCdy6hB3SSZ08p6slZTF-sXpC-RM1zeIS8LSklyPeRp73xDL1IAO5_o/pub?gid=0&single=true&output=csv", 
};

// HELPER: Bulletproof CSV Parser (Handles Alt+Enter line breaks inside Google Sheets)
const parseCSV = (text) => {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    // Read the document character by character to safely ignore line breaks inside quotes
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            inQuotes = !inQuotes; // Toggle quote state
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell.trim());
            if (currentRow.length > 1) rows.push(currentRow); // Only push if it's a real row
            currentRow = [];
            currentCell = '';
        } else {
            // If it's a newline BUT we are inside quotes, replace it with a space instead of breaking!
            if (char === '\n' && inQuotes) {
                currentCell += ' ';
            } else if (char !== '\r') {
                currentCell += char;
            }
        }
    }
    
    // Push the very last row if the file didn't end with a newline
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.length > 1) rows.push(currentRow);
    }

    // Map the values to the header names
    const headers = rows[0].map(h => h.replace(/^"|"$/g, ''));
    
    return rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = row[index] ? row[index].replace(/^"|"$/g, '') : '';
        });
        return entry;
    });
};
export const useAnimalData = (selectedRegion) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // NEW: Keep track of which region's data is actually currently in the 'animals' array
    const [loadedRegion, setLoadedRegion] = useState(null); 

    useEffect(() => {
        const fetchAnimals = async () => {
            setLoading(true);
            try {
                let rawData = [];

if (selectedRegion === "Any") {
                    // 1. Fetch multiple sheets at the same time
                    const urlsToFetch = [
                        SHEET_URLS["Africa"], 
                        SHEET_URLS["Asia"],
                        SHEET_URLS["Europe"],
                        SHEET_URLS["South America"],
                        SHEET_URLS["North America"] // <-- Added North America here!
                    ];
                    const responses = await Promise.all(urlsToFetch.map(url => fetch(url)));
                    const texts = await Promise.all(responses.map(res => res.text()));
                    
                    // 2. Combine them into one big list
                    texts.forEach(text => {
                        rawData = rawData.concat(parseCSV(text));
                    });
                } else {
                    // 3. Normal single-region fetch
                    const url = SHEET_URLS[selectedRegion] || SHEET_URLS["Africa"];
                    const response = await fetch(url);
                    const text = await response.text();
                    rawData = parseCSV(text);
                            }

                // --- NEW DEBUGGING FORMATTER ---
                const formattedAnimals = [];
                const rejectedAnimals = [];
                const seenNames = new Set(); // ⬅️ NEW: Track names to prevent duplicates

                rawData.forEach(row => {
                    const parsedId = parseInt(row['Taxon_ID']);
                    const name = row['Name'];

                    // Check if it's a valid animal with both a Name and a Number ID
                    if (name && parsedId) {
                        
                        // ⬇️ NEW: Only add the animal if we haven't seen its exact name yet
                        if (!seenNames.has(name)) {
                            seenNames.add(name); // Add it to our checklist
                            
                            formattedAnimals.push({
                                name: name,
                                correctName: name, 
                                emoji: row['Emoji'],
                                sciName: row['SciName'],
                                displayLatin: row['SciName'],
                                id: parsedId, 
                                category: row['Animal Category'],
                                clue1: row['Clue 1'],
                                clue2: row['Clue 2'],
                                family: "Unknown", 
                                groupEmoji: row['Emoji'],
                                region: row['region']
                            });
                        }
                        
                    } else {
                        // If it failed the filter, save it to our rejected list!
                        if (name || row['Taxon_ID']) {
                            rejectedAnimals.push({ 
                                name: name || "MISSING NAME", 
                                rawIdCell: row['Taxon_ID'] || "BLANK" 
                            });
                        }
                    }
                });

                // If any animals were rejected, print a massive warning in the console
                if (rejectedAnimals.length > 0) {
                    console.warn(`🚨 FILTER CAUGHT ${rejectedAnimals.length} BROKEN ANIMALS:`, rejectedAnimals);
                }

                setAnimals(formattedAnimals);


                // NEW: Tell the app that THIS specific region is fully processed and ready
                setLoadedRegion(selectedRegion); 
            } catch (err) {
                console.error("Failed to load animal data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, [selectedRegion]);

    // NEW: Return loadedRegion so App.jsx can use it
    return { animals, loading, error, loadedRegion }; 
};
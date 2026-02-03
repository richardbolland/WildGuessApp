            import { useState, useEffect, useRef, useMemo } from 'react';
            import L from 'leaflet';
            import 'leaflet/dist/leaflet.css';
            import { ANIMAL_GROUPS } from './animals';
            import { auth, db, analytics } from './firebase';
            import { logEvent } from "firebase/analytics";
            import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
            import { 
                doc, 
                getDoc, 
                setDoc, 
        updateDoc,  // New
        increment,  // New
        addDoc,     // New
        collection, // New
        serverTimestamp,
    // --- NEW IMPORTS BELOW ---
    query,
    orderBy,
    limit,
    getDocs
} from "firebase/firestore";

            // Flatten data for easy access
    const ALL_ANIMALS_FLAT = ANIMAL_GROUPS.reduce((acc, group) => {
        return acc.concat(group.animals.map(a => ({...a, group: group.name, groupEmoji: group.emoji})));
    }, []).sort((a, b) => a.name.localeCompare(b.name));

            // --- COMPONENT: MapClue (With Cinematic FlyTo Animation) ---
    const MapClue = ({ lat, lng, zoom }) => {
        const mapRef = useRef(null);
        const mapInstanceRef = useRef(null);
        const markerRef = useRef(null);
        const resizeObserverRef = useRef(null);

                // 1. Initialize Map
        useEffect(() => {
            if (mapRef.current && !mapInstanceRef.current) {
                mapInstanceRef.current = L.map(mapRef.current, {
                    zoomControl: false, attributionControl: false, dragging: false,
                    scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, 
                }).setView([lat, lng], zoom);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                    maxZoom: 19
                }).addTo(mapInstanceRef.current);

                const icon = L.divIcon({
                    className: 'custom-pin', html: `<div></div>`,
                    iconSize: [20, 20], iconAnchor: [10, 10]
                });

                markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);

                resizeObserverRef.current = new ResizeObserver(() => {
                    if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                });
                resizeObserverRef.current.observe(mapRef.current);
            }

                    // Cleanup function
            return () => {
                if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                }
            };
        }, []);

                // 2. React to props updates (Cinematic Zoom)
        useEffect(() => {
            if (mapInstanceRef.current && markerRef.current) {
                        // Use flyTo for the smooth zoom effect
                mapInstanceRef.current.flyTo([lat, lng], zoom, {
                    animate: true,
                            duration: 2.0 // 2 seconds for a nice slow cinematic feel
                        });
                markerRef.current.setLatLng([lat, lng]);
            }
        }, [lat, lng, zoom]);

        return <div ref={mapRef} className="w-full h-full"></div>;
    };

            // --- HELPER: Filter Low Quality Records ---
    const isLowQualityRecord = (record) => {
        if (record.annotations && record.annotations.length > 0) {
            for (const note of record.annotations) {
                        if (note.attribute_id === 22 && note.value_id !== 28) return true; // Not Organism
                        if (note.attribute_id === 9 && note.value_id === 10) return true; // Dead
                    }
                }
                const dynProps = (record.dynamicProperties || "").toLowerCase().replace(/\s/g, "");
                if (dynProps.includes('"evidenceofpresence":"track"') || dynProps.includes('"evidenceofpresence":"scat"') || dynProps.includes('"vitality":"dead"')) return true;

                const bannedKeywords = ["track", "print", "footprint", "paw", "scat", "feces", "dropping", "poop", "dung", "burrow", "nest", "den", "moult", "shed", "dead", "roadkill", "carcass", "remains", "bone", "skull", "skeleton", "corpse"];
                const textFields = [record.occurrenceRemarks, record.fieldNotes, record.media?.[0]?.description, record.media?.[0]?.title, record.occurrenceStatus].filter(Boolean).join(" ").toLowerCase();
                return bannedKeywords.some(keyword => textFields.includes(keyword));
            };

            // --- COMPONENT: CountdownScreen ---
            const CountdownScreen = ({ onComplete, stickers, isReady }) => {
                const [count, setCount] = useState(3);
                const [emoji, setEmoji] = useState("🦁");
                const emojis = ["🦁", "🐯", "🐻", "🐨", "🐼", "🐸", "🐙", "🦊", "🦓", "🦄", "🦅", "🐝", "🦀", "🦖"];

                // Timer Logic
                useEffect(() => {
                    if (count > 0) {
                        const timer = setTimeout(() => setCount(c => c - 1), 1000);
                        return () => clearTimeout(timer);
                    }
                }, [count]);

                // Completion Logic (Wait for Data)
                useEffect(() => {
                    if (count === 0 && isReady) {
                        const timer = setTimeout(onComplete, 500);
                        return () => clearTimeout(timer);
                    }
                }, [count, isReady, onComplete]);

                useEffect(() => {
                    const interval = setInterval(() => {
                        setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
                    }, 150);
                    return () => clearInterval(interval);
                }, []);

                return (
                    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-900 to-green-700 overflow-hidden relative text-white">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                            {stickers && stickers.map((sticker) => (
                                <div key={sticker.id} className="absolute emoji-sticker transition-transform duration-1000 ease-in-out" style={{ top: `${sticker.top}%`, left: `${sticker.left}%`, fontSize: `${sticker.size}rem`, transform: `rotate(${sticker.rotation}deg)`, opacity: sticker.opacity }}>{sticker.emoji}</div>
                                ))}
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-4xl font-black mb-8 animate-pulse text-emerald-100 drop-shadow-md tracking-wider uppercase">GET READY</h2>
                            
                            {/* Dynamic Counter Text */}
                            <div className="text-9xl mb-8 font-mono font-bold drop-shadow-2xl text-white">
                                {count > 0 ? count : (isReady ? "GO!" : <span className="text-6xl animate-pulse">📡</span>)}
                            </div>
                            
                            {/* Status Message if Waiting */}
                            {count === 0 && !isReady && (
                                <div className="text-emerald-200 font-mono font-bold uppercase tracking-widest animate-pulse mb-4">
                                    Acquiring Target Data...
                                </div>
                                )}

                            <div className="text-7xl swap-anim filter drop-shadow-xl">{emoji}</div>
                        </div>
                    </div>
                    );
            };

            // --- MAIN COMPONENT: WildGuessGame ---
            // REPLACE ONLY THE WildGuessGame COMPONENT
            const WildGuessGame = () => {
                // --- STATE HOOKS ---
                const [view, setView] = useState('menu');
                const [animalData, setAnimalData] = useState(null);
                const [preloadedData, setPreloadedData] = useState(null);
                const [currentClueIndex, setCurrentClueIndex] = useState(0);
                const [timeLeft, setTimeLeft] = useState(15);
                const [roundScore, setRoundScore] = useState(5);
                const [guessLocked, setGuessLocked] = useState(false);
                const [wrongGuesses, setWrongGuesses] = useState([]);
                const [gameResult, setGameResult] = useState(null);
                const [selectedGroup, setSelectedGroup] = useState(null); 
                const [gameId, setGameId] = useState(0);
                const [searchTerm, setSearchTerm] = useState("");
                const [user, setUser] = useState(null);
                const [username, setUsername] = useState("");
                const [isProfileSetup, setIsProfileSetup] = useState(false);
                const [authLoading, setAuthLoading] = useState(true);
                const [isSaving, setIsSaving] = useState(false);
                const [showLeaderboard, setShowLeaderboard] = useState(false);
                const [leaderboardData, setLeaderboardData] = useState([]);

                // --- LOADING & TUTORIAL STATE ---
                const [isLoading, setIsLoading] = useState(false);
                const [loadingProgress, setLoadingProgress] = useState(0);
                const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
                const [isTutorialMode, setIsTutorialMode] = useState(false);
                const [tutorialStep, setTutorialStep] = useState(0); 
                const [showToast, setShowToast] = useState(false);

                useEffect(() => {
                    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                        console.log("🔒 Auth State Changed:", currentUser ? "Logged In" : "Logged Out");

                        if (currentUser) {
                            setUser(currentUser);
                            console.log("👤 User ID:", currentUser.uid);

                            try {
                                console.log("📖 Reading Profile from Firestore...");
                                const userRef = doc(db, "users", currentUser.uid);
                                const userSnap = await getDoc(userRef);

                                if (userSnap.exists()) {
                                    console.log("✅ Profile FOUND:", userSnap.data());
                                    setUsername(userSnap.data().username);
                                    setIsProfileSetup(true);
                                } else {
                                    console.log("⚠️ No Profile Document found in Firestore for this ID.");
                                    setIsProfileSetup(false);
                                }
                            } catch (error) {
                                console.error("❌ READ ERROR:", error);
                                alert("Database Read Failed: " + error.message);
                            }
                        } else {
                            console.log("🕵️ Signing in Anonymously...");
                            signInAnonymously(auth).catch((error) => {
                                console.error("Auth Error:", error);
                            });
                        }
                        setAuthLoading(false);
                    });

                    return () => unsubscribe();
                }, []);

                // --- REFS --- 
                const timerRef = useRef(null);
                const LOADING_MESSAGES = ["Connecting to Satellite 🛰️", "Triangulating Signal 📡", "Tracking Wildlife 🐾", "Filtering Bad Data 🧹", "Verifying Coordinates 📍", "Consulting Biologists 👨‍🔬", "Loading Map Tiles 🗺️", "Enhancing Image 📸"];

                // --- TUTORIAL DATA (9 Steps) ---
                const TUTORIAL_DATA = [
                    { 
                        // Step 0: Map
                        title: "CLUE 1: THE MAP",
                        text: "📍 There is an **animal sighting** at this location. You'll have 4 more clues after this to make the best informed guess.",
                        positionClasses: "bottom-10 left-1/2 transform -translate-x-1/2 md:top-24 md:left-1/3 md:translate-x-0",
                        arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent",
                        buttonText: "Reveal Next Clue"
                    },
                    { 
                        // Step 1: Region
                        title: "CLUE 2: REGION",
                        text: "📉 The map zooms in and the **Location Name** appears. This will make it slightly easier to identify the animal.",
                        positionClasses: "bottom-10 left-1/2 transform -translate-x-1/2 md:top-32 md:left-10 md:translate-x-0",
                        arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent",
                        buttonText: "Reveal Next Clue"
                    },
                    { 
                        // Step 2: Taxonomy
                        title: "CLUE 3: TAXONOMY",
                        text: "🧬 Still unsure? Here is the **Family and Scientific Name**. We'll give you a chance to guess shortly...",
                        positionClasses: "bottom-10 left-1/2 transform -translate-x-1/2 md:top-56 md:left-10 md:translate-x-0",
                        arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent",
                        buttonText: "Reveal Next Clue"
                    },
                    { 
                        // Step 3: Hint
                        title: "CLUE 4: THE HINT",
                        text: "🔎 This is a **cryptic behavior or trait description**. Are you ready to make a wild guess?",
                        positionClasses: "bottom-10 left-1/2 transform -translate-x-1/2 md:top-80 md:left-10 md:translate-x-0",
                        arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent",
                        buttonText: "I'm Ready to Guess"
                    },
                    { 
                        // Step 4: Category Select
                        title: "MAKE A GUESS",
                        // UPDATED TEXT HERE:
                        text: "Start by selecting a **Category**. You can also look through **All Animals** or **search** for an animal if you find that easier.",
                        positionClasses: "top-24 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0",
                        arrowClasses: "-bottom-[10px] left-1/2 -translate-x-1/2 border-t-[10px] border-t-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent md:bottom-auto md:top-1/2 md:-right-[10px] md:left-auto md:translate-x-0 md:-translate-y-1/2 md:border-t-transparent md:border-b-transparent md:border-l-[10px] md:border-l-white md:border-r-0",
                        hideButton: true 
                    },
                    { 
                        // Step 5: Animal Select (First Guess)
                        title: "PICK THE ANIMAL",
                        text: "Choose the **animal** you think is at this sighting.",
                        positionClasses: "top-24 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0",
                        arrowClasses: "-bottom-[10px] left-1/2 -translate-x-1/2 border-t-[10px] border-t-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent md:bottom-auto md:top-1/2 md:-right-[10px] md:left-auto md:translate-x-0 md:-translate-y-1/2 md:border-t-transparent md:border-b-transparent md:border-l-[10px] md:border-l-white md:border-r-0",
                        hideButton: true
                    },
                    { 
                        // Step 6: Photo (Wrong Guess 1)
                        title: "WRONG! BUT WAIT...",
                        text: "Still didn't get it? Use the **photo** to make a final guess.",
                        positionClasses: "bottom-10 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0",
                        arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent md:bottom-auto md:top-1/2 md:-right-[10px] md:left-auto md:translate-x-0 md:-translate-y-1/2 md:border-t-transparent md:border-b-transparent md:border-l-[10px] md:border-l-white md:border-r-0",
                        hideButton: true
                    },
                    { 
                        // Step 7: WIN STATE
                        title: "SUCCESS!",
                        text: "Well done! You guessed correctly! Click **Play Again** to have another go.",
                        positionClasses: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                        arrowClasses: "hidden", 
                        buttonText: "Play Again"
                    },
                    { 
                        // Step 8: LOSE STATE
                        title: "GAME OVER",
                        text: "Oh well! At least you know what it is. Click **Play Again** to give it another go.",
                        positionClasses: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                        arrowClasses: "hidden", 
                        buttonText: "Play Again"
                    }
                ];

                const menuStickers = useMemo(() => {
                    const emojis = ["🦁", "🐸", "🦜", "🦋", "🦇", "🦒", "🐺", "🐞", "🐢", "🐍", "🐘", "🦘", "🐙", "🐻", "🐊", "🐅", "🦓", "🦏", "🦩", "🦉", "🐋", "🐝", "🐫", "🦈", "🦍", "🐎", "🐀", "🐖", "🐈", "🐕"];
                    const cols = 6; const rows = 5; const cellW = 100 / cols; const cellH = 100 / rows;
                    return emojis.slice(0, cols * rows).map((emoji, i) => {
                        const col = i % cols; const row = Math.floor(i / cols);
                        return {
                            id: i, emoji,
                            left: (col * cellW) + Math.random() * (cellW * 0.7),
                            top: (row * cellH) + Math.random() * (cellH * 0.7),
                            rotation: Math.floor(Math.random() * 60) - 30,
                            size: 3 + Math.random() * 2,
                            opacity: 0.1 + Math.random() * 0.1 
                        };
                    });
                }, []);

                useEffect(() => {
                    let interval;
                    if (isLoading) {
                        setLoadingProgress(0); setLoadingMsgIndex(0);
                        interval = setInterval(() => {
                            setLoadingProgress(prev => Math.min(prev + 5, 95)); 
                            setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
                        }, 400); 
                    }
                    return () => clearInterval(interval);
                }, [isLoading]);
                
                useEffect(() => { preloadNextGame(); }, []);


                // --- AUTO-FETCH LEADERBOARD ON MENU LOAD ---
    useEffect(() => {
        if (view === 'menu') {
            fetchLeaderboard();
        }
    }, [view]);

    // Update fetchLeaderboard to remove the "setShowLeaderboard(true)" line
    // We don't need the modal state anymore since it's always visible.
    const fetchLeaderboard = async () => {
        // setShowLeaderboard(true); <--- DELETE THIS LINE
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("totalScore", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            
            const leaders = [];
            querySnapshot.forEach((doc) => {
                leaders.push({ id: doc.id, ...doc.data() });
            });
            
            setLeaderboardData(leaders);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        }
    };

                // --- INITIALIZATION EFFECT ---
                useEffect(() => {
                    if (view === 'countdown') {
                        setWrongGuesses([]);
                        setRoundScore(5);
                        setGuessLocked(false);
                        setGameResult(null);
                        setSelectedGroup(null);
                        setGameId(prev => prev + 1); 
                        setCurrentClueIndex(-1);

                        const tutorialDone = localStorage.getItem('wildGuess_tutorial_complete');
                        if (!tutorialDone) {
                            setIsTutorialMode(true);
                            setTutorialStep(0);
                        } else {
                            setIsTutorialMode(false);
                        }

                        if (preloadedData) {
                            setAnimalData(preloadedData);
                            setPreloadedData(null);
                        } else {
                            setAnimalData(null); 
                            fetchValidAnimal().then(data => {
                                setAnimalData(data);
                            });
                        }
                    }
                }, [view]);

                const fetchValidAnimal = async () => {
                    const historyJSON = localStorage.getItem('wildGuess_played');
                    const reportedJSON = localStorage.getItem('wildGuess_reported'); // 1. Get Blacklist
                    
                    let played = historyJSON ? JSON.parse(historyJSON) : [];
                    let reported = reportedJSON ? JSON.parse(reportedJSON) : [];

                    const available = ALL_ANIMALS_FLAT.filter(a => !played.includes(a.name));

                    let target;
                    if (available.length === 0) {
                        played = [];
                        localStorage.removeItem('wildGuess_played');
                        target = ALL_ANIMALS_FLAT[Math.floor(Math.random() * ALL_ANIMALS_FLAT.length)];
                    } else {
                        target = available[Math.floor(Math.random() * available.length)];
                    }

                    if (!played.includes(target.name)) {
                     played.push(target.name);
                     localStorage.setItem('wildGuess_played', JSON.stringify(played));
                 }

                 const randomPage = Math.floor(Math.random() * 30) + 1; 

                    // --- CORRECT iNATURALIST IDs ---
                    // Exclude: Dead(19), Feather(23), Scat(25), Track(26), Bone(27), Molt(28), Gall(29), Egg(30)
                    // Keep: Organism(24)
                 const excludeTerms = "19,23,25,26,27,28,29,30"; 
                 const allowedLicenses = "cc0,cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa";
                 const excludeTaxa = "47144,47126,47170"; 

                 const fetchUrl = `https://api.inaturalist.org/v1/observations?taxon_name=${target.sciName}&quality_grade=research&photos=true&per_page=1&page=${randomPage}&without_taxon_id=${excludeTaxa}&without_term_value_id=${excludeTerms}&photo_license=${allowedLicenses}`;

                 console.log(`Hunting for: ${target.name} | Query: ${target.sciName}`);

                 try {
                    const response = await fetch(fetchUrl);
                    const data = await response.json();

                    if (!data.results || data.results.length === 0) {
                        console.warn("No valid results found, retrying...");
                        return fetchValidAnimal(); 
                    }

                    const obs = data.results[0];

                        // --- 2. BLACKLIST CHECK ---
                        // If this specific observation ID has been reported by the user, skip it.
                    if (reported.includes(obs.id)) {
                        console.warn(`Skipping reported bad data ID: ${obs.id}`);
                        return fetchValidAnimal();
                    }

                        // --- STRICT TAXON VERIFICATION ---
                    const obsSciName = obs.taxon?.name?.toLowerCase() || "";
                    const targetSciName = target.sciName.toLowerCase();
                    if (!obsSciName.includes(targetSciName)) {
                     console.warn(`MISMATCH: Asked for '${targetSciName}' but got '${obsSciName}'. Retrying...`);
                     return fetchValidAnimal();
                 }

                        // --- MANUAL "TRACK" CHECK ---
                 const badValueIds = [19, 23, 25, 26, 27, 28, 29, 30]; 
                 if (obs.annotations && obs.annotations.some(a => badValueIds.includes(a.value_id))) {
                     console.warn("Manual Filter: Caught a 'Track' or 'Scat'. Retrying...");
                     return fetchValidAnimal();
                 }

                        // --- TEXT FILTER ---
                 if (obs.description || (obs.tags && obs.tags.length > 0)) {
                    const text = (obs.description || "") + " " + (obs.tags || []).join(" ");
                    const lowerText = text.toLowerCase();
                    const badKeywords = ["dead", "carcass", "roadkill", "deceased", "skull", "bone", "skeleton", "remains", "track", "print", "footprint", "scat", "droppings", "feces", "zoo", "captive", "aquarium", "pet", "domestic"];
                    if (badKeywords.some(keyword => lowerText.includes(keyword))) {
                        console.warn("Manual Filter: Suspicious keyword. Retrying...");
                        return fetchValidAnimal();
                    }
                }

                const lat = obs.geojson?.coordinates[1] || obs.location?.split(',')[0];
                const lng = obs.geojson?.coordinates[0] || obs.location?.split(',')[1];

                if (!lat || !lng || !obs.photos || obs.photos.length === 0) return fetchValidAnimal(); 

                const dateObj = new Date(obs.observed_on || obs.created_at);
                const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

                return {
                            id: obs.id, // 3. STORE ID FOR REPORTING
                            name: target.name,           
                            correctName: target.name, 
                            sciName: target.displayLatin || target.sciName,     
                            family: target.family || "Unknown Family", 
                            image: obs.photos[0].url.replace('square', 'original').replace('small', 'original').replace('medium', 'original').replace('large', 'original'),
                            lat: parseFloat(lat),
                            lng: parseFloat(lng),
                            location: obs.place_guess || "Unknown Wilderness",
                            recordedBy: obs.user?.login || obs.user?.name || "Unknown Observer",
                            link: obs.uri,
                            stats: {
                                trait: target.clue || target.hint || "No hint available.",
                                date: dateStr,
                                year: dateObj.getFullYear()
                            }
                        };
                    } catch (error) {
                        console.error("Fetch failed:", error);
                        return fetchValidAnimal();
                    }
                };


                const preloadNextGame = async () => {
                    try {
                        const data = await fetchValidAnimal();
                        setPreloadedData(data);
                    } catch (e) {
                        console.warn("Background fetch failed", e);
                    }
                };

                const handleSaveProfile = async (chosenName) => {
                    if (isSaving) return; 

                    if (!chosenName.trim()) {
                        alert("Please enter a valid name.");
                        return;
                    }

                    if (!user) {
                       alert("Waiting for connection... please wait 2 seconds and try again.");
                       return;
                   }

                   setIsSaving(true);
                   console.log("📝 Attempting to create profile for:", user.uid);

                   try {
                    const userRef = doc(db, "users", user.uid);

                // Force a Write
                    await setDoc(userRef, {
                        username: chosenName,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        gamesPlayed: 0, 
                        totalScore: 0
                    }, { merge: true });

                    console.log("✅ Write Complete! Reloading...");

                // FORCE RELOAD: This guarantees we load the "clean" profile from the database
                    window.location.reload(); 

                } catch (error) {
                    console.error("🔥 WRITE ERROR:", error);
                    alert("Save Failed: " + error.message);
                setIsSaving(false); // UNLOCK the button so you can try again
            }
        };


        const startGame = () => {
        logEvent(analytics, 'level_start', { level_name: 'wild_guess_standard' });
        setView('countdown');
    };



        const onCountdownComplete = () => {
            setView('game');
            setCurrentClueIndex(0);
            startTimeForClue();
            preloadNextGame();
        };

        const startTimeForClue = () => {
            setTimeLeft(15);
            if (timerRef.current) clearInterval(timerRef.current);
            if (isTutorialMode) return; 

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        advanceClue();
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        const advanceClue = () => {
            setCurrentClueIndex(prev => {
                if (prev >= 4) { endGame('loss'); return 4; }
                setGuessLocked(false);
                setRoundScore(score => Math.max(1, score - 1));
                return prev + 1;
            });
        };

        const skipClue = () => {
            if (currentClueIndex < 4) {
                setTimeLeft(15); 
                advanceClue();
            }
        };

        const handleCategoryClick = (group) => {
            setSelectedGroup(group);
            if (isTutorialMode && tutorialStep === 4) {
                nextTutorialStep(); 
            }
        };

        const handleBackToCategories = () => {
            setSelectedGroup(null);
            if (isTutorialMode && (tutorialStep === 5 || tutorialStep === 6)) {
                setTutorialStep(4);
            }
        };

        const handleReportIssue = () => {
            if (!animalData || !animalData.id) return;

            const reportedJSON = localStorage.getItem('wildGuess_reported');
            let reported = reportedJSON ? JSON.parse(reportedJSON) : [];

            if (!reported.includes(animalData.id)) {
                reported.push(animalData.id);
                localStorage.setItem('wildGuess_reported', JSON.stringify(reported));
                alert("Reported! This specific entry will not appear in your game again.");
            } else {
                alert("You have already reported this entry.");
            }
        };

        const handleFinalGuess = (animalName) => {
            if (isTutorialMode) {
                const isCorrect = animalName === animalData.correctName;
                if (tutorialStep === 5) {
                    if (isCorrect) {
                        endGame('win'); 
                        setTutorialStep(7); 
                    } else {
                        setWrongGuesses([animalName]); 
                        setCurrentClueIndex(4); 
                        setRoundScore(1);
                        setTutorialStep(6); 
                    }
                } else if (tutorialStep === 6) {
                    if (isCorrect) {
                        endGame('win');
                        setTutorialStep(7);
                    } else {
                        endGame('loss');
                        setTutorialStep(8);
                    }
                }
                return;
            }

            if (guessLocked || view !== 'game') return;
            if (animalName === animalData.correctName) {
                endGame('win');
            } else {
                setWrongGuesses(prev => [...prev, animalName]);
                if (currentClueIndex === 4) { endGame('loss'); } 
                else { setTimeLeft(15); advanceClue(); }
            }
        };

        const endGame = async (result) => {
        // 1. Stop the Timer
        if (timerRef.current) clearInterval(timerRef.current);

        // 2. Calculate Score Logic
        let score = 0;
        if (result === 'win') {
            score = roundScore; // 4, 3, 2, or 1
        }
        
        // 3. Update Local State (So the UI updates immediately)
        setGameResult(result);
        setView('summary');
        
        // 4. FIREBASE: Save the Data
        if (user) {
            try {
                // A. Analytics Event (Helps you see win rates in dashboard)
                logEvent(analytics, 'level_end', {
                    level_name: 'wild_guess_standard',
                    success: result === 'win',
                    score: score,
                    animal: animalData.correctName
                });

                // B. Save Game History to "games" collection
                await addDoc(collection(db, "games"), {
                    userId: user.uid,
                    username: username,
                    animalName: animalData.correctName,
                    animalSciName: animalData.sciName,
                    result: result, // 'win', 'surrender', 'loss'
                    pointsEarned: score,
                    cluesUsed: currentClueIndex, 
                    location: animalData.location || "Unknown",
                    timestamp: serverTimestamp()
                });

                // C. Update User Totals (For the Leaderboard)
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    totalScore: increment(score),
                    gamesPlayed: increment(1),
                    lastPlayed: serverTimestamp()
                });

                console.log(`📝 Game Saved! +${score} pts`);

            } catch (error) {
                console.error("Error saving game stats:", error);
            }
        }
    };

        const toggleTutorial = () => {
            if (isTutorialMode) {
                setIsTutorialMode(false);
                localStorage.setItem('wildGuess_tutorial_complete', 'true');
                setWrongGuesses([]); 
                startTimeForClue(); 
            } else {
                setIsTutorialMode(true);
                setTutorialStep(0);
                setCurrentClueIndex(0); 
                setRoundScore(5);
                setWrongGuesses([]);
                setSelectedGroup(null); 
                if (timerRef.current) clearInterval(timerRef.current); 
            }
        };

        const nextTutorialStep = () => {
            if (tutorialStep >= 7) {
                setIsTutorialMode(false);
                localStorage.setItem('wildGuess_tutorial_complete', 'true');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 8000);
                startGame(); 
                return;
            }

            if (tutorialStep < TUTORIAL_DATA.length - 1) {
                const nextStep = tutorialStep + 1;
                setTutorialStep(nextStep);

                if (nextStep === 1) { setCurrentClueIndex(1); setRoundScore(4); }
                if (nextStep === 2) { setCurrentClueIndex(2); setRoundScore(3); }
                if (nextStep === 3) { setCurrentClueIndex(3); setRoundScore(2); }
                if (nextStep === 6) { setCurrentClueIndex(4); setRoundScore(1); } 
            }
        };

        if (view === 'menu') {
        return (
            <div className="h-screen w-full bg-gradient-to-b from-green-900 to-green-700 overflow-hidden relative flex flex-col md:flex-row items-center justify-center p-4 gap-6">
                
                {/* BACKGROUND STICKERS (Kept Global) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {menuStickers.map((sticker) => (
                        <div key={sticker.id} className="absolute emoji-sticker transition-transform duration-1000 ease-in-out hover:scale-110" style={{ top: `${sticker.top}%`, left: `${sticker.left}%`, fontSize: `${sticker.size}rem`, transform: `rotate(${sticker.rotation}deg)`, opacity: sticker.opacity }}>{sticker.emoji}</div>
                    ))}
                </div>

                {/* --- LEFT PANEL: LOGO & ACTIONS --- */}
                <div className="relative z-10 flex flex-col items-center w-full max-w-md md:w-1/2 md:items-end md:pr-8">
                    {/* Updated Logo Size as requested */}
                    <h1 className="font-freckle text-5xl md:text-7xl text-green-950 sticker-text drop-shadow-2xl mb-4 tracking-wider leading-none whitespace-nowrap">
                        W<span className="-mx-4 md:-mx-7 relative -top-1">🐊</span>LD GUESS
                    </h1>
                    
                    <div className="bg-white/95 backdrop-blur-sm p-5 md:p-6 rounded-3xl shadow-2xl w-full text-center border-4 border-white transform -rotate-1 mb-6">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">HOW TO PLAY</p>
                        
                        <div className="flex justify-between items-start px-1 mb-2 gap-1">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-4xl mb-2 filter drop-shadow-sm">📸</span>
                                <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">
                                    Real-Life Animal Sighting
                                </span>
                            </div>

                            {/* Arrow */}
                            <div className="text-slate-300 text-xl mt-2">➜</div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-4xl mb-2 filter drop-shadow-sm">🧑‍🔬</span>
                                <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">
                                    Analyze the Clues
                                </span>
                            </div>

                            {/* Arrow */}
                            <div className="text-slate-300 text-xl mt-2">➜</div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-4xl mb-2 filter drop-shadow-sm">🔍</span>
                                <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">
                                    Identify the Animal
                                </span>
                            </div>
                        </div>
                    </div>

                    <button onClick={startGame} className="relative overflow-hidden text-white font-bold py-4 rounded-full shadow-[0_6px_0_#14532d] active:shadow-none active:translate-y-1 transform transition-all border-4 border-white w-full hover:scale-105 bg-green-600 hover:bg-green-500">
                        {/* THEME UPDATE: Start Expedition */}
                        <span className="text-2xl font-black tracking-widest uppercase drop-shadow-md">START EXPEDITION</span>
                    </button>
                    
                    {/* User Profile Badge */}
                    {user && (
                        <div className="mt-4 bg-black/20 text-white/80 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            Playing as: <span className="text-white">{username}</span>
                        </div>
                    )}
                </div>

                {/* --- RIGHT PANEL: LEADERBOARD (Explorer Theme) --- */}
                <div className="relative z-10 w-full max-w-md md:w-1/2 md:h-[80vh] flex flex-col md:pl-8">
                    <div className="bg-orange-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-orange-100 overflow-hidden flex flex-col h-full max-h-[500px] md:max-h-full">
                        
                        {/* Header */}
                        <div className="bg-orange-100 p-4 border-b border-orange-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">👑</span>
                                {/* THEME UPDATE: Top Explorers */}
                                <h2 className="text-orange-800 font-black tracking-wide text-lg uppercase">Top Explorers</h2>
                            </div>
                            <div className="flex gap-1">
                                <span className="bg-orange-200 text-orange-800 text-[10px] px-2 py-1 rounded font-bold uppercase">All Time</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
                            {leaderboardData.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-orange-300 opacity-50">
                                    <span className="text-4xl mb-2">⏳</span>
                                    <span className="font-bold text-sm uppercase">Loading Scores...</span>
                                </div>
                            ) : (
                                leaderboardData.map((player, index) => (
                                    <div 
                                        key={player.id} 
                                        className={`flex items-center justify-between p-3 rounded-xl border-b-4 transition-transform hover:scale-[1.01] ${
                                            player.id === user?.uid 
                                            ? 'bg-white border-emerald-200 shadow-sm ring-2 ring-emerald-400 ring-offset-1' 
                                            : 'bg-white border-orange-100 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                font-black text-sm w-8 h-8 flex items-center justify-center rounded-lg
                                                ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                                  index === 1 ? 'bg-slate-300 text-slate-700' : 
                                                  index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-400'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm leading-tight ${player.id === user?.uid ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                    {player.username} {player.id === user?.uid && "(You)"}
                                                </span>
                                                {/* THEME UPDATE: Discoveries */}
                                                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{player.gamesPlayed || 0} Discoveries</span>
                                            </div>
                                        </div>
                                        <div className="bg-orange-100 px-3 py-1 rounded-lg">
                                            <span className="font-mono font-black text-orange-600 text-sm">
                                                {player.totalScore || 0}<span className="text-[9px] ml-0.5 opacity-60">PTS</span>
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- AUTH / PROFILE MODAL (Existing) --- */}
                {(!authLoading && !isProfileSetup) && (
                    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl text-center border-4 border-emerald-100">
                            <div className="text-6xl mb-4">🐊</div>
                            <h2 className="text-3xl font-freckle text-green-950 mb-2">Welcome to Wild Guess!</h2>
                            <p className="text-slate-500 mb-6">Choose a username to track your scores and compete on the leaderboard.</p>
                            
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    handleSaveProfile(formData.get('username'));
                                }}
                                className="space-y-4"
                            >
                                <input 
                                    name="username"
                                    type="text" 
                                    placeholder="Enter Username (e.g. SwampKing)" 
                                    maxLength={15}
                                    required
                                    className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center font-bold text-slate-700 bg-slate-50"
                                />
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full font-bold py-3 rounded-xl transition transform shadow-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02]'}`}
                                >
                                    {isSaving ? "SAVING..." : "START EXPEDITION"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

        if (view === 'countdown') return <CountdownScreen onComplete={onCountdownComplete} stickers={menuStickers} isReady={!!animalData} />;

        return (
            <div className="h-screen w-full flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
                <div id="landscape-warning" className="fixed inset-0 z-[100] bg-slate-900 text-white flex-col items-center justify-center p-6 text-center">
                    <div className="text-6xl mb-6">🔄</div><h2 className="text-2xl font-bold mb-2">Please Rotate Device</h2><p className="text-slate-300">This game is designed for portrait mode.</p>
                </div>

                        {/* --- LEFT PANEL: MAP & CLUES --- */}
                <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden relative order-1">
                    <div className="h-2 bg-slate-200 w-full flex-shrink-0"><div className="h-full bg-emerald-500 transition-all duration-1000 linear" style={{ width: `${(timeLeft / 15) * 100}%` }}></div></div>
                    <div className="flex-1 relative">
                                {/* EXIT BUTTON (Top Left) */}
                        <button onClick={() => setView('menu')} className="absolute top-2 left-2 z-[60] bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-slate-300 rounded shadow-md text-white font-bold uppercase tracking-widest text-[10px] px-2 py-1 flex items-center gap-1 hover:from-blue-500 hover:to-blue-700 active:scale-95 transition-all">
                            <span className="text-xs filter drop-shadow-sm">🔙</span><span className="drop-shadow-sm">EXIT</span>
                        </button>

                                {/* TUTORIAL TOGGLE BUTTON (Top Right) */}
                        <button onClick={toggleTutorial} className={`absolute top-2 right-2 z-[60] flex items-center gap-2 px-2 py-1 rounded shadow-md border-2 transition-all text-[10px] font-bold uppercase tracking-widest ${isTutorialMode ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:bg-slate-50'}`}>
                            <span className="text-xs">{isTutorialMode ? 'ON' : 'OFF'}</span><span>🎓</span>
                        </button>

                                {/* TOAST NOTIFICATION */}
                        {showToast && (
                            <div className="absolute top-12 right-2 z-[70] bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pop max-w-[150px] text-right">
                                Tutorial hidden.<br/>Tap "OFF" to restart.
                            </div>
                            )}

                        <div className="absolute inset-0" key={gameId}>
                                    {/* Map Layer */}
                            <div className={`absolute inset-0 transition-opacity duration-500 ${currentClueIndex >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                                {animalData && (
                                    <MapClue 
                                        lat={animalData.lat} 
                                        lng={animalData.lng} 
                                        zoom={currentClueIndex === 0 ? 2 : (currentClueIndex === 1 ? 5 : 11)} 
                                        />
                                        )}
                            </div>
                                    {/* Photo Background Layer (Desktop only) */}
                            <div className={`hidden md:block absolute inset-0 z-10 transition-opacity duration-1000 bg-slate-200 ${currentClueIndex >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                {animalData?.image && (<div className="w-full h-full relative"><img src={animalData.image} className="w-full h-full object-cover" alt="Revealed Animal" /><div className="absolute inset-0 bg-black/10"></div></div>)}
                                </div>
                            </div>

                            <div className="hidden md:block absolute top-0 left-0 right-0 z-30 pt-6 text-center pointer-events-none">
                                <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight uppercase leading-none">Take a <span className="text-emerald-400">Wild Guess</span></h2>
                                <p className="text-white text-sm font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase tracking-widest">Can you identify this animal?</p>
                            </div>

                                {/* CLUES CONTAINER */}
                            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center pt-12 pb-2 px-2 md:pt-24 md:pb-4 md:px-4">

                                    {/* Clue 5: Image (MOBILE ONLY) */}
                                {currentClueIndex === 4 && animalData?.image && (
                                    <div className="w-full flex justify-center md:hidden mb-2 order-first">
                                        <div className="bg-slate-200 rounded-2xl shadow-2xl overflow-hidden border-4 border-white w-48 h-32 flex-shrink-0 animate-pop">
                                            <img src={animalData.image} className="w-full h-full object-cover" alt="Clue" />
                                        </div>
                                    </div>
                                    )}
                                
                                    {/* Clue 2: Location (TOP) */}
                                    {/* FIXED: Changed 'hidden md:block' to 'hidden md:flex' to maintain centering */}
                                <div className={`order-1 w-full flex justify-center md:static transition-all duration-500 transform ${currentClueIndex >= 1 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} ${currentClueIndex === 4 ? 'hidden md:flex' : ''}`}>
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-xl border border-white/50">
                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase block text-center tracking-wider">Location</span>
                                        <span className="text-slate-800 font-bold text-xs md:text-lg leading-tight block">{animalData?.location}</span>
                                    </div>
                                </div>

                                    {/* Clue 4: Hint (PUSHED TO BOTTOM) */}
                                <div className={`order-2 w-full flex justify-center md:static mt-auto mb-2 md:mb-4 transition-all duration-500 transform ${currentClueIndex >= 3 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                                    <div className="bg-emerald-50/95 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-3 rounded-lg shadow-xl border border-emerald-100 max-w-sm text-center mx-4">
                                        <span className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase block mb-0.5 tracking-wider">Hint</span>
                                        <div className="text-emerald-900 font-medium italic text-xs md:text-lg leading-tight">"{animalData?.stats?.trait}"</div>
                                    </div>
                                </div>

                                    {/* Clue 3: Taxonomy (VERY BOTTOM) */}
                                <div className={`order-3 w-full flex justify-center md:static transition-all duration-500 transform ${currentClueIndex >= 2 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} ${currentClueIndex === 4 ? 'hidden md:flex' : ''}`}>
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 md:px-6 md:py-3 rounded-lg shadow-xl border border-white/50 text-center min-w-[160px] md:min-w-[220px]">
                                        <div className="mb-0.5 md:mb-2">
                                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Family</span>
                                                {/* This uses the "sanitized" family name from your data file */}
                                            <span className="text-indigo-600 font-mono font-bold text-xs md:text-lg leading-none">{animalData?.family}</span>
                                        </div>
                                        <div className="border-t border-slate-200/50 pt-0.5 md:pt-2">
                                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Scientific Name</span>
                                                {/* THE FIX: Check for 'displayLatin' first. If it exists, use it. If not, use 'sciName'. */}
                                            <span className="text-emerald-800 italic font-serif text-sm md:text-xl leading-none">
                                                {animalData?.displayLatin || animalData?.sciName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        
                            {/* FOOTER */}
                        <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-between px-4 z-10 flex-shrink-0">
                            <div className="text-slate-500 font-mono text-sm">PTS: <span className="text-emerald-600 font-bold">{roundScore}</span></div>
                            <div className="flex gap-2">
                                    {/* Dynamic Give Up Button */}
                                <button 
                                    onClick={() => endGame('surrender')} 
                                    disabled={isTutorialMode}
                                    className={`px-4 py-2 text-xs rounded-full transition-all duration-300 ${
                                        currentClueIndex === 4 
                                        ? 'bg-red-500 text-white font-black tracking-widest shadow-lg hover:bg-red-600 hover:scale-105 animate-pulse' 
                                        : 'text-slate-400 hover:text-red-500 font-medium'
                                    } ${isTutorialMode ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    GIVE UP
                                </button>

                                    {/* Next Clue Button - Hidden on Final Clue (Index 4) */}
                                {currentClueIndex < 4 && (
                                    <button 
                                        onClick={skipClue} 
                                        disabled={isTutorialMode}
                                        className={`bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition ${isTutorialMode ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                                    >
                                        NEXT CLUE
                                    </button>
                                    )}
                            </div>
                        </div>
                    </div>

                        {/* --- RIGHT PANEL: SIDEBAR (ANSWERS) --- */}
                    <div className="h-[45%] md:h-full md:w-96 bg-slate-50 overflow-hidden border-t md:border-t-0 md:border-l border-slate-200 order-2 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 relative">

                            {/* SEARCH BAR (Sticky Top) */}
                        <div className="p-2 border-b border-slate-200 bg-slate-100 flex-shrink-0 z-10">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                            // NEW: If typing during 'Make a Guess' step, advance tutorial to unlock animals
                                        if (isTutorialMode && tutorialStep === 4) {
                                            nextTutorialStep();
                                        }
                                    }}
                                    placeholder="Search animals..." 
                                    disabled={guessLocked || (isTutorialMode && tutorialStep < 4)}
                                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')} 
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                                        >
                                            ✕
                                        </button>
                                        )}
                                </div>
                            </div>

                            {/* SCROLLABLE LIST AREA */}
                            <div className="flex-1 overflow-y-auto custom-scroll p-2 content-start">

                                {/* SCENARIO 1: SEARCH RESULTS */}
                                {searchTerm ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_ANIMALS_FLAT.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((animal, idx) => {
                                            const isWrong = wrongGuesses.includes(animal.name);
                                            return (
                                                <button 
                                                    key={idx} 
                                                    disabled={guessLocked || isWrong || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)} 
                                                    onClick={() => { handleFinalGuess(animal.name); setSearchTerm(''); }} 
                                                    className={`rounded-lg font-bold shadow-sm border border-slate-100 transition-all py-2 px-2 text-xs text-left flex items-center ${isWrong ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'} ${(guessLocked || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)) ? 'opacity-50' : ''}`}
                                                >
                                                    <span className="mr-2 text-base">{animal.groupEmoji}</span>
                                                    <span className="truncate">{animal.name}</span>
                                                </button>
                                                );
                                        })}
                                        {ALL_ANIMALS_FLAT.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                            <div className="col-span-2 text-center text-slate-400 text-xs py-4 italic">No animals found</div>
                                            )}
                                    </div>
                                    ) : (
                                    /* SCENARIO 2: NORMAL NAVIGATION */
                                    <>
                                    {!selectedGroup && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-full content-start">
                                            <button 
                                                onClick={() => handleCategoryClick("ALL")} 
                                                disabled={guessLocked || (isTutorialMode && tutorialStep < 4)} 
                                                    className={`rounded-xl flex items-center shadow-sm transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-md cursor-pointer border border-slate-300 flex-row justify-start px-2 py-1 h-11 md:flex-col md:justify-center md:aspect-square md:h-auto md:px-0 ${(guessLocked || (isTutorialMode && tutorialStep < 4)) ? 'opacity-50' : ''}`}
                                                    >
                                                        <span className="text-xl mr-2 md:mr-0 md:mb-1">🌎</span><span className="text-[10px] md:text-[10px] font-bold uppercase tracking-tight text-left md:text-center leading-tight">All Animals</span>
                                                    </button>
                                                    {ANIMAL_GROUPS.map((group, idx) => (
                                                        <button 
                                                            key={idx} 
                                                            disabled={guessLocked || (isTutorialMode && tutorialStep < 4)} 
                                                                onClick={() => handleCategoryClick(group)} 
                                                                className={`rounded-xl flex items-center shadow-sm transition-all duration-200 bg-white hover:bg-emerald-50 hover:shadow-md cursor-pointer border border-slate-100 flex-row justify-start px-2 py-1 h-11 md:flex-col md:justify-center md:aspect-square md:h-auto md:px-0 ${(guessLocked || (isTutorialMode && tutorialStep < 4)) ? 'opacity-50' : ''}`}
                                                                >
                                                                    <span className="text-xl mr-2 md:mr-0 md:mb-1">{group.emoji}</span><span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight text-left md:text-center leading-tight">{group.name}</span>
                                                                </button>
                                                                ))}
                                                </div>
                                                )}
                                    {selectedGroup && (
                                        <div className="flex flex-col h-full">
                                            <button 
                                                onClick={handleBackToCategories} 
                                                disabled={isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6} 
                                                className={`mb-2 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 text-[10px] uppercase font-bold px-2 py-1.5 flex-shrink-0 transition-colors ${(isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6) ? 'opacity-50' : ''}`}
                                            >
                                                ← Back to Categories
                                            </button>
                                            <div className="text-center mb-2 flex-shrink-0"><span className="text-xl inline-block mr-2">{selectedGroup === "ALL" ? "🌎" : selectedGroup.emoji}</span><span className="text-sm font-bold text-slate-700">{selectedGroup === "ALL" ? "All Animals" : selectedGroup.name}</span></div>
                                            <div className={`grid gap-2 flex-1 content-start ${selectedGroup === "ALL" ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                                {(selectedGroup === "ALL" ? ALL_ANIMALS_FLAT : selectedGroup.animals).map((animal, idx) => {
                                                    const isWrong = wrongGuesses.includes(animal.name);
                                                    return (
                                                        <button 
                                                            key={idx} 
                                                            disabled={guessLocked || isWrong || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)} 
                                                            onClick={() => handleFinalGuess(animal.name)} 
                                                            className={`rounded-lg font-bold shadow-sm border border-slate-100 transition-all leading-tight ${selectedGroup === "ALL" ? 'py-1 px-1 text-[9px] h-10 flex flex-col justify-center items-center' : 'py-2 px-2 text-xs'} ${isWrong ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'} ${(guessLocked || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)) ? 'opacity-50' : ''}`}
                                                        >
                                                            {selectedGroup === "ALL" && <span className="opacity-60 text-xs mb-0.5">{animal.groupEmoji}</span>}
                                                            <span className="truncate w-full text-center">{animal.name}</span>
                                                        </button>
                                                        )
                                                })}
                                            </div>
                                        </div>
                                        )}
                                    </>
                                    )}
        </div>
    </div>

                        {/* --- GLOBAL OVERLAYS --- */}
    {view === 'summary' && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-pop flex flex-col max-h-[90vh]">
                <div className="h-64 bg-slate-200 relative flex-shrink-0">
                    {animalData?.image ? (<img src={animalData.image} className="w-full h-full object-cover" alt="Animal" />) : (<div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>)}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12"><h2 className="text-white text-3xl font-bold leading-none">{animalData?.correctName}</h2><p className="text-white/80 text-sm italic font-serif mt-1">{animalData?.sciName}</p></div>
                    </div>
                    <div className="p-6 text-center flex-1 overflow-y-auto custom-scroll">
                        {gameResult === 'win' ? (<div className="mb-6"><div className="text-5xl mb-2 animate-bounce">🎉</div><h3 className="text-2xl font-bold text-emerald-600 mb-1">Correct!</h3><p className="text-slate-600 font-medium">You earned <span className="text-emerald-600 font-bold">{roundScore} points</span>.</p></div>) : (<div className="mb-6"><div className="text-5xl mb-2">☠️</div><h3 className="text-2xl font-bold text-red-600 mb-1">Missed it!</h3><p className="text-slate-600">Better luck next time.</p></div>)}
                        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 text-sm border border-slate-100 shadow-inner">
                            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Observed By</span>{animalData?.link ? (<a href={animalData.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline truncate max-w-[150px]">{animalData.recordedBy} ↗</a>) : (<span className="text-slate-700 font-medium">{animalData?.recordedBy}</span>)}</div>
                            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Date</span><span className="text-slate-700 font-medium">{animalData?.stats?.date}</span></div>
                            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Location</span><span className="text-slate-700 text-right max-w-[60%] font-medium">{animalData?.location}</span></div>

                                            {/* DATA SOURCE & DISCLAIMER */}
                            <div className="pt-2 text-center border-t border-slate-200 mt-2">
                                <p className="text-[10px] text-slate-400 leading-tight mb-2">Data source: <a href="https://www.inaturalist.org" target="_blank" className="underline hover:text-emerald-500">iNaturalist</a> (Research Grade). <br/>Photos & coordinates are user-submitted.</p>

                                <div className="bg-orange-50 border border-orange-100 rounded p-2 mt-2">
                                    <p className="text-[9px] text-orange-600 font-bold uppercase mb-1">⚠️ Data Disclaimer</p>
                                    <p className="text-[9px] text-slate-500 leading-snug mb-2">Occasional inaccuracies (e.g., GPS errors) or sensitive content may occur in community data.</p>
                                    <button 
                                        onClick={handleReportIssue} 
                                        className="bg-white border border-slate-200 shadow-sm text-[9px] text-slate-600 font-bold uppercase px-2 py-1 rounded hover:bg-slate-50 hover:text-red-500 transition-colors flex items-center justify-center w-full gap-1"
                                    >
                                        <span>🚩</span> Report Bad Data / Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0"><button onClick={startGame} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-200 transform hover:scale-[1.02]">PLAY AGAIN</button></div>
                </div>
            </div>
            )}

            {isTutorialMode && (
                <div className={`absolute z-[100] max-w-[280px] ${TUTORIAL_DATA[tutorialStep].positionClasses}`}>
                    <div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-emerald-500 relative animate-pop">
                        <div className={`absolute w-0 h-0 border-[10px] ${TUTORIAL_DATA[tutorialStep].arrowClasses}`}></div>
                        <p className="text-slate-700 font-bold text-sm mb-3 leading-snug">
                            {TUTORIAL_DATA[tutorialStep].text.split("**").map((part, i) => i % 2 === 1 ? <span key={i} className="text-emerald-600 font-black">{part}</span> : part)}
                            </p>
                            {!TUTORIAL_DATA[tutorialStep].hideButton && (
                                <button onClick={nextTutorialStep} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider shadow-sm">
                                    {TUTORIAL_DATA[tutorialStep].buttonText}
                                </button>
                                )}
                        </div>
                    </div>
                    )}
        </div>
        );
        };
        export default WildGuessGame;
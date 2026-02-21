        import { useState, useEffect, useRef, useMemo } from 'react';
        import L from 'leaflet';
        import 'leaflet/dist/leaflet.css';
        import { useAnimalData } from './animalData';
        import { auth, db, analytics } from './firebase';
        import { logEvent } from "firebase/analytics";
        import { sfx } from './sounds';
        import { BACKUP_ANIMALS } from './backupData';
        import { 
            getAuth,
            signInAnonymously, 
            onAuthStateChanged, 
            signOut,
            GoogleAuthProvider,
            signInWithPopup,
            linkWithPopup       
        } from "firebase/auth";
        import { 
            doc, 
            getDoc, 
            setDoc, 
            updateDoc,
            increment,  
            addDoc,     
            collection, 
            serverTimestamp,
            query,
            orderBy,
            limit,
            where,
            getDocs,
            arrayUnion
        } from "firebase/firestore";



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


        // Helper to get date keys (e.g., "2023-10-25" and "2023-W43")
        const getDateKeys = () => {
            const now = new Date();
        const dayKey = now.toISOString().split('T')[0]; // "2023-10-25"

        // Calculate Week Key
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDays = Math.floor((now - startOfYear) / 86400000);
        const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
        const weekKey = `${now.getFullYear()}-W${weekNum}`; // "2023-W43"

        return { dayKey, weekKey };
    };

        // --- HELPER: Filter Low Quality Records ---
    const isLowQualityRecord = (record) => {
        // 1. Check Annotations (Fixed JSON Keys!)
        if (record.annotations && record.annotations.length > 0) {
            for (const note of record.annotations) {
            // iNaturalist uses 'controlled_attribute_id', not just 'attribute_id'!
                const attrId = Number(note.controlled_attribute_id);
                const valId = Number(note.controlled_value_id);

            // Attribute 17 = "Alive or Dead" -> Value 19 = "Dead"
                if (attrId === 17 && valId === 19) return true;

            // Attribute 22 = "Evidence of Presence" 
            // If Evidence IS set, but it is NOT 24 (Organism), it's bad (e.g. Scat, Track, Molt, Bone)
                if (attrId === 22 && valId !== 24) return true;

            // General "Bad" Values fallback check
            // 19=Dead, 23=Feather, 25=Scat, 26=Track, 27=Bone, 28=Molt, 29=Gall, 30=Egg, 31=Hair, 32=Leafmine, 35=Construction
                const badIds = [19, 23, 25, 26, 27, 28, 29, 30, 31, 32, 35];
                if (badIds.includes(valId)) return true;
            }
        }

        // 2. Check Dynamic Properties
        const dynProps = (record.dynamicProperties || "").toLowerCase().replace(/\s/g, "");
        if (dynProps.includes('"evidenceofpresence":"track"') || 
            dynProps.includes('"evidenceofpresence":"scat"') || 
            dynProps.includes('"vitality":"dead"')) return true;

        // 3. Check Text Fields (Added "construction")
            const bannedKeywords = [
                "track", "print", "footprint", "paw", "scat", "feces", "dropping", "poop", "dung", 
                "burrow", "nest", "den", "moult", "shed", "dead", "roadkill", "carcass", 
                "remains", "bone", "skull", "skeleton", "corpse", "specimen", "taxidermy",
                "construction", "web"
            ];

            const textFields = [
                record.description, 
                record.occurrenceRemarks, 
                record.fieldNotes, 
                record.media?.[0]?.description, 
                record.media?.[0]?.title, 
                (record.tags || []).join(" ") 
            ].filter(Boolean).join(" ").toLowerCase();

            return bannedKeywords.some(keyword => textFields.includes(keyword));
        };

        // --- COMPONENT: CountdownScreen ---
        // --- COMPONENT: CountdownScreen ---
        const CountdownScreen = ({ onComplete, stickers, isReady }) => {
            const [count, setCount] = useState(3);
            const [emoji, setEmoji] = useState("🦁");
        const [msgIndex, setMsgIndex] = useState(0); // Track which message to show

        const emojis = ["🦁", "🐯", "🐻", "🐨", "🐼", "🐸", "🐙", "🦊", "🦓", "🦄", "🦅", "🐝", "🦀", "🦖"];

        const loadingMessages = [
            "Acquiring Target Data...",
            "Triangulating Coordinates...",
            "Sourcing High-Res Photos...",
            "Generating Cryptic Clues...",
            "Consulting Local Biologists...",
            "Reversing Global Warming...", 
            "Calibrating Satellites..."
        ];

        // 1. Play Sound ONCE when the screen loads
        useEffect(() => {
            sfx.play('countdown');
        }, []);

        // 2. Timer Logic (Silent)
        useEffect(() => {
            if (count > 0) {
                const timer = setTimeout(() => setCount(c => c - 1), 1000);
                return () => clearTimeout(timer);
            }
        }, [count]);

        // 3. Message Rotation Logic (Only runs when waiting)
        useEffect(() => {
            if (count === 0 && !isReady) {
                const interval = setInterval(() => {
                    setMsgIndex(prev => (prev + 1) % loadingMessages.length);
                }, 1800); // Change text every 1.8 seconds
                return () => clearInterval(interval);
            }
        }, [count, isReady]);

        // 4. Completion Logic (Wait for Data)
        useEffect(() => {
            if (count === 0 && isReady) {
                const timer = setTimeout(onComplete, 500);
                return () => clearTimeout(timer);
            }
        }, [count, isReady, onComplete]);

        // 5. Emoji Shuffle Logic
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

                    {/* Status Message (Rotates if Waiting) */}
                    {count === 0 && !isReady && (
                        <div className="text-emerald-200 font-mono font-bold uppercase tracking-widest animate-pulse mb-4 text-center px-4 h-8 transition-all duration-300">
                            {loadingMessages[msgIndex]}
                        </div>
                        )}

                    <div className="text-7xl swap-anim filter drop-shadow-xl">{emoji}</div>
                </div>
            </div>
            );
    };

        // --- COMPONENT: NewDiscoveryModal ---
        // --- COMPONENT: NewDiscoveryModal ---
    const NewDiscoveryModal = ({ pendingAnimals, onConfirmOne, onConfirmAll, allAnimalsFlat }) => {
        const [isRevealed, setIsRevealed] = useState(false);
        const currentAnimalName = pendingAnimals[0];

        // Find the full animal object
        const animalData = allAnimalsFlat.find(a => a.name === currentAnimalName) || {};

        // LOGIC UPDATE: Read the emoji directly from the animal data
        // Fallback order: Specific Emoji -> Group Emoji -> Generic Paw
        const emoji = animalData.emoji || animalData.groupEmoji || "🐾"; 

        const handleReveal = () => {
            if (isRevealed) return; 
            sfx.playWin(); 
            setIsRevealed(true);

            setTimeout(() => {
                setIsRevealed(false);
                onConfirmOne(currentAnimalName);
            }, 1500);
        };

        const handleAddAll = () => {
            sfx.play('unlock');
            onConfirmAll();
        };

        return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl animate-pop border-4 border-emerald-400 relative overflow-hidden">

                {/* Background Rays */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(52,211,153,0.2)_0%,rgba(255,255,255,0)_70%)] animate-pulse"></div>

                    <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-widest mb-2 relative z-10">
                        New Discovery!
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-8 relative z-10">
                        {pendingAnimals.length} New Entry{pendingAnimals.length > 1 ? 's' : ''} Found
                    </p>

                {/* The Card */}
                    <div className="relative mx-auto w-48 h-48 mb-8 flex items-center justify-center">
                        <div className={`transition-all duration-700 transform ${isRevealed ? 'scale-110 rotate-0 filter-none' : 'scale-100 rotate-12 blur-sm grayscale brightness-0 opacity-80'}`}>
                        {/* THE EMOJI */}
                            <div className="text-9xl">{emoji}</div>
                        </div>

                    {/* Sparkles */}
                        {isRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-6xl animate-ping absolute top-0 left-0">✨</div>
                                <div className="text-6xl animate-ping absolute bottom-4 right-4 delay-100">✨</div>
                                <div className="text-6xl animate-ping absolute top-4 right-10 delay-200">✨</div>
                            </div>
                            )}
                    </div>

                    <h3 className={`text-xl font-bold mb-8 transition-all duration-500 ${isRevealed ? 'text-slate-800 scale-110' : 'text-slate-300 scale-90 blur-sm'}`}>
                        {isRevealed ? currentAnimalName : "????????"}
                    </h3>

                    <div className="space-y-3 relative z-10">
                        <button 
                            onClick={handleReveal}
                            disabled={isRevealed}
                            className={`w-full py-4 rounded-xl font-black text-white uppercase tracking-widest shadow-lg transform transition-all ${isRevealed ? 'bg-emerald-400 scale-105' : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105'}`}
                        >
                            {isRevealed ? "ADDED!" : "ADD TO JOURNAL"}
                        </button>

                        {pendingAnimals.length > 1 && (
                            <button 
                                onClick={handleAddAll}
                                className="w-full py-2 text-slate-400 text-xs font-bold uppercase hover:text-emerald-600 transition-colors"
                            >
                                Add All ({pendingAnimals.length})
                            </button>
                            )}
                    </div>
                </div>
            </div>
            );
    };

        // 1. Define the Region IDs
    const REGION_IDS = {
        "Any": null,
        "Africa": 97392,
        "Asia": 97395,
        "Europe": 97391,
        "NorthAmerica": 97394,
        "South America": 97389,
        "Oceania": 97393,
    };

        // 2. Define the Dropdown Options
    const REGION_OPTIONS = [
        { label: "🌎 Any Region", value: "Any" },
        { label: "🌍 Africa", value: "Africa" },
        { label: "🌏 Asia", value: "Asia" },
        { label: "🌍 Europe", value: "Europe" },
        { label: "🌎 North America", value: "NorthAmerica" },
        { label: "🌎 South America", value: "South America" },
        { label: "🌏 Oceania (Australia/NZ)", value: "Oceania" },
    ];

        // --- MAIN COMPONENT: WildGuessGame ---
    const WildGuessGame = () => {
        // --- STATE HOOKS ---
        const [view, setView] = useState('menu');
        const [isMuted, setIsMuted] = useState(false);
        const [timerEnabled, setTimerEnabled] = useState(false);
        const [showSettings, setShowSettings] = useState(false);
        const [animalData, setAnimalData] = useState(null);
        const [preloadedData, setPreloadedData] = useState(null);
        const [currentClueIndex, setCurrentClueIndex] = useState(0);
        const [activeViewIndex, setActiveViewIndex] = useState(0);
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
        const auth = getAuth(); 
        const provider = new GoogleAuthProvider();
        const [isProfileSetup, setIsProfileSetup] = useState(false);
        const [authLoading, setAuthLoading] = useState(true);
        const [isSaving, setIsSaving] = useState(false);
        const [showLeaderboard, setShowLeaderboard] = useState(false);
        const [leaderboardData, setLeaderboardData] = useState([]);
        const [leaderboardTab, setLeaderboardTab] = useState('weekly');
        const [leaderboardTier, setLeaderboardTier] = useState('explorer');
        const [globalBlacklist, setGlobalBlacklist] = useState([]);
        const [isImageReady, setIsImageReady] = useState(false);
        const [pendingJournalEntries, setPendingJournalEntries] = useState([]);
        const interactionLockRef = useRef(false);
        const isGoogleLoginInProgress = useRef(false);
        const activePreloadRef = useRef(0);
        const [isOfflineMode, setIsOfflineMode] = useState(false);
        const [showShareMenu, setShowShareMenu] = useState(false);
        const [showUpdateModal, setShowUpdateModal] = useState(false);
        const [targetRegion, setTargetRegion] = useState("Any"); 
        const [isLoading, setIsLoading] = useState(false);
        const [loadingProgress, setLoadingProgress] = useState(0);
        const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
        const [isTutorialMode, setIsTutorialMode] = useState(false);
        const [tutorialStep, setTutorialStep] = useState(0); 
        const [showToast, setShowToast] = useState(false);
        const { animals, loading: dataLoading, loadedRegion } = useAnimalData(targetRegion);
        const [showTimerPromo, setShowTimerPromo] = useState(false);
        const [showWikiModal, setShowWikiModal] = useState(false);
        // ⬇️ NEW: Track the currently selected journal region
        
        const ALL_ANIMALS_FLAT = animals || []; 

        // --- THE PRELOAD ASSASSIN ---
        // This wipes out stale data the microsecond the continent dropdown changes
        useEffect(() => {
        setPreloadedData(null); // 1. Shred the currently held animal
        activePreloadRef.current += 1; // 2. Instantly invalidate any background fetches still flying through the internet
    }, [targetRegion]);


        // --- NEW: REBUILD GROUPS DYNAMICALLY ---
        const ANIMAL_GROUPS = useMemo(() => {
            if (!ALL_ANIMALS_FLAT.length) return [];

            const groups = {};

            ALL_ANIMALS_FLAT.forEach(animal => {
            // Get the raw category string from the sheet (e.g., "🦎 Reptiles")
                const fullCatString = animal.category || "📂 Uncategorized";

                if (!groups[fullCatString]) {
                // Logic: Split "🦎 Reptiles" into Emoji and Name
                    const firstSpaceIndex = fullCatString.indexOf(' ');
                    let groupEmoji = "🐾";
                    let groupName = fullCatString;

                // If we find a space, assume the first part is the emoji
                    if (firstSpaceIndex !== -1) {
                    groupEmoji = fullCatString.substring(0, firstSpaceIndex); // "🦎"
                    groupName = fullCatString.substring(firstSpaceIndex + 1); // "Reptiles"
                }

                groups[fullCatString] = {
                    id: fullCatString, 
                    name: groupName,   // Just the text
                    emoji: groupEmoji, // Just the emoji
                    animals: []
                };
            }
            groups[fullCatString].animals.push(animal);
        });

        // Convert to array and sort alphabetically by name
            const finalGroups = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

        /*        console.log("👀 DEBUG GROUPS:", finalGroups); 
        console.log("🐾 RAW ANIMAL DATA:", ALL_ANIMALS_FLAT);*/

            return finalGroups;
        }, [ALL_ANIMALS_FLAT]);


        // --- CHECK FOR UPDATES ---
        useEffect(() => {
        // Change "v1" to "v2" in the future if you want to force another pop-up!
            const hasSeenUpdate = localStorage.getItem('wildGuess_update_v1_seen');
            if (!hasSeenUpdate) {
                setShowUpdateModal(true);
            }
        }, []);

        const handleCloseUpdate = () => {
            sfx.play('click');
            localStorage.setItem('wildGuess_update_v1_seen', 'true');
            setShowUpdateModal(false);
        };


        const generateOptions = (currentAnimal) => {
            if (!currentAnimal) return [];

        // 1. Get 4 random WRONG answers
            const others = ALL_ANIMALS_FLAT.filter(a => a.name !== currentAnimal.correctName);
            const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 4);

        // 2. ⬇️ FIXED: Get the REAL, full animal object for the CORRECT answer
            const correctAnimalFull = ALL_ANIMALS_FLAT.find(a => a.name === currentAnimal.correctName);

        // 3. Combine them and shuffle
            const options = [...shuffledOthers, correctAnimalFull];
            return options.sort(() => 0.5 - Math.random());
        };

        // --- CHECK FOR TIMER PROMO (10+ Games) ---
        useEffect(() => {
        // Only check when they are sitting on the main menu
            if (view === 'menu') {
                const hasSeenPromo = localStorage.getItem('wildGuess_timer_promo_seen');

                if (!hasSeenPromo && !timerEnabled) {
                // Count how many unique animals they've played
                    const playedHistory = JSON.parse(localStorage.getItem('wildGuess_played') || '[]');

                    if (playedHistory.length >= 10) {
                        setShowTimerPromo(true);
                    }
                }
            }
        }, [view, timerEnabled]);

        const handleAcceptTimer = () => {
            sfx.play('click');
            setTimerEnabled(true);
            localStorage.setItem('wildGuess_timer_promo_seen', 'true');
            setShowTimerPromo(false);
        };

        const handleDismissTimer = () => {
            sfx.play('click');
            localStorage.setItem('wildGuess_timer_promo_seen', 'true');
            setShowTimerPromo(false);
        };


        // --- UNLOCK ON CLUE CHANGE ---
        useEffect(() => {
            interactionLockRef.current = false;
        }, [currentClueIndex]);

        // --- FIELD JOURNAL STATE ---
        const [showJournal, setShowJournal] = useState(false);
        const [unlockedAnimals, setUnlockedAnimals] = useState(new Set());
        const [journalRegionFilter, setJournalRegionFilter] = useState("All");


        const fetchJournal = async () => {
            if (!user) return;
            const queue = JSON.parse(localStorage.getItem('journal_queue') || '[]');
            if (queue.length > 0) {
                setPendingJournalEntries(queue);
                setShowJournal(true);
                return;
            }
            sfx.play('unlock', 0.3);
            setShowJournal(true);
            try {
                const gamesRef = collection(db, "games");
                const q = query(gamesRef, where("userId", "==", user.uid), where("result", "==", "win"));
                const querySnapshot = await getDocs(q);
                const unlocked = new Set();
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.animalName) unlocked.add(data.animalName);
                });
                setUnlockedAnimals(unlocked);
            } catch (error) {
                console.error("Error fetching journal:", error);
            }
        };

        const handleConfirmJournalEntry = (animalName) => {
            const newQueue = pendingJournalEntries.filter(name => name !== animalName);
            setPendingJournalEntries(newQueue);
            localStorage.setItem('journal_queue', JSON.stringify(newQueue));
            if (newQueue.length === 0) fetchJournal(); 
        };

        const handleConfirmAllJournal = () => {
            setPendingJournalEntries([]);
            localStorage.setItem('journal_queue', '[]');
            fetchJournal();
        };

        // --- LOAD GLOBAL BLACKLIST ---
        useEffect(() => {
            const fetchBlacklist = async () => {
                try {
                    const blacklistRef = doc(db, "system", "blacklist");
                    const docSnap = await getDoc(blacklistRef);
                    if (docSnap.exists()) setGlobalBlacklist(docSnap.data().ids || []);
                } catch (error) {
                    console.error("Failed to load blacklist:", error);
                }
            };
            fetchBlacklist();
        }, []);

        // --- SILENTLY LOAD JOURNAL ON LOGIN ---
        useEffect(() => {
            if (user) {
                const loadUnlockedSilent = async () => {
                    try {
                        const q = query(collection(db, "games"), where("userId", "==", user.uid), where("result", "==", "win"));
                        const snapshot = await getDocs(q);
                        const newSet = new Set();
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            if (data.animalName) newSet.add(data.animalName);
                        });
                        setUnlockedAnimals(newSet);
                    } catch (err) {
                        console.error("Background journal load failed:", err);
                    }
                };
                loadUnlockedSilent();
            }
        }, [user]);

        // --- AUTHENTICATION MONITOR ---
        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                console.log("🔒 [Auth Listener] State Changed:", currentUser ? `Logged In (${currentUser.isAnonymous ? 'Anon' : 'Verified'})` : "Logged Out");
                console.log("🚦 [Auth Listener] Google Flag is:", isGoogleLoginInProgress.current);

                if (currentUser) {
                    setUser(currentUser);
                // Only reset flag if it's NOT anonymous (meaning a real login happened)
                    if (!currentUser.isAnonymous) {
                     isGoogleLoginInProgress.current = false; 
                 }

                 try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        console.log("✅ [Auth Listener] Profile found:", userSnap.data().username);
                        setUsername(userSnap.data().username);
                        setIsProfileSetup(true);
                    } else {
                        console.log("⚠️ [Auth Listener] No Profile doc found for this ID.");
                        setIsProfileSetup(false);
                    }
                } catch (error) {
                    console.error("Read Error:", error);
                }
                setAuthLoading(false);
            } else {
                // User is Logged OUT.
                if (!isGoogleLoginInProgress.current) {
                    console.log("🕵️ [Auth Listener] No user & No Google in progress. Creating Guest...");
                    signInAnonymously(auth)
                    .catch((error) => console.error("Auth Error:", error))
                    .finally(() => setAuthLoading(false));
                } else {
                    console.log("⏳ [Auth Listener] Google Login in progress... Pausing Guest creation.");
                }
            }
        });

            return () => unsubscribe();
        }, []);

        const handleMuteToggle = () => {
            const newState = sfx.toggleMute();
            setIsMuted(newState);
        };

        const timerRef = useRef(null);
        const LOADING_MESSAGES = ["Connecting to Satellite 🛰️", "Triangulating Signal 📡", "Tracking Wildlife 🐾", "Filtering Bad Data 🧹", "Verifying Coordinates 📍", "Consulting Biologists 👨‍🔬", "Loading Map Tiles 🗺️", "Enhancing Image 📸"];

        // --- UPDATED TUTORIAL DATA ---
        const TUTORIAL_DATA = [
            { 
                title: "CLUE 1: SCIENTIFIC NAME", 
                text: "🌎 You start with a global map view and the **Scientific Name**.", 
                positionClasses: "top-24 left-1/2 transform -translate-x-1/2 md:top-32", 
                arrowClasses: "-top-[10px] left-1/2 -translate-x-1/2 border-b-[10px] border-b-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent", 
                buttonText: "Reveal Next Clue" 
            },
            { 
                title: "CLUE 2: LOCATION & PHOTO", 
                text: "📍 Next, we zoom into the **Location** and reveal a **blurred photo**.", 
                positionClasses: "top-24 left-4 md:top-40 md:left-1/2 md:-translate-x-1/2",
                arrowClasses: "hidden", 
                buttonText: "Reveal Next Clue" 
            },
            { 
                title: "CLUE 3: FIRST HINT", 
                text: "🔎 Now you get your first **behavioral hint**.", 
                positionClasses: "bottom-32 left-1/2 transform -translate-x-1/2", 
                arrowClasses: "-bottom-[10px] left-1/2 -translate-x-1/2 border-t-[10px] border-t-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent", 
                buttonText: "Reveal Next Clue" 
            },
            { 
                title: "CLUE 4: FINAL HINT", 
                text: "🧬 Still stuck? Here is your **final hint** to narrow it down.", 
                positionClasses: "bottom-24 left-1/2 transform -translate-x-1/2",
                arrowClasses: "-bottom-[10px] left-1/2 -translate-x-1/2 border-t-[10px] border-t-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent", 
                buttonText: "I'm Ready to Guess" 
            },
        // (Steps 4, 5, 6, 7, and 8 remain exactly the same as you have them)
            { title: "MAKE A GUESS", text: "Start by selecting a **Category** or searching.", positionClasses: "top-24 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0", arrowClasses: "hidden", hideButton: true },
            { title: "PICK THE ANIMAL", text: "Choose the **animal** you think it is.", positionClasses: "top-24 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0", arrowClasses: "hidden", hideButton: true },
            { title: "WRONG! BUT WAIT...", text: "Still didn't get it? We've narrowed it down to **5 choices** to help you make a final guess.", positionClasses: "top-60 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:right-[400px] md:left-auto md:translate-x-0", arrowClasses: "hidden", hideButton: true },
            { title: "SUCCESS!", text: "Well done! Click **Play Again**.", positionClasses: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", arrowClasses: "hidden", buttonText: "Play Again" },
            { title: "GAME OVER", text: "Oh well! Click **Play Again**.", positionClasses: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", arrowClasses: "hidden", buttonText: "Play Again" }
        ];

        const nextTutorialStep = () => {
            sfx.play('click', 0.2);
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

            // LOGIC UPDATE TO MATCH NEW CLUE ORDER
                if (nextStep === 1) { setCurrentClueIndex(1); setActiveViewIndex(1); setRoundScore(4); } 
                if (nextStep === 2) { setCurrentClueIndex(2); setActiveViewIndex(2); setRoundScore(3); } 
                if (nextStep === 3) { setCurrentClueIndex(3); setActiveViewIndex(3); setRoundScore(2); } 
                if (nextStep === 6) { setCurrentClueIndex(4); setActiveViewIndex(4); setRoundScore(1); }
            }
        };

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


        useEffect(() => {
        // ⬇️ UPDATE: Now fetches when on the menu OR the summary screen!
            if (view === 'menu' || view === 'summary') fetchLeaderboard(leaderboardTab, leaderboardTier);
        }, [view, leaderboardTab, leaderboardTier]);

        const fetchLeaderboard = async (tab = leaderboardTab, tier = leaderboardTier) => {
            try {
                let q;
                const { dayKey, weekKey } = getDateKeys();

                if (tab === 'daily') {
                    const dailyCollection = collection(db, "leaderboards", "daily", dayKey);
                    q = query(dailyCollection);
                } else if (tab === 'weekly') {
                    const weeklyCollection = collection(db, "leaderboards", "weekly", weekKey);
                    q = query(weeklyCollection);
                } else {
                    const usersRef = collection(db, "users");
                    q = query(usersRef);
                }

                const querySnapshot = await getDocs(q);
                let leaders = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const totalScore = data.totalScore || data.score || 0;
                    const gamesPlayed = data.gamesPlayed || 0;

                    if (gamesPlayed > 0) {
                    // Calculate Average (Prevent dividing by zero)
                        const averageScore = totalScore / gamesPlayed;

                    // Check which tier this player belongs in
                        const isHobbyist = gamesPlayed <= 10;
                        const isExplorer = gamesPlayed >= 11;

                    // Only add them to the list if they match the currently selected tier
                        if ((tier === 'hobbyist' && isHobbyist) || (tier === 'explorer' && isExplorer)) {
                            leaders.push({ 
                                id: doc.id, 
                                username: data.username,
                                totalScore: totalScore,
                                gamesPlayed: gamesPlayed,
                                discoveries: data.discoveries || 0,
                                averageScore: averageScore 
                            });
                        }
                    }
                });

            // Sort client-side by highest average score
                leaders.sort((a, b) => b.averageScore - a.averageScore);

            // Keep only the Top 10 for the UI
                setLeaderboardData(leaders.slice(0, 10));

            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setLeaderboardData([]);
            }
        };

        useEffect(() => {
            if (view === 'game' && !isTutorialMode) startTimeForClue(); 
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        }, [currentClueIndex, view, isTutorialMode]); 

        useEffect(() => {
            if (view === 'game' && !isTutorialMode) {
                if (timerEnabled) {
                    if (timeLeft <= 1) setTimeLeft(15);
                    startTimeForClue(false, true); 
                } else {
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        }, [timerEnabled]);

        useEffect(() => {
            if (view === 'countdown') {
            // --- THE BOUNCER ---
            // If the user selected a new region, but the Google Sheet hasn't finished downloading, WAIT.
            // When the sheet finishes, loadedRegion will update, and this effect will automatically run again.
                if (loadedRegion !== targetRegion || dataLoading) {
                    console.log(`⏳ [Countdown] Paused. Waiting for ${targetRegion} data to finish downloading...`);
                    return; 
                }

            // --- YOUR EXISTING RESET LOGIC ---
                setWrongGuesses([]); setRoundScore(5); setGuessLocked(false);
                setGameResult(null); setSelectedGroup(null); setGameId(prev => prev + 1); 
                setCurrentClueIndex(-1); setIsImageReady(false); 
                setActiveViewIndex(0);
                interactionLockRef.current = false; 

                const tutorialDone = localStorage.getItem('wildGuess_tutorial_complete');
                setIsTutorialMode(!tutorialDone);
                if (!tutorialDone) setTutorialStep(0);

            // --- YOUR EXISTING FETCH LOGIC ---
                const heavyLiftingTimer = setTimeout(async () => {
                    let targetData = null;
                    if (preloadedData) {
                        targetData = preloadedData;
                        setPreloadedData(null);
                    } else {
                    // Because of "The Bouncer" above, we are 100% sure this will now search the correct continent!
                        targetData = await fetchValidAnimal();
                    }

                    setAnimalData(targetData);

                    if (targetData && targetData.image) {
                        try { await preloadImage(targetData.image); } catch (err) {}
                    }
                    setIsImageReady(true);
                }, 100); 

                return () => clearTimeout(heavyLiftingTimer);
            }
        }, [view, targetRegion, loadedRegion, dataLoading]); // <-- IMPORTANT: Added these to the dependency array

        // --- OPTIMIZED REGION PRELOADER ---
        // This watches the dropdown. It only fires when the spreadsheet finishes loading.
        useEffect(() => { 
        // 1. Wait for the Google Sheet to catch up
            if (loadedRegion !== targetRegion || dataLoading) {
                console.log(`⏳ [Preload] Waiting for ${targetRegion} spreadsheet to process...`);
                return; 
            }

        // 2. Only fetch if we are sitting in the menu! 
        // (If we are in the game, the game loop handles preloading automatically)
            if (view === 'menu') {
                console.log(`🔄 [Preload] Sheet ready for ${targetRegion}. Fetching standby animal...`);
                setPreloadedData(null); 
                preloadNextGame();      
            }
        }, [targetRegion, loadedRegion, view, dataLoading]);

        const fetchValidAnimal = async (attempt = 1) => {
        // 1. FAILSAFE (Increased attempts because "One by One" relies on luck)
            if (attempt > 20) { 
                console.warn("⚠️ [Fetch] Max attempts reached. Switching to backup.");
                setIsOfflineMode(true);
                return BACKUP_ANIMALS[Math.floor(Math.random() * BACKUP_ANIMALS.length)];
            }

        // 2. PICK ONE RANDOM ANIMAL
            const historyJSON = localStorage.getItem('wildGuess_played');
            const played = historyJSON ? JSON.parse(historyJSON) : [];

            let availableAnimals = ALL_ANIMALS_FLAT.filter(a => !played.includes(a.name));

        // If we ran out of new animals, reset to full list
            if (availableAnimals.length === 0) availableAnimals = ALL_ANIMALS_FLAT;

        // --- CHANGE: PICK EXACTLY ONE ---
            const targetAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];

        /* // 3. DEBUG LOGS (What are we looking for?)
        console.group(`🔎 Debugging Single Search (Attempt ${attempt})`);
        console.log(`🎯 Target: ${targetAnimal.name}`);
        console.log(`🆔 Taxon ID: ${targetAnimal.id}`);
        console.log(`🌍 Region: ${targetRegion} (ID: ${REGION_IDS[targetRegion] || "Global"})`);
        console.groupEnd();*/

        // 4. CONSTRUCT URL (Fetch a batch of 10)
        // We only request Research Grade with Photos. Our JS scanner handles the annotations!
            let fetchUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${targetAnimal.id}&photo_license=cc0,cc-by,cc-by-sa&quality_grade=research&photos=true&per_page=10`;

            if (targetRegion !== "Any" && REGION_IDS[targetRegion]) {
                fetchUrl += `&place_id=${REGION_IDS[targetRegion]}`;
            }

        /*console.log(`🚀 [Debug] URL: ${fetchUrl}`);*/

            try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            const data = await response.json();

            // 5. CHECK RESULT USING OUR CUSTOM TEXT SCANNER
            if (data.results.length > 0) {
                
                // ⬇️ Look through the 10 results and find the FIRST one that is NOT scat/feathers/etc.
                const bestMatch = data.results.find(record => !isLowQualityRecord(record));

                if (bestMatch) {
                    // SUCCESS! We found a clean photo!
                    console.log(`✅ [Debug] Success! Found clean observation:`, bestMatch.id);

                    // ⬇️ NEW: Grab the Wikipedia Summary using the Taxon ID
                    let wikiText = null;
                    try {
                        // bestMatch.taxon.id is the specific animal's ID in the database
                        const taxaRes = await fetch(`https://api.inaturalist.org/v1/taxa/${bestMatch.taxon.id}`);
                        const taxaData = await taxaRes.json();
                        if (taxaData.results && taxaData.results.length > 0) {
                            wikiText = taxaData.results[0].wikipedia_summary;
                        }
                    } catch (e) {
                        console.warn("Could not fetch Wikipedia summary.");
                    }

                    // Update History
                    if (!played.includes(targetAnimal.name)) {
                        played.push(targetAnimal.name);
                        localStorage.setItem('wildGuess_played', JSON.stringify(played));
                    }

                    setIsOfflineMode(false);
                    const dateObj = new Date(bestMatch.observed_on || bestMatch.created_at);
                    const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

                    return {
                        id: bestMatch.id,
                        name: targetAnimal.name,
                        correctName: targetAnimal.name,
                        sciName: targetAnimal.displayLatin || targetAnimal.sciName,
                        image: bestMatch.photos[0].url.replace('square', 'original').replace('small', 'original').replace('medium', 'original').replace('large', 'original'),
                        lat: parseFloat(bestMatch.geojson?.coordinates[1] || 0),
                        lng: parseFloat(bestMatch.geojson?.coordinates[0] || 0),
                        location: bestMatch.place_guess || "Unknown Wilderness",
                        recordedBy: bestMatch.user?.login || "Unknown Observer",
                        link: bestMatch.uri,
                        wikiSummary: wikiText, // ⬅️ WIKIPEDIA TEXT SAVED TO STATE HERE
                        stats: { 
                            clue1: targetAnimal.clue1 || "No hint available.", 
                            clue2: targetAnimal.clue2 || "No further hints available.",
                            date: dateStr, 
                            year: dateObj.getFullYear() 
                        }
                    };
                } else {
                    // If ALL 10 results were scat/feathers, log it and try a new animal!
                    console.warn(`⚠️ [Debug] All 10 results for ${targetAnimal.name} were low quality. Trying next animal...`);
                    return fetchValidAnimal(attempt + 1);
                }
            }

            // 6. NO RESULT? RETRY.
            console.log(`⚠️ [Debug] 0 results for ${targetAnimal.name} in ${targetRegion}. Trying next animal...`);
            return fetchValidAnimal(attempt + 1);

        } catch (error) {
            console.error("🔥 [Fetch] Error:", error);
            // Don't wait too long, just try the next one
            return fetchValidAnimal(attempt + 1);
        }
    };


    const preloadNextGame = async () => {
        // Create a unique ID for this specific fetch
        const currentPreloadId = ++activePreloadRef.current;
        console.log("⏳ [Preload] Starting background fetch...");

        try { 
            const data = await fetchValidAnimal(); 

            // Only save the data if the user hasn't changed regions while we were fetching
            if (activePreloadRef.current === currentPreloadId) {
                setPreloadedData(data); 
                /*console.log("✨ [Preload] Ready:", data.name);*/
            } else {
                /*console.log("🗑️ [Preload] Ignored stale data for:", data.name);*/
            }
        } catch (e) { 
            console.warn("Background fetch failed", e); 
        }
    };

    const handleSaveProfile = async (chosenName) => {
        if (isSaving) return; 
        if (!chosenName.trim()) { alert("Please enter a valid name."); return; }
        if (!user) { alert("Waiting for connection..."); return; }
        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { username: chosenName, createdAt: serverTimestamp(), lastLogin: serverTimestamp(), gamesPlayed: 0, totalScore: 0 }, { merge: true });
            window.location.reload(); 
        } catch (error) {
            alert("Save Failed: " + error.message);
            setIsSaving(false); 
        }
    };

    const handleExitGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setView('menu');
    };

    const handleLogin = async () => {
        console.log("👉 [handleLogin] Button Clicked. Setting flag to TRUE.");
        isGoogleLoginInProgress.current = true;
        setAuthLoading(true); 

        try {
            sfx.play('click');
            console.log("👉 [handleLogin] Calling signInWithPopup...");
            const result = await signInWithPopup(auth, provider);

            console.log("👉 [handleLogin] Success! User:", result.user.uid);
            setUser(result.user);

            // Force a profile read immediately
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);

            console.log("👉 [handleLogin] Profile Check. Exists?", userSnap.exists());

            if (userSnap.exists()) {
                setUsername(userSnap.data().username);
                setIsProfileSetup(true);
            } else {
                console.log("👉 [handleLogin] No profile found. Staying on setup screen.");
                setIsProfileSetup(false);
            }
        } catch (error) {
            console.error("❌ [handleLogin] FAILED:", error);
            sfx.play('error');
            isGoogleLoginInProgress.current = false; 
        } finally {
            console.log("👉 [handleLogin] Finished. Resetting flag/loading.");
            setAuthLoading(false);
            isGoogleLoginInProgress.current = false;
        }
    };

    const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(src);
            img.onerror = () => reject(src);
        });
    };

    const startGame = () => {
        sfx.play('start'); 
        logEvent(analytics, 'level_start', { level_name: 'wild_guess_standard' });
        setView('countdown');
    };

    const handleLogout = () => {
        signOut(auth).then(() => { setUsername(""); setIsProfileSetup(false); setUser(null); }).catch((error) => console.error("Error signing out:", error));
    };

    const onCountdownComplete = () => {
        setView('game'); setCurrentClueIndex(0); startTimeForClue(); preloadNextGame();
    };

    const startTimeForClue = (forceStart = false, resume = false) => {
        if (!resume) setTimeLeft(15); 
        if (timerRef.current) clearInterval(timerRef.current);
        if (!timerEnabled && !forceStart) return;
        if (!forceStart && isTutorialMode) return; 
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (interactionLockRef.current) return prev;
                    interactionLockRef.current = true;
                    advanceClue();
                    return 15; 
                }
                return prev - 1;
            });
        }, 1000);
    };

    const advanceClue = () => {
        setCurrentClueIndex(prev => {
            const nextIndex = prev + 1;
            if (nextIndex > 4) { endGame('loss'); return 4; }
            setGuessLocked(false);
            setRoundScore(5 - nextIndex);
            setActiveViewIndex(nextIndex); // ⬅️ ADD THIS LINE to auto-scroll to the new clue
            return nextIndex;
        });
    };

    const skipClue = () => {
        if (interactionLockRef.current) return;
        if (currentClueIndex < 4) {
            interactionLockRef.current = true; 
            setTimeLeft(15); 
            advanceClue();
        }
    };

    const toggleTutorial = () => {
        if (isTutorialMode) {
            // Turning OFF
            setIsTutorialMode(false);
            localStorage.setItem('wildGuess_tutorial_complete', 'true');
            setWrongGuesses([]); 
            startTimeForClue(true); 
        } else {
            // Turning ON
            setIsTutorialMode(true);
            setTutorialStep(0);
            setCurrentClueIndex(0); 
            setActiveViewIndex(0);
            setRoundScore(5);
            setWrongGuesses([]);
            setSelectedGroup(null); 
            if (timerRef.current) clearInterval(timerRef.current); 
        }
    };


    const handleCategoryClick = (group) => {
        sfx.play('click'); setSelectedGroup(group);
        if (isTutorialMode && tutorialStep === 4) nextTutorialStep(); 
    };

    const handleBackToCategories = () => {
        setSelectedGroup(null);
        if (isTutorialMode && (tutorialStep === 5 || tutorialStep === 6)) setTutorialStep(4);
    };

    const handleShare = async () => {
        const fullMessage = `I just discovered the ${animalData.correctName} in Wild Guess! 🐊\n\nScore: ${roundScore}/5\nLocation: ${animalData.location}\n\nCan you beat me? Play here:\nhttps://www.wildguess.co.za`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Wild Guess Expedition', text: fullMessage }); logEvent(analytics, 'share', { method: 'native' }); } catch (err) {}
        } else {
            try { await navigator.clipboard.writeText(fullMessage); alert("Score copied to clipboard!"); } catch (err) {}
        }
    };

    const shareToWhatsApp = () => {
        const text = `I just discovered the ${animalData.correctName} in Wild Guess! 🐊\nScore: ${roundScore}/5\nLocation: ${animalData.location}\nPlay here: https://www.wildguess.co.za`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.wildguess.co.za')}`, '_blank');
    };

    const shareToTwitter = () => {
        const text = `I found the ${animalData.correctName} in Wild Guess! 🐊 Score: ${roundScore}/5. Play here: https://www.wildguess.co.za`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleReportIssue = async () => {
        if (!animalData || !animalData.id) return;
        if (!window.confirm("Report this listing as bad data (dead, blurry, or wrong location)?")) return;
        try {
            const reportedJSON = localStorage.getItem('wildGuess_reported');
            let reported = reportedJSON ? JSON.parse(reportedJSON) : [];
            if (!reported.includes(animalData.id)) {
                reported.push(animalData.id);
                localStorage.setItem('wildGuess_reported', JSON.stringify(reported));
            }
            const blacklistRef = doc(db, "system", "blacklist");
            await setDoc(blacklistRef, { ids: arrayUnion(animalData.id) }, { merge: true });
            await addDoc(collection(db, "reports"), { animalId: animalData.id, animalName: animalData.correctName, reason: "User Reported", reportedBy: user ? user.uid : "anonymous", timestamp: serverTimestamp() });
            alert("Report received.");
        } catch (error) {
            alert("Could not submit report.");
        }
    };

    const handleFinalGuess = (guessedAnimal) => {
        // 1. SAFETY CHECK: If the search bar accidentally passed a string instead of an object, 
        // find the actual animal object from our flat list!
        if (typeof guessedAnimal === 'string') {
            const foundAnimal = ALL_ANIMALS_FLAT.find(a => a.name === guessedAnimal);
            if (foundAnimal) {
                guessedAnimal = foundAnimal;
            } else {
                return; // Failsafe: if we somehow can't find it, do nothing.
            }
        }

        /*console.log("🤔 GUESS CHECK. Guessed:", guessedAnimal, " | Target:", animalData);*/

        // Extract the name so we can still use it for the red wrong-guess buttons
        const animalName = guessedAnimal.name;

        // 2. BULLETPROOF ID CHECK: Get the TRUE Taxon ID of the target animal from our database
        // (This prevents the iNaturalist Photo ID from ruining the comparison)
        const trueTargetId = ALL_ANIMALS_FLAT.find(a => a.name === animalData.correctName)?.id;

        if (isTutorialMode) {
            const isCorrect = guessedAnimal.id === trueTargetId;
            
            if (tutorialStep === 5) {
                if (isCorrect) { sfx.playWin(); endGame('win'); setTutorialStep(7); } 
                else { sfx.play('incorrect', 0.3); setWrongGuesses([animalName]); setCurrentClueIndex(4); setRoundScore(1); setTutorialStep(6); }
            } else if (tutorialStep === 6) {
                if (isCorrect) { sfx.playWin(); endGame('win'); setTutorialStep(7); } 
                else { sfx.play('incorrect', 0.3); endGame('loss'); setTutorialStep(8); }
            }
            return;
        }

        if (guessLocked || view !== 'game' || interactionLockRef.current) return; 

        // 3. FINAL WIN/LOSS CHECK
        if (guessedAnimal.id === trueTargetId) {
            sfx.playWin(); endGame('win');
        } else {
            sfx.play('incorrect', 0.3); 
            setWrongGuesses(prev => [...prev, animalName]);
            
            if (currentClueIndex === 4) { endGame('loss'); } 
            else { interactionLockRef.current = true; setTimeLeft(15); advanceClue(); }
        }
    };

    const endGame = async (result) => {
        if (timerRef.current) clearInterval(timerRef.current);
        let score = result === 'win' ? roundScore : 0;
        let isNewDiscovery = false;
        if (result === 'loss') sfx.play('error');
        setGameResult(result); setView('summary');
        if (user) {
            try {
                if (result === 'win') {
                    const checkQuery = query(collection(db, "games"), where("userId", "==", user.uid), where("animalName", "==", animalData.correctName), where("result", "==", "win"), limit(1));
                    const snapshot = await getDocs(checkQuery);
                    if (snapshot.empty) {
                        isNewDiscovery = true;
                        const currentQueue = JSON.parse(localStorage.getItem('journal_queue') || '[]');
                        if (!currentQueue.includes(animalData.correctName)) {
                            currentQueue.push(animalData.correctName);
                            localStorage.setItem('journal_queue', JSON.stringify(currentQueue));
                            setPendingJournalEntries(currentQueue); 
                        }
                    }
                }
                logEvent(analytics, 'level_end', { level_name: 'wild_guess_standard', success: result === 'win', score: score });
                const gameRecordPromise = addDoc(collection(db, "games"), { userId: user.uid, animalName: animalData.correctName, animalSciName: animalData.sciName, location: animalData.location, result: result, pointsEarned: score, timestamp: serverTimestamp() });
                const { dayKey, weekKey } = getDateKeys();
                const userRef = doc(db, "users", user.uid);
                const dailyRef = doc(db, "leaderboards", "daily", dayKey, user.uid);
                const weeklyRef = doc(db, "leaderboards", "weekly", weekKey, user.uid);
                const userUpdatePromise = updateDoc(userRef, { totalScore: increment(score), gamesPlayed: increment(1), discoveries: increment(isNewDiscovery ? 1 : 0), lastPlayed: serverTimestamp() });
                const leaderboardPayload = { username: username, photoURL: user.photoURL || null, score: increment(score), gamesPlayed: increment(1), discoveries: increment(isNewDiscovery ? 1 : 0) };
                await Promise.all([gameRecordPromise, userUpdatePromise, setDoc(dailyRef, leaderboardPayload, { merge: true }), setDoc(weeklyRef, leaderboardPayload, { merge: true })]);
            } catch (error) { console.error("Error saving game:", error); }
        }
    };

    const SettingsModal = () => {
        const [confirmingExit, setConfirmingExit] = useState(false);
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden border-2 border-slate-200">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Expedition Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><span className="text-xl">{isMuted ? "🔇" : "🔊"}</span><span className="text-sm font-bold text-slate-700">Sound Effects</span></div>
                            <button onClick={handleMuteToggle} className={`w-12 h-6 rounded-full transition-colors relative ${isMuted ? 'bg-slate-200' : 'bg-emerald-500'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isMuted ? 'left-1' : 'right-1'}`}></div></button>
                        </div>
                        <div className={`flex items-center justify-between ${isTutorialMode ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-3"><span className="text-xl">⏳</span><div><span className="text-sm font-bold text-slate-700 block">Round Timer</span><span className="text-[10px] text-slate-400 font-bold uppercase">{timerEnabled ? "15 Seconds" : "Unlimited"}</span></div></div>
                            <button onClick={() => setTimerEnabled(!timerEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${!timerEnabled ? 'bg-slate-200' : 'bg-emerald-500'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${!timerEnabled ? 'left-1' : 'right-1'}`}></div></button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><span className="text-xl">🎓</span><span className="text-sm font-bold text-slate-700">Tutorial Mode</span></div>
                            <button onClick={() => { toggleTutorial(); setShowSettings(false); }} className={`w-12 h-6 rounded-full transition-colors relative ${!isTutorialMode ? 'bg-slate-200' : 'bg-emerald-500'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${!isTutorialMode ? 'left-1' : 'right-1'}`}></div></button>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 transition-all duration-300">
                        {confirmingExit ? (
                            <div className="flex flex-col gap-2 animate-pop">
                                <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Abandon current game?</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setConfirmingExit(false)} className="flex-1 bg-slate-200 text-slate-600 font-bold py-2 rounded-xl hover:bg-slate-300 transition-colors text-xs uppercase tracking-wide">Cancel</button>
                                    <button onClick={() => { handleExitGame(); setShowSettings(false); }} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-xl hover:bg-red-600 transition-colors text-xs uppercase tracking-wide">Yes, Exit</button>
                                </div>
                            </div>
                            ) : (
                            <button onClick={() => setConfirmingExit(true)} className="w-full bg-red-50 text-red-500 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"><span>🚪</span> Exit Expedition</button>
                            )}
                        </div>
                    </div>
                </div>
                );
    };

    // --- ⬇️ NEW: CALCULATE JOURNAL PROGRESS ⬇️ ---
    const filteredJournalAnimals = ALL_ANIMALS_FLAT.filter(animal => {
        if (journalRegionFilter === "All") return true;
        return animal.region?.trim().toLowerCase() === journalRegionFilter.toLowerCase();
    });
    const unlockedInCurrentView = filteredJournalAnimals.filter(a => unlockedAnimals.has(a.name)).length;
    // --- ⬆️ END CALCULATION ⬆️ ---

    const journalModal = showJournal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-amber-50 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border-4 border-amber-200 relative animate-pop">
                <button onClick={() => { sfx.play('click'); setShowJournal(false); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full text-amber-900 font-bold flex items-center justify-center transition-colors text-xl">✕</button>
                
                {/* HEADER AREA */}
                <div className="bg-amber-100 p-6 border-b border-amber-200 text-center flex-shrink-0 relative">
                    <h2 className="font-freckle text-3xl text-amber-900 uppercase tracking-wide">Field Journal</h2>
                    
                    {/* ⬇️ REGION DROPDOWN ⬇️ */}
                    <div className="mt-4 flex justify-center">
                        <div className="relative inline-block w-48">
                            <select 
                                value={journalRegionFilter}
                                onChange={(e) => { sfx.play('click'); setJournalRegionFilter(e.target.value); }}
                                className="w-full bg-white text-amber-900 font-bold py-2 px-3 rounded-lg border-2 border-amber-300 shadow-sm appearance-none cursor-pointer focus:outline-none focus:border-amber-500 text-sm uppercase tracking-wider text-center"
                            >
                                <option value="All">🌍 All Regions</option>
                                <option value="Africa">Africa</option>
                                <option value="Asia">Asia</option>
                                <option value="Europe">Europe</option>
                                <option value="North America">North America</option>
                                <option value="South America">South America</option>
                                <option value="Oceania">Oceania</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-700 text-xs">▼</div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-2 mt-4">
                        <span className="text-amber-800/60 text-xs font-bold uppercase tracking-widest">
                            {journalRegionFilter === "All" ? "Global Progress:" : `${journalRegionFilter} Progress:`}
                        </span>
                        <span className="bg-amber-300 text-amber-900 px-2 py-0.5 rounded text-xs font-black shadow-sm">
                            {unlockedInCurrentView} / {filteredJournalAnimals.length}
                        </span>
                    </div>
                </div>

                {/* SCROLLABLE GRID AREA */}
                <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                        
                        {/* ⬇️ UPDATED: Uses our pre-calculated list! ⬇️ */}
                        {filteredJournalAnimals.map((animal, idx) => {
                            const isUnlocked = unlockedAnimals.has(animal.name);
                            return (
                                <div key={idx} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-500 border-2 ${isUnlocked ? 'bg-white border-amber-200 shadow-md rotate-0 opacity-100' : 'bg-slate-100 border-slate-200 shadow-none opacity-60'}`}>
                                    <div className="text-4xl md:text-5xl mb-2 transition-all duration-500" style={!isUnlocked ? { color: 'transparent', textShadow: '0 0 0 #94a3b8', filter: 'blur(1px)' } : {}}>
                                        {animal.emoji || animal.groupEmoji || "🐾"}
                                    </div>
                                    <div className={`text-[9px] md:text-[10px] font-bold text-center uppercase tracking-tight leading-tight transition-opacity duration-500 ${isUnlocked ? 'text-slate-700 opacity-100' : 'text-slate-400 opacity-0'}`}>
                                        {animal.name}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Empty State Failsafe */}
                        {filteredJournalAnimals.length === 0 && (
                            <div className="col-span-full text-center py-10 text-amber-900/50 font-bold uppercase tracking-widest">
                                No animals found for this region.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );

    if (view === 'menu') {
        return (
            <div className="h-screen w-full bg-gradient-to-b from-green-900 to-green-700 overflow-x-hidden overflow-y-auto md:overflow-hidden relative flex flex-col md:flex-row items-center justify-start md:justify-center p-4 gap-6 py-12 md:py-0">   
                <button onClick={() => { sfx.play('click'); setShowSettings(true); }} className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full shadow-lg text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 hover:rotate-90 transition-all duration-500 group" title="Settings"><span className="text-2xl drop-shadow-md">⚙️</span></button>
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {menuStickers.map((sticker) => (<div key={sticker.id} className="absolute emoji-sticker transition-transform duration-1000 ease-in-out hover:scale-110" style={{ top: `${sticker.top}%`, left: `${sticker.left}%`, fontSize: `${sticker.size}rem`, transform: `rotate(${sticker.rotation}deg)`, opacity: sticker.opacity }}>{sticker.emoji}</div>))}
                    </div>
                    <div className="relative z-10 flex flex-col items-center w-full max-w-md md:w-1/2 md:items-end md:pr-8 flex-shrink-0">
                        <h1 className="font-freckle text-5xl md:text-7xl text-green-950 sticker-text drop-shadow-2xl mb-4 tracking-wider leading-none whitespace-nowrap">W<span className="-mx-4 md:-mx-7 relative -top-1">🐊</span>LD GUESS</h1>
                        <div className="bg-white/95 backdrop-blur-sm p-5 md:p-6 rounded-3xl shadow-2xl w-full text-center border-4 border-white transform -rotate-1 mb-6">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">HOW TO PLAY</p>
                            <div className="flex justify-between items-start px-1 mb-2 gap-1">
                                <div className="flex flex-col items-center w-1/3"><span className="text-4xl mb-2 filter drop-shadow-sm">📸</span><span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">Real-Life Animal Sighting</span></div>
                                <div className="text-slate-300 text-xl mt-2">➜</div>
                                <div className="flex flex-col items-center w-1/3"><span className="text-4xl mb-2 filter drop-shadow-sm">🧑‍🔬</span><span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">Analyze the Clues</span></div>
                                <div className="text-slate-300 text-xl mt-2">➜</div>
                                <div className="flex flex-col items-center w-1/3"><span className="text-4xl mb-2 filter drop-shadow-sm">🔍</span><span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight">Identify the Animal</span></div>
                            </div>
                        </div>
                    {/* REGION SELECTOR */}
                        <div className="w-full mb-4 relative z-20">
                            <select 
                                value={targetRegion} 
                                onChange={(e) => { sfx.play('click'); setTargetRegion(e.target.value); }}
                                className="w-full bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl border-4 border-white/20 shadow-lg appearance-none cursor-pointer focus:outline-none focus:border-emerald-400 text-center uppercase tracking-wide"
                            >
                                {REGION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-bold text-sm py-2">
                                        {opt.label}
                                    </option>
                                    ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white text-xl">▼</div>
                        </div>

                {/* START BUTTON */}
                        <button onClick={startGame} onMouseEnter={() => sfx.play('hover', 0.2)} className="relative overflow-hidden text-white font-bold py-4 rounded-full shadow-[0_6px_0_#14532d] active:shadow-none active:translate-y-1 transform transition-all border-4 border-white w-full hover:scale-105 bg-green-600 hover:bg-green-500">
                            <span className="text-2xl font-black tracking-widest uppercase drop-shadow-md">START EXPEDITION</span>
                        </button>
                        <div className="mt-4 flex flex-col items-center gap-3 w-full">
                            {user ? (
                                <>
                                <div className="bg-black/20 text-white/80 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-2">{user.photoURL && <img src={user.photoURL} alt="User" className="w-4 h-4 rounded-full border border-white/50" />}Playing as: <span className="text-white">{username}</span></div>
                                <button onMouseEnter={() => sfx.play('hover', 0.2)} onClick={fetchJournal} className="bg-amber-100 text-amber-900 border-2 border-amber-300 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2"><span className="text-lg">📖</span> Field Journal</button>
                                <button onMouseEnter={() => sfx.play('hover', 0.2)} onClick={() => { sfx.play('click'); handleLogout(); }} className="text-[10px] text-green-200/70 hover:text-white font-bold uppercase tracking-widest transition-colors hover:underline decoration-green-400 decoration-2 underline-offset-4">( Logout )</button>
                                </>
                                ) : (
                                <>
                                <button onClick={handleLogin} onMouseEnter={() => sfx.play('hover', 0.2)} className="bg-white text-slate-700 border-2 border-slate-200 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Login with Google</button>
                                <div className="flex items-center gap-4 mb-6"><div className="h-px bg-slate-200 flex-1"></div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or Play as Guest</span><div className="h-px bg-slate-200 flex-1"></div></div>
                                <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); handleSaveProfile(formData.get('username')); }} className="space-y-4"><input name="username" type="text" placeholder="Enter Guest Name..." maxLength={15} required className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center font-bold text-slate-700 bg-slate-50"/><button type="submit" disabled={isSaving} className={`w-full font-bold py-3 rounded-xl transition transform shadow-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-400 hover:bg-slate-500 hover:scale-[1.02]'}`}>{isSaving ? "STARTING..." : "PLAY AS GUEST"}</button></form>
                                </>
                                )}
                            </div>
                        </div>
                        <div className="relative z-10 w-full max-w-md md:w-1/2 h-[500px] md:h-[80vh] flex flex-col md:pl-8 flex-shrink-0 mb-12 md:mb-0">
                            <div className="bg-orange-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-orange-100 overflow-hidden flex flex-col h-full max-h-[500px] md:max-h-full">
                                <div className="bg-orange-100 p-2 border-b border-orange-200 flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">👑</span>
                                            <h2 className="text-orange-800 font-black tracking-wide text-sm uppercase">Top Explorers</h2>
                                        </div>
                                    </div>

                            {/* ROW 1: TIME MATRIX */}
                                    <div className="flex bg-orange-200/50 p-1 rounded-lg">
                                        {['daily', 'weekly', 'allTime'].map((tab) => (
                                            <button 
                                                onMouseEnter={() => sfx.play('hover', 0.2)} 
                                                onClick={() => { sfx.play('click', 0.1); setLeaderboardTab(tab); }} 
                                                key={tab} 
                                                className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded-md transition-all ${leaderboardTab === tab ? 'bg-white text-orange-600 shadow-sm scale-105' : 'text-orange-800/60 hover:text-orange-800'}`}
                                            >
                                                {tab === 'allTime' ? 'All Time' : tab}
                                            </button>
                                            ))}
                                    </div>

                            {/* ROW 2: TIER MATRIX */}
                                    <div className="flex bg-orange-200/50 p-1 rounded-lg">
                                        {[
                                            { id: 'hobbyist', label: 'Hobbyist (10 games or less)' },
                                            { id: 'explorer', label: 'Expert Explorers' }
                                        ].map((t) => (
                                            <button 
                                                onMouseEnter={() => sfx.play('hover', 0.2)} 
                                                onClick={() => { sfx.play('click', 0.1); setLeaderboardTier(t.id); }} 
                                                key={t.id} 
                                                className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded-md transition-all ${leaderboardTier === t.id ? 'bg-white text-emerald-600 shadow-sm scale-105' : 'text-orange-800/60 hover:text-orange-800'}`}
                                            >
                                                {t.label}
                                            </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
                                    {leaderboardData.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-orange-300 opacity-50"><span className="text-4xl mb-2">⏳</span><span className="font-bold text-sm uppercase">Loading Scores...</span></div>) : (leaderboardData.map((player, index) => (<div onMouseEnter={() => sfx.play('hover', 0.2)} key={player.id} className={`flex items-center justify-between p-3 rounded-xl border-b-4 transition-transform hover:scale-[1.01] ${player.id === user?.uid ? 'bg-white border-emerald-200 shadow-sm ring-2 ring-emerald-400 ring-offset-1' : 'bg-white border-orange-100 shadow-sm'}`}><div className="flex items-center gap-3"><div className={`font-black text-sm w-8 h-8 flex items-center justify-center rounded-lg ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</div><div className="flex flex-col"><span className={`font-bold text-sm leading-tight ${player.id === user?.uid ? 'text-emerald-700' : 'text-slate-700'}`}>{player.username} {player.id === user?.uid && "(You)"}</span><div className="flex items-center gap-3 mt-0.5"><span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{player.gamesPlayed || 0} Expeditions</span><span className="text-[9px] text-emerald-600/80 uppercase font-bold tracking-wider">{player.discoveries || 0} Animals Found</span></div></div></div><div className="bg-orange-100 px-3 py-1 rounded-lg flex items-center gap-1">
                                        <span className="font-mono font-black text-orange-600 text-sm">
                                            {player.averageScore.toFixed(1)}
                                        </span>
                                        <span className="text-[9px] opacity-60 font-bold text-orange-800 pt-0.5">AVG</span>
                                    </div></div>)))}
                                </div>
                            </div>
                        </div>
                        {(!authLoading && !isProfileSetup) && (
                            <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl text-center border-4 border-emerald-100 relative overflow-hidden">
                                    <div className="text-6xl mb-4 animate-bounce">🐊</div>

                            {/* DYNAMIC HEADER LOGIC */}
                                    {user && !user.isAnonymous ? (
                                // SCENARIO A: Logged in via Google, but no Username yet
                                        <>
                                        <h2 className="text-3xl font-freckle text-emerald-600 mb-2">Login Successful!</h2>
                                        <p className="text-slate-500 mb-6 font-bold">You are authenticated. Please choose a nickname to complete your profile.</p>
                                    {/* No Google Button here, because they are already logged in! */}
                                        </>
                                        ) : (
                                // SCENARIO B: Guest / Not Logged In
                                        <>
                                        <h2 className="text-3xl font-freckle text-green-950 mb-2">Welcome to Wild Guess!</h2>
                                        <p className="text-slate-500 mb-6">Join the expedition to track your scores and compete on the leaderboard.</p>

                                        <button onClick={handleLogin} onMouseEnter={() => sfx.play('hover', 0.2)} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all mb-6 group">
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Sign in with Google
                                        </button>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or Play as Guest</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>
                                        </>
                                        )}

                            {/* FORM (Always Visible) */}
                                        <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); handleSaveProfile(formData.get('username')); }} className="space-y-4">
                                            <input name="username" type="text" placeholder="Enter Explorer Name..." maxLength={15} required className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center font-bold text-slate-700 bg-slate-50"/>
                                            <button type="submit" disabled={isSaving} className={`w-full font-bold py-3 rounded-xl transition transform shadow-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-400 hover:bg-slate-500 hover:scale-[1.02]'}`}>
                                                {isSaving ? "SAVING..." : (user && !user.isAnonymous ? "COMPLETE PROFILE" : "PLAY AS GUEST")}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                                )}
        {showSettings && <SettingsModal />}
        {journalModal}



                {/* --- TIMER CHALLENGE MODAL --- */}
        {showTimerPromo && (
            <div className="fixed inset-0 z-[130] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-4 border-green-400 relative animate-pop flex flex-col">

                            {/* Header */}
                    <div className="bg-green-50 pt-8 pb-6 px-6 flex flex-col items-center relative flex-shrink-0">
                        <button onClick={handleDismissTimer} className="absolute top-3 right-3 w-8 h-8 bg-green-200/50 rounded-full text-green-800 font-bold hover:bg-green-200 transition-colors flex items-center justify-center">✕</button>

                        <div className="text-6xl mb-4 animate-pulse drop-shadow-md">⏱️</div>
                        <h2 className="text-2xl font-black text-green-800 uppercase tracking-widest text-center leading-none">Ready for a Challenge?</h2>
                    </div>

                            {/* Content */}
                    <div className="px-6 pb-6 pt-6 text-slate-700 flex flex-col items-center text-center">
                        <p className="text-sm font-medium mb-2">
                            You've successfully observed <span className="font-bold text-green-600">10+ animals!</span> 
                        </p>
                        <p className="text-sm font-medium mb-6">
                            Turn on the <span className="font-bold text-green-600">15-Second Timer</span> for a bit more of a challenge.
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 w-full mb-6 text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-inner">
                            <span>⚙️</span> You can always turn it off in settings
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <button onClick={handleAcceptTimer} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-lg shadow-green-200/50 flex items-center justify-center gap-2">
                                <span>⏳</span> Turn Timer On
                            </button>

                            <button onClick={handleDismissTimer} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-xl uppercase tracking-wider transition-colors text-xs">
                                No Thanks, Keep It Chill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
                {/* ⬆️ END OF TIMER MODAL ⬆️ */}

                {/* --- MASSIVE UPDATE MODAL --- */}
        {showUpdateModal && (
            <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-4 border-emerald-400 relative animate-pop flex flex-col max-h-[90vh]">

                        {/* Header & Picture */}
                    <div className="bg-emerald-50 pt-8 pb-4 px-6 flex flex-col items-center relative flex-shrink-0">
                        <button onClick={handleCloseUpdate} className="absolute top-3 right-3 w-8 h-8 bg-emerald-200/50 rounded-full text-emerald-800 font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center">✕</button>

                            {/* Make sure richard.jpg is in your public folder! */}
                        <img src="/richard.jpg" alt="Richard Bolland" className="w-24 h-24 rounded-full shadow-lg border-4 border-white object-cover mb-4" />

                        <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-widest text-center leading-none">Huge Update!</h2>
                            {/*<div className="text-2xl mt-2 animate-bounce">🎉</div>*/}
                    </div>

                        {/* Content Scroll Area */}
                    <div className="px-6 pb-6 pt-2 overflow-y-auto custom-scroll text-slate-700 flex-1">
                        <p className="text-sm font-medium text-center mb-5 leading-relaxed">
                            A massive thanks to everyone who has played the game and offered feedback! It's been incredibly fun building this. Here's what's new:
                        </p>

                            {/* Spruced Up Feature List */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg flex-shrink-0">🐾</div>
                                <span className="text-sm font-bold text-slate-700 leading-tight">Expanded to over <span className="text-emerald-600">600 Animals</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg flex-shrink-0">🌍</div>
                                <span className="text-sm font-bold text-slate-700 leading-tight">Including <span className="text-emerald-600">6 Continents</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg flex-shrink-0">📂</div>
                                <span className="text-sm font-bold text-slate-700 leading-tight">Fresh <span className="text-emerald-600">Categories</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg flex-shrink-0">🔎</div>
                                <span className="text-sm font-bold text-slate-700 leading-tight">Restructed <span className="text-emerald-600">Hints & Clues</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-lg flex-shrink-0">🏆</div>
                                <span className="text-sm font-bold text-slate-700 leading-tight">A revamped <span className="text-emerald-600">Scoring System</span></span>
                            </div>
                        </div>

                        <p className="text-xs text-center text-slate-500 font-bold mb-4 uppercase tracking-widest">
                            Hope you find some fun animals,<br/>
                            <a href="https://www.richardbolland.co.za" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 underline decoration-2 underline-offset-4 mt-1 inline-block transition-colors">
                                Richard Bolland
                            </a>
                            <span className="block text-[8px] mt-7 opacity-60">A special shoutout to Clayden Knighton-Fitt who helped to add the extra animals.</span>
                        </p>

                        <button onClick={handleCloseUpdate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-lg shadow-emerald-200/50">
                            Let's Play!
                        </button>
                    </div>
                </div>
            </div>
            )}

    </div>
    );
    }




    if (view === 'countdown') {
        return (<CountdownScreen onComplete={onCountdownComplete} stickers={menuStickers} isReady={!!animalData && isImageReady} />);
    }

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
            <div id="landscape-warning" className="fixed inset-0 z-[100] bg-slate-900 text-white flex-col items-center justify-center p-6 text-center"><div className="text-6xl mb-6">🔄</div><h2 className="text-2xl font-bold mb-2">Please Rotate Device</h2><p className="text-slate-300">This game is designed for portrait mode.</p></div>

            {/* LEFT PANEL */}
            <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden relative order-1">
                <div className="h-2 bg-slate-200 w-full flex-shrink-0"><div className={`h-full transition-all duration-1000 linear ${timerEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} style={{ width: `${(timeLeft / 15) * 100}%` }}></div></div>
                <div className="flex-1 relative">
                    <button onClick={() => { sfx.play('click'); setShowSettings(true); }} className="absolute top-2 right-2 z-[60] w-10 h-10 bg-white/90 border-2 border-slate-300 rounded-full shadow-md text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"><span className="text-xl">⚙️</span></button>
                    {showSettings && <SettingsModal />}
                    {isOfflineMode && (<div className="absolute top-16 left-1/2 -translate-x-1/2 z-[80] bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce flex items-center gap-2 whitespace-nowrap"><span>⚠️</span> Server Offline: Using Backup Data</div>)}
                    {showToast && (<div className="absolute top-12 right-2 z-[70] bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pop max-w-[150px] text-right">Tutorial hidden.<br />Tap "OFF" to restart.</div>)}

                    <div className="absolute inset-0" key={gameId}>
                        <div className={`absolute inset-0 transition-opacity duration-500 ${currentClueIndex >= 0 ? 'opacity-100' : 'opacity-0'}`}>{animalData && (<MapClue lat={animalData.lat} lng={animalData.lng} zoom={activeViewIndex < 1 ? 2 : 11} />)}</div>
                        <div className={`hidden md:block absolute inset-0 z-10 transition-opacity duration-1000 bg-slate-200 overflow-hidden ${currentClueIndex >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{animalData?.image && (<div className="w-full h-full relative"><img src={animalData.image} className="w-full h-full object-cover blur-xl scale-110 transform" alt="Revealed Animal" /><div className="absolute inset-0 bg-black/10"></div></div>)}</div>
                    </div>

                  {/* CLUES CONTAINER */}
                    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center pb-2 px-2 md:pb-4 md:px-4">

                        {/* THE PHOTO (Stays visible from Index 1 onwards) */}
                        {activeViewIndex >= 1 && animalData?.image && (
                            <div className={`absolute top-2 md:top-4 w-full flex justify-center pointer-events-auto ${currentClueIndex === 4 ? 'hidden md:flex' : ''}`}>
                                <div className="relative bg-slate-200 rounded-2xl shadow-2xl overflow-hidden border-4 border-white w-48 h-32 md:w-64 md:h-48 flex-shrink-0 animate-pop">
                                    <img 
                                        src={animalData.image} 
                                        className="w-full h-full object-cover blur-[4px] scale-110" 
                                        alt="Mystery Clue" 
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <span className="text-6xl md:text-8xl font-black text-white/90 drop-shadow-md">?</span>
                                    </div>
                                </div>
                            </div>
                            )}

                        {/* TEXT CLUES NAV WRAPPER */}
                        <div className={`mt-auto w-full flex items-center justify-center gap-2 md:gap-4 pointer-events-auto pb-2 ${currentClueIndex === 4 ? 'hidden md:flex' : ''}`}>

                            {/* BACK BUTTON */}
                            <button 
                                onClick={() => { sfx.play('click', 0.1); setActiveViewIndex(prev => prev - 1); }} 
                                disabled={activeViewIndex === 0}
                                className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 text-slate-600 font-black flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 ${activeViewIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pop'}`}
                            >
                                ◀
                            </button>

                            {/* DYNAMIC TEXT CARD */}
                            <div className="relative min-w-[200px] max-w-sm w-full transition-all duration-300 flex justify-center">

                                {/* Scientific Name (Index 0) */}
                                {activeViewIndex === 0 && (
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-2 md:px-6 md:py-4 rounded-xl shadow-xl border border-white/50 text-center w-full animate-pop">
                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5 md:mb-1">Scientific Name</span>
                                        <span className="text-emerald-800 italic font-serif text-base md:text-xl leading-none">{animalData?.sciName || animalData?.displayLatin}</span>
                                    </div>
                                    )}

                                {/* Location (Index 1) */}
                                {activeViewIndex === 1 && (
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-2 md:px-6 md:py-4 rounded-xl shadow-xl border border-white/50 text-center w-full animate-pop">
                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Location</span>
                                        <span className="text-slate-800 font-bold text-sm md:text-lg leading-tight block">{animalData?.location}</span>
                                    </div>
                                    )}

                                {/* Hint 1 (Index 2) */}
                                {activeViewIndex === 2 && (
                                    <div className="bg-emerald-50/95 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-xl border border-emerald-100 text-center w-full animate-pop">
                                        <span className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase block mb-1 tracking-wider">Clue 1</span>
                                        <div className="text-emerald-900 font-medium italic text-sm md:text-lg leading-tight">"{animalData?.stats?.clue1}"</div>
                                    </div>
                                    )}

                                {/* Hint 2 (Index 3) */}
                                {activeViewIndex === 3 && (
                                    <div className="bg-emerald-50/95 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-xl border border-emerald-100 text-center w-full animate-pop">
                                        <span className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase block mb-1 tracking-wider">Clue 2</span>
                                        <div className="text-emerald-900 font-medium italic text-sm md:text-lg leading-tight">"{animalData?.stats?.clue2}"</div>
                                    </div>
                                    )}
                            </div>

                            {/* FORWARD BUTTON */}
                            <button 
                                onClick={() => { sfx.play('click', 0.1); setActiveViewIndex(prev => prev + 1); }} 
                                disabled={activeViewIndex >= currentClueIndex}
                                className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 text-slate-600 font-black flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 ${activeViewIndex >= currentClueIndex || currentClueIndex === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pop'}`}
                            >
                                ▶
                            </button>

                        </div>
                    </div>
                </div>

                {/* FOOTER (NOW MOVED OUTSIDE THE MAP CONTAINER SO IT IS VISIBLE) */}
                <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-between px-4 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 px-3 py-1 rounded-lg shadow-sm"><div className="flex flex-col items-end leading-none"><span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Potential</span><span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Points</span></div><div className="text-4xl font-black text-emerald-600 drop-shadow-sm">{roundScore}</div></div>
                    <div className="flex gap-2">
                        <button onMouseEnter={() => sfx.play('hover')} onClick={() => endGame('surrender')} disabled={isTutorialMode} className={`px-4 py-2 text-xs rounded-full transition-all duration-300 ${currentClueIndex === 4 ? 'bg-red-500 text-white font-black tracking-widest shadow-lg hover:bg-red-600 hover:scale-105 animate-pulse' : 'text-slate-400 hover:text-red-500 font-medium'} ${isTutorialMode ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}>GIVE UP</button>
                        {currentClueIndex < 4 && (<button onMouseEnter={() => sfx.play('hover', 0.2)} onClick={() => { sfx.play('click', 0.2); skipClue(); }} disabled={isTutorialMode} className={`bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition ${isTutorialMode ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}>{timerEnabled ? 'NEXT CLUE' : 'REVEAL NEXT'}</button>)}
                        </div>
                    </div>
                </div>

            {/* RIGHT PANEL */}
                <div className="h-[45%] md:h-full md:w-96 bg-slate-50 overflow-hidden border-t md:border-t-0 md:border-l border-slate-200 order-2 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 relative">
                    {currentClueIndex === 4 ? (
                        <div className="flex-1 flex flex-col p-4 items-center bg-slate-100 overflow-hidden">
                            <div className="flex-shrink-0 mb-4 text-center">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">Final Guess</h3>
                                <p className="text-xs text-slate-500 font-bold mt-1">Scroll to see all options</p>
                            </div>

                            <div className="w-full space-y-3 flex-1 overflow-y-auto custom-scroll px-1 pb-2">
                                {generateOptions(animalData).map((opt, i) => (
                                    <button 
                                        key={i} 
            // ⬇️ CHANGED 'result' TO 'opt' RIGHT HERE ⬇️
                                        onClick={() => handleFinalGuess(opt)} 
                                        className="w-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-4 px-6 rounded-xl shadow-sm border-2 border-slate-200 hover:border-emerald-400 transition-all text-left flex items-center justify-between"
                                    >
                                        <span className="uppercase tracking-wider">{opt.name}</span>
                                        <span>➜</span>
                                    </button>
                                    ))}
                            </div>
                        </div>
                        ) : (
                        <>
                        <div className="p-2 border-b border-slate-200 bg-slate-100 flex-shrink-0 z-10"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span><input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if (isTutorialMode && tutorialStep === 4) { nextTutorialStep(); } }} placeholder="Search animals..." onClick={() => sfx.play('click', 0.2)} disabled={guessLocked || (isTutorialMode && tutorialStep < 4)} className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50" />{searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1">✕</button>)}</div></div>
                        <div className="flex-1 overflow-y-auto custom-scroll p-2 content-start">
                            {searchTerm ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_ANIMALS_FLAT.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((animal, idx) => {
                                        const isWrong = wrongGuesses.includes(animal.name);
                                        return (<button key={idx} disabled={guessLocked || isWrong || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)} onClick={() => { handleFinalGuess(animal.name); setSearchTerm(''); }} 
                                            className={`rounded-lg font-bold shadow-sm border border-slate-100 transition-all py-2 px-2 text-xs text-left flex items-center ${isWrong ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'} ${(guessLocked || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)) ? 'opacity-50' : ''}`}><span className="mr-2 text-base">{animal.groupEmoji}</span><span className="truncate">{animal.name}</span></button>);
                                    })}
                                    {ALL_ANIMALS_FLAT.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (<div className="col-span-2 text-center text-slate-400 text-xs py-4 italic">No animals found</div>)}
                                </div>
                                ) : (
                                <>
                                {!selectedGroup && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-full content-start">
                                        <button onClick={() => handleCategoryClick("ALL")} disabled={guessLocked || (isTutorialMode && tutorialStep < 4)} className={`rounded-xl flex items-center shadow-sm transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-md cursor-pointer border border-slate-300 flex-row justify-start px-2 py-1 h-11 md:flex-col md:justify-center md:aspect-square md:h-auto md:px-0 ${(guessLocked || (isTutorialMode && tutorialStep < 4)) ? 'opacity-50' : ''}`}><span className="text-xl mr-2 md:mr-0 md:mb-1">🌎</span><span className="text-[10px] md:text-[10px] font-bold uppercase tracking-tight text-left md:text-center leading-tight">All Animals</span></button>
                                        {ANIMAL_GROUPS.map((group, idx) => (<button key={idx} disabled={guessLocked || (isTutorialMode && tutorialStep < 4)} onClick={() => handleCategoryClick(group)} className={`rounded-xl flex items-center shadow-sm transition-all duration-200 bg-white hover:bg-emerald-50 hover:shadow-md cursor-pointer border border-slate-100 flex-row justify-start px-2 py-1 h-11 md:flex-col md:justify-center md:aspect-square md:h-auto md:px-0 ${(guessLocked || (isTutorialMode && tutorialStep < 4)) ? 'opacity-50' : ''}`}><span className="text-xl mr-2 md:mr-0 md:mb-1">{group.emoji}</span><span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight text-left md:text-center leading-tight">{group.name}</span></button>))}
                                        </div>
                                        )}
                                {selectedGroup && (
                                    <div className="flex flex-col h-full">
                                        <button onMouseEnter={() => sfx.play('hover', 0.1)} onClick={() => { sfx.play('click', 0.2); handleBackToCategories(); }} disabled={isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6} className={`mb-2 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 text-[10px] uppercase font-bold px-2 py-1.5 flex-shrink-0 transition-colors ${(isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6) ? 'opacity-50' : ''}`}>← Back to Categories</button>
                                        <div className="text-center mb-2 flex-shrink-0"><span className="text-xl inline-block mr-2">{selectedGroup === "ALL" ? "🌎" : selectedGroup.emoji}</span><span className="text-sm font-bold text-slate-700">{selectedGroup === "ALL" ? "All Animals" : selectedGroup.name}</span></div>
                                        <div className={`grid gap-2 flex-1 content-start ${selectedGroup === "ALL" ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                            {(selectedGroup === "ALL" ? ALL_ANIMALS_FLAT : selectedGroup.animals).map((animal, idx) => {
                                                const isWrong = wrongGuesses.includes(animal.name);
                                                return (<button key={idx} disabled={guessLocked || isWrong || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)} onClick={() => handleFinalGuess(animal)} className={`rounded-lg font-bold shadow-sm border border-slate-100 transition-all leading-tight ${selectedGroup === "ALL" ? 'py-1 px-1 text-[9px] h-10 flex flex-col justify-center items-center' : 'py-2 px-2 text-xs'} ${isWrong ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'} ${(guessLocked || (isTutorialMode && tutorialStep !== 5 && tutorialStep !== 6)) ? 'opacity-50' : ''}`}>{selectedGroup === "ALL" && <span className="opacity-60 text-xs mb-0.5">{animal.groupEmoji}</span>}<span className="truncate w-full text-center">{animal.name}</span></button>)
                                            })}
                                        </div>
                                    </div>
                                    )}
                                </>
                                )}
    </div>
    </>
    )}
    </div>

            {/* GLOBAL OVERLAYS */}
    {view === 'summary' && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto custom-scroll p-4 md:p-8 flex items-start md:items-center justify-center">

                    {/* RESPONSIVE WRAPPER: Stacks on mobile, side-by-side on desktop */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl my-auto justify-center items-center md:items-stretch">

                        {/* --- LEFT: SUMMARY CARD (Your Exact Existing Code) --- */}
                <div className="bg-white rounded-2xl w-full max-w-sm flex-shrink-0 overflow-hidden shadow-2xl animate-pop flex flex-col h-fit">
                            {/* 1. IMAGE HEADER */}
                            <div className="h-64 bg-slate-200 relative flex-shrink-0">
                                {animalData?.image ? (<img src={animalData.image} className="w-full h-full object-cover" alt="Animal" />) : (<div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>)}
                                
                                {/* ⬇️ UPDATED: ROTATING 10-POINT STAR BUTTON ⬇️ */}
                                {animalData?.wikiSummary && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); // ⬅️ NEW: Stops invisible layers from stealing the click!
                                            console.log("🌟 STAR CLICKED! Wiki text exists:", !!animalData?.wikiSummary); 
                                            sfx.play('click'); 
                                            setShowWikiModal(true); 
                                        }}
                                        className="absolute top-3 right-3 z-[60] w-14 h-14 group hover:scale-110 transition-transform flex items-center justify-center"
                                        title="Did You Know?"
                                    >
                                        <svg className="absolute inset-0 w-full h-full text-amber-400 animate-[spin_6s_linear_infinite] drop-shadow-lg group-hover:text-amber-300" viewBox="0 0 100 100">
                                            <polygon fill="currentColor" points="50,0 61,25 88,15 76,40 100,50 76,60 88,85 61,75 50,100 39,75 12,85 24,60 0,50 24,40 12,15 39,25"/>
                                        </svg>
                                        <span className="relative z-10 text-xl font-black text-amber-900">💡</span>
                                    </button>
                                )}
                                {/* ⬆️ END OF STAR BUTTON ⬆️ */}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                    <h2 className="text-white text-3xl font-bold leading-none">{animalData?.correctName}</h2>
                                    <p className="text-white/80 text-sm italic font-serif mt-1">{animalData?.sciName}</p>
                                </div>
                            </div>

                            {/* 2. SCROLLABLE STATS AREA */}
                        <div className="p-6 text-center flex-1 overflow-y-auto custom-scroll">
                                {/* RESULT TEXT */}
                            {gameResult === 'win' ? (
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-emerald-600 mb-1">Correct!</h3>
                                    <p className="text-slate-600 font-medium">You earned <span className="text-emerald-600 font-bold">{roundScore} points</span>.</p>
                                </div>
                                ) : (
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-red-600 mb-1">Missed it!</h3>
                                    <p className="text-slate-600">Better luck next time.</p>
                                </div>
                                )}

                                {/* STATS CARD */}
                                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 text-sm border border-slate-100 shadow-inner">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Observed By</span>
                                        {animalData?.link ? (
                                            <a href={animalData.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline truncate max-w-[150px]">{animalData.recordedBy} ↗</a>
                                            ) : (
                                            <span className="text-slate-700 font-medium">{animalData?.recordedBy}</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between border-b border-slate-200 pb-2">
                                            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Date</span>
                                            <span className="text-slate-700 font-medium">{animalData?.stats?.date}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-200 pb-2">
                                            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Location</span>
                                            <span className="text-slate-700 text-right max-w-[60%] font-medium">{animalData?.location}</span>
                                        </div>
                                        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                            <div>Source: <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 underline">iNaturalist</a></div>
                                            <button onClick={handleReportIssue} className="flex items-center gap-1 text-slate-300 hover:text-red-400 transition-colors font-bold uppercase tracking-wider" title="Report bad data, wrong location, or dead animal"><span>🚩</span> Report Issue</button>
                                        </div>
                                    </div>
                                </div>

                            {/* 3. BUTTONS FOOTER */}
                                <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 flex flex-col gap-2">
                                {/* A. PLAY AGAIN */}
                                    <button onClick={startGame} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-200 transform hover:scale-[1.02] uppercase tracking-widest">
                                        Play Again
                                    </button>

                                {/* B. SHARE DISCOVERY */}
                                    <button onClick={() => { sfx.play('click'); setShowShareMenu(!showShareMenu); }} className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg transform flex items-center justify-center gap-2 uppercase tracking-widest ${showShareMenu ? 'bg-slate-100 text-slate-600 shadow-inner scale-95' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] shadow-blue-200'}`}>
                                        <span>{showShareMenu ? '❌' : '📤'}</span> 
                                        {showShareMenu ? 'Close Options' : 'Share Discovery'}
                                    </button>

                                {/* Social Icons Drawer */}
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showShareMenu ? 'max-h-24 opacity-100 mb-1' : 'max-h-0 opacity-0'}`}>
                                        <div className="flex gap-2 justify-center pt-2">
                                            <button onClick={() => { sfx.play('click'); shareToWhatsApp(); }} className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl shadow-md flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95"><span className="text-xl">💬</span></button>
                                            <button onClick={() => { sfx.play('click'); shareToFacebook(); }} className="flex-1 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 rounded-xl shadow-md flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95"><span className="text-xl">fb</span></button>
                                            <button onClick={() => { sfx.play('click'); shareToTwitter(); }} className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl shadow-md flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95"><span className="text-xl">𝕏</span></button>
                                            <button onClick={() => { sfx.play('click'); handleShare(); }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 py-3 rounded-xl shadow-md flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95"><span className="text-xl">📋</span></button>
                                        </div>
                                    </div>

                                {/* C. ROW: JOURNAL & EXIT */}
                                    <div className="flex gap-3 mt-0">
                                        <button onClick={fetchJournal} className={`flex-1 font-bold py-3 rounded-xl transition border-2 flex items-center justify-center text-1xl shadow-sm hover:scale-105 active:scale-95 ${pendingJournalEntries.length > 0 ? 'bg-emerald-100 border-emerald-400 text-emerald-800 animate-wiggle shadow-emerald-200' : 'bg-amber-100 border-amber-200 text-amber-900 hover:bg-amber-200'}`} title="Open Field Journal">📖</button>
                                        <button onClick={() => { sfx.play('click'); handleExitGame(); }} className="flex-1 bg-red-400 hover:bg-red-600 text-slate-600 font-bold py-3 rounded-xl shadow-sm border-2 border-slate-300 flex items-center justify-center text-1xl transition-transform hover:scale-105 active:scale-95" title="Exit to Main Menu">➜]</button>
                                    </div>
                                </div>
                            </div>

                        {/* --- RIGHT: LEADERBOARD CARD --- */}
                            <div className="w-full max-w-sm bg-orange-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-orange-100 overflow-hidden flex flex-col h-[500px] md:h-auto md:max-h-full animate-pop delay-100">
                                <div className="bg-orange-100 p-2 border-b border-orange-200 flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">👑</span>
                                            <h2 className="text-orange-800 font-black tracking-wide text-sm uppercase">Top Explorers</h2>
                                        </div>
                                    </div>

                                {/* ROW 1: TIME MATRIX */}
                                    <div className="flex bg-orange-200/50 p-1 rounded-lg">
                                        {['daily', 'weekly', 'allTime'].map((tab) => (
                                            <button onMouseEnter={() => sfx.play('hover', 0.2)} onClick={() => { sfx.play('click', 0.1); setLeaderboardTab(tab); }} key={tab} className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded-md transition-all ${leaderboardTab === tab ? 'bg-white text-orange-600 shadow-sm scale-105' : 'text-orange-800/60 hover:text-orange-800'}`}>
                                                {tab === 'allTime' ? 'All Time' : tab}
                                            </button>
                                            ))}
                                    </div>

                                {/* ROW 2: TIER MATRIX */}
                                    <div className="flex bg-orange-200/50 p-1 rounded-lg">
                                        {[
                                            { id: 'hobbyist', label: 'Hobbyist (10 games or less)' },
                                            { id: 'explorer', label: 'Explorer (11+)' }
                                        ].map((t) => (
                                            <button onMouseEnter={() => sfx.play('hover', 0.2)} onClick={() => { sfx.play('click', 0.1); setLeaderboardTier(t.id); }} key={t.id} className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded-md transition-all ${leaderboardTier === t.id ? 'bg-white text-emerald-600 shadow-sm scale-105' : 'text-orange-800/60 hover:text-orange-800'}`}>
                                                {t.label}
                                            </button>
                                            ))}
                                    </div>
                                </div>

                            {/* SCROLLABLE LEADERBOARD AREA */}
                                <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
                                    {leaderboardData.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-orange-300 opacity-50"><span className="text-4xl mb-2">⏳</span><span className="font-bold text-sm uppercase">Loading Scores...</span></div>) : (leaderboardData.map((player, index) => (<div onMouseEnter={() => sfx.play('hover', 0.2)} key={player.id} className={`flex items-center justify-between p-3 rounded-xl border-b-4 transition-transform hover:scale-[1.01] ${player.id === user?.uid ? 'bg-white border-emerald-200 shadow-sm ring-2 ring-emerald-400 ring-offset-1' : 'bg-white border-orange-100 shadow-sm'}`}><div className="flex items-center gap-3"><div className={`font-black text-sm w-8 h-8 flex items-center justify-center rounded-lg ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</div><div className="flex flex-col"><span className={`font-bold text-sm leading-tight ${player.id === user?.uid ? 'text-emerald-700' : 'text-slate-700'}`}>{player.username} {player.id === user?.uid && "(You)"}</span><div className="flex items-center gap-3 mt-0.5"><span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{player.gamesPlayed || 0} Expeditions</span><span className="text-[9px] text-emerald-600/80 uppercase font-bold tracking-wider">{player.discoveries || 0} Animals Found</span></div></div></div><div className="bg-orange-100 px-3 py-1 rounded-lg flex items-center gap-1">
                                        <span className="font-mono font-black text-orange-600 text-sm">{player.averageScore.toFixed(1)}</span><span className="text-[9px] opacity-60 font-bold text-orange-800 pt-0.5">AVG</span>
                                    </div></div>)))}
                                </div>
                            </div>

                        </div>
                    </div>
                    )}

        {showJournal && pendingJournalEntries.length > 0 ? (<NewDiscoveryModal pendingAnimals={pendingJournalEntries} onConfirmOne={handleConfirmJournalEntry} onConfirmAll={handleConfirmAllJournal} allAnimalsFlat={ALL_ANIMALS_FLAT} />) : (journalModal)}
            {isTutorialMode && (<div className={`absolute z-[100] max-w-[280px] ${TUTORIAL_DATA[tutorialStep].positionClasses}`}><div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-emerald-500 relative animate-pop"><div className={`absolute w-0 h-0 border-[10px] ${TUTORIAL_DATA[tutorialStep].arrowClasses}`}></div><p className="text-slate-700 font-bold text-sm mb-3 leading-snug">{TUTORIAL_DATA[tutorialStep].text.split("**").map((part, i) => i % 2 === 1 ? <span key={i} className="text-emerald-600 font-black">{part}</span> : part)}</p>{!TUTORIAL_DATA[tutorialStep].hideButton && (<button onMouseEnter={() => sfx.play('hover')} onClick={nextTutorialStep} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider shadow-sm">{TUTORIAL_DATA[tutorialStep].buttonText}</button>)}</div></div>)}
            
                {/* --- WIKIPEDIA "DID YOU KNOW" MODAL --- */}
                {showWikiModal && (
                    <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-amber-50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border-4 border-amber-300 relative animate-pop flex flex-col max-h-[85vh]">
                            
                            {/* Header */}
                            <div className="bg-amber-200/50 p-4 border-b border-amber-300 flex justify-between items-center flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl animate-pulse drop-shadow-sm">💡</span>
                                    <h2 className="font-black text-amber-900 uppercase tracking-widest text-lg">Did You Know?</h2>
                                </div>
                                <button onClick={() => { sfx.play('click'); setShowWikiModal(false); }} className="w-8 h-8 bg-amber-300 hover:bg-amber-400 rounded-full text-amber-900 font-bold flex items-center justify-center transition-colors shadow-sm">✕</button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 overflow-y-auto custom-scroll text-slate-700 leading-relaxed text-sm">
                                <div className="mb-5 border-b border-amber-200/50 pb-3">
                                    <h3 className="text-2xl font-black text-amber-800 mb-1 leading-none">{animalData.correctName}</h3>
                                    <p className="text-sm italic text-amber-700 opacity-80 font-serif">{animalData.sciName}</p>
                                </div>
                                
                                {/* WIKIPEDIA HTML INJECTION */}
                                <div 
                                    className="space-y-4" 
                                    dangerouslySetInnerHTML={{ __html: animalData.wikiSummary }} 
                                />
                                
                                {/* Footer Link */}
                                <div className="mt-6 pt-4 border-t border-amber-200/50 text-right">
                                    <a 
                                        href={`https://en.wikipedia.org/wiki/${animalData.correctName.replace(/\s+/g, '_')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs font-bold uppercase tracking-wider text-amber-600 hover:text-amber-800 flex items-center justify-end gap-1 transition-colors"
                                    >
                                        Read full article on Wikipedia <span>↗</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            );
    };
    export default WildGuessGame;
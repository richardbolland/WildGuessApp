// src/sounds.js

// CONFIGURATION: URL and Volume (0.0 to 1.0) for each sound
const SFX_CONFIG = {
    win1: { 
        url: 'https://assets.mixkit.co/active_storage/sfx/103/103-preview.mp3', 
        volume: 0.4 
    },
    win2: { 
        url: 'https://assets.mixkit.co/active_storage/sfx/2066/2066-preview.mp3', 
        volume: 0.4 
    },
    win3: { 
        url: 'https://assets.mixkit.co/active_storage/sfx/2063/2063-preview.mp3', 
        volume: 0.4 
    },
    unlock: 

    { url: 'https://assets.mixkit.co/active_storage/sfx/1104/1104-preview.mp3', volume: 0.4 },


    error: [
        { url: 'https://assets.mixkit.co/active_storage/sfx/216/216-preview.mp3', volume: 0.025 },
        { url: 'https://assets.mixkit.co/active_storage/sfx/216/216-preview.mp3', volume: 0.05 },
        { url: 'https://assets.mixkit.co/active_storage/sfx/216/216-preview.mp3', volume: 0.075 },
            ],

    click: { 
        url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3', 
        volume: 0.5 
    },
    countdown: { url: 'https://assets.mixkit.co/active_storage/sfx/112/112-preview.mp3', volume: 0.075 },

    start: { url: 'https://assets.mixkit.co/active_storage/sfx/75/75-preview.mp3', volume: 0.4 },
    
    // --- HOVER ARRAY (Cycling) ---
    // Add as many variations as you like here. The system will loop through them 1 -> 2 -> 3 -> 1...
    hover: [
        { url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3', volume: 0.4 },
        { url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3', volume: 0.3 }, // Placeholder variation
        { url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3', volume: 0.2 }, // Repeat or new file
    ], 
};

class SoundManager {
    constructor() {
        this.sounds = {};
        this.indices = {}; // Tracks the current position for array sounds
        this.muted = false;

        Object.keys(SFX_CONFIG).forEach(key => {
            const config = SFX_CONFIG[key];

            // Helper to create an Audio object with pitch settings
            const createAudio = (cfg) => {
                const audio = new Audio(cfg.url);
                audio.volume = cfg.volume;
                // Allow pitch shifting
                if (audio.preservesPitch !== undefined) audio.preservesPitch = false;
                if (audio.mozPreservesPitch !== undefined) audio.mozPreservesPitch = false;
                if (audio.webkitPreservesPitch !== undefined) audio.webkitPreservesPitch = false;
                return audio;
            };

            // Handle Arrays (Hover) vs Single Objects (Click)
            if (Array.isArray(config)) {
                this.sounds[key] = config.map(c => createAudio(c));
                this.indices[key] = 0; // Start at index 0
            } else {
                this.sounds[key] = createAudio(config);
            }
        });
    }

    /**
     * Plays a sound.
     * @param {string} key - The sound key (e.g., 'hover')
     * @param {number} variance - (Optional) Pitch wobble amount (0.0 - 0.5)
     */
    play(key, variance = 0) {
        if (!this.sounds[key]) {
            console.error(`❌ Sound not found: ${key}`);
            return;
        }
        if (this.muted) return;

        try {
            let sound;

            // CYCLE LOGIC: If it's an array, pick the next one and increment
            if (Array.isArray(this.sounds[key])) {
                const index = this.indices[key] % this.sounds[key].length;
                sound = this.sounds[key][index];
                this.indices[key]++; // Move to next sound for next time
            } else {
                sound = this.sounds[key];
            }

            sound.currentTime = 0;

            // PITCH SHIFT LOGIC
            if (variance > 0) {
                const randomRate = 1.0 + (Math.random() * variance * 2 - variance);
                sound.playbackRate = randomRate;
            } else {
                sound.playbackRate = 1.0;
            }

            sound.play().catch(e => {
                if (e.name !== 'NotAllowedError') console.warn(`⚠️ Audio Error '${key}':`, e);
            });
        } catch (e) {
            console.error("Sound Error:", e);
        }
    }

    playWin() {
        if (this.muted) return;
        const variant = Math.floor(Math.random() * 3) + 1; 
        this.play(`win${variant}`);
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

export const sfx = new SoundManager();
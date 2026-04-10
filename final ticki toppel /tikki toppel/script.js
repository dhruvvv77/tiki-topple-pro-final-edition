// ====================================================
// Tiki Topple — Totem Pole Edition
// NPC Board2Code Hackathon 2026
// ====================================================

const TIKI_DATA = [
    { id: 'volca', name: 'Volca', class: 'tiki-volca', emoji: '🌋' },
    { id: 'aqua', name: 'Aqua', class: 'tiki-aqua', emoji: '💧' },
    { id: 'flora', name: 'Flora', class: 'tiki-flora', emoji: '🌿' },
    { id: 'sol', name: 'Sol', class: 'tiki-sol', emoji: '☀️' },
    { id: 'void', name: 'Void', class: 'tiki-void', emoji: '🔮' },
    { id: 'coral', name: 'Coral', class: 'tiki-coral', emoji: '🪸' },
    { id: 'lagoon', name: 'Lagoon', class: 'tiki-lagoon', emoji: '🌊' },
    { id: 'terra', name: 'Terra', class: 'tiki-terra', emoji: '⛰️' },
    { id: 'lumina', name: 'Lumina', class: 'tiki-lumina', emoji: '✨' },
];

const TIKI_COUNT = TIKI_DATA.length;
const MAX_TURNS = 7;   // 7 full rounds
const RANK_POINTS = [9, 7, 5, 0, 0, 0, 0, 0, 0];

const PLAYER_COLORS = [
    'linear-gradient(135deg,#00F0FF,#0077FF)',
    'linear-gradient(135deg,#FF007B,#FF4500)',
    'linear-gradient(135deg,#00FF9D,#0FAF70)',
    'linear-gradient(135deg,#FFD700,#FF8C00)',
];

// ====================================================
// Game State
// ====================================================
let players = [];
let numPlayers = 2;
let currentPlayerIndex = 0;
let turnNumber = 1;       // Counts rounds (increments when all players have gone)
let totalTurnsTaken = 0;  // Total individual turns taken
let actionDone = false;
let isFirstAction = true;

// totemStack: index 0 = TOP, last = BOTTOM
let totemStack = [];
let eliminatedTikis = [];

// Selection mode
let selectionMode = null;
let selectionMoveCount = 0;

// ====================================================
// DOM References
// ====================================================
const homeScreen = document.getElementById('home-screen');
const setupScreen = document.getElementById('setup-screen');
const appEl = document.getElementById('app');
const totemPoleEl = document.getElementById('totem-pole');
const rankLabelsEl = document.getElementById('rank-labels');
const playerNameEl = document.getElementById('current-player-name');
const playerAvatarEl = document.getElementById('player-avatar');
const turnNumEl = document.getElementById('turn-number');
const turnMaxEl = document.getElementById('turn-max');
const turnProgressEl = document.getElementById('turn-progress-fill');
const missionEl = document.getElementById('secret-card');
const scoreListEl = document.getElementById('scoreboard-list');
const actionInstr = document.getElementById('action-instruction');
const btnEndTurn = document.getElementById('end-turn-btn');
const passModal = document.getElementById('pass-modal');
const passMsg = document.getElementById('pass-message');
const btnReady = document.getElementById('ready-btn');
const endModal = document.getElementById('game-over-modal');
const btnRestart = document.getElementById('restart-btn');
const actionLogEl = document.getElementById('action-log');
const cancelSelBtn = document.getElementById('cancel-selection-btn');

// ====================================================
// ============ HOME SCREEN SYSTEMS ====================
// ====================================================

// ---- Parallax on Mouse Move ----
(function initParallax() {
    const scene = document.getElementById('parallax-scene');
    if (!scene) return;
    const layers = scene.querySelectorAll('.parallax-layer[data-depth]');

    document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;

        layers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth) || 0;
            const moveX = cx * depth * 30;
            const moveY = cy * depth * 15;
            layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
})();

// ---- Animated River ----
(function initRiver() {
    const canvas = document.getElementById('river-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, time = 0;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = canvas.offsetHeight || window.innerHeight * 0.18;
    }

    function draw() {
        time += 0.02;
        ctx.clearRect(0, 0, W, H);

        // River base gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, 'rgba(15,80,100,0.0)');
        grad.addColorStop(0.15, 'rgba(15,80,100,0.5)');
        grad.addColorStop(0.4, 'rgba(10,60,80,0.7)');
        grad.addColorStop(0.7, 'rgba(8,50,65,0.85)');
        grad.addColorStop(1, 'rgba(5,35,50,0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Wave layers
        for (let layer = 0; layer < 4; layer++) {
            const alpha = 0.04 + layer * 0.02;
            const freq = 0.008 + layer * 0.004;
            const amp = 4 + layer * 3;
            const speed = 0.8 + layer * 0.3;
            const yOff = H * (0.15 + layer * 0.18);

            ctx.beginPath();
            ctx.moveTo(0, yOff);
            for (let x = 0; x <= W; x += 3) {
                const y = yOff +
                    Math.sin(x * freq + time * speed) * amp +
                    Math.sin(x * freq * 2.3 + time * speed * 0.7) * (amp * 0.4);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(W, H);
            ctx.lineTo(0, H);
            ctx.closePath();
            ctx.fillStyle = `rgba(80,200,220,${alpha})`;
            ctx.fill();
        }

        // Sparkles on water surface
        for (let i = 0; i < 20; i++) {
            const sx = (i * 173.5 + time * 40) % (W + 100) - 50;
            const baseY = H * 0.2 + Math.sin(sx * 0.01 + time) * 8;
            const sparkle = Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255,255,255,${sparkle * 0.3})`;
            ctx.beginPath();
            ctx.arc(sx, baseY, 1.5 + sparkle, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flowing horizontal streaks
        ctx.strokeStyle = 'rgba(120,220,240,0.07)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const sy = H * 0.25 + i * (H * 0.08);
            ctx.beginPath();
            for (let x = 0; x <= W; x += 6) {
                const y = sy + Math.sin(x * 0.02 + time * 1.5 + i) * 2;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
})();

// ---- Floating Particles (Fireflies + Pollen) ----
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initParticleList();
    }

    function initParticleList() {
        particles = [];
        const count = Math.floor(W * H / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 1 + Math.random() * 3,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.3 - 0.1,
                phase: Math.random() * Math.PI * 2,
                speed: 1 + Math.random() * 2,
                type: Math.random() > 0.4 ? 'firefly' : 'pollen',
                hue: Math.random() > 0.3 ? 55 : 120,
            });
        }
    }

    let time = 0;
    function draw() {
        time += 0.016;
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            p.x += p.dx + Math.sin(time * p.speed + p.phase) * 0.3;
            p.y += p.dy + Math.cos(time * p.speed * 0.7 + p.phase) * 0.15;

            // Wrap around
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            if (p.y > H + 10) p.y = -10;

            if (p.type === 'firefly') {
                const brightness = 0.3 + Math.sin(time * p.speed * 2 + p.phase) * 0.5;
                // Glow
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                glow.addColorStop(0, `hsla(${p.hue},100%,75%,${Math.max(0, brightness) * 0.2})`);
                glow.addColorStop(1, `hsla(${p.hue},100%,75%,0)`);
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
                ctx.fill();
                // Core
                ctx.fillStyle = `hsla(${p.hue},100%,80%,${Math.max(0, brightness)})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Pollen — small white dots
                const alpha = 0.15 + Math.sin(time + p.phase) * 0.1;
                ctx.fillStyle = `rgba(255,255,240,${Math.max(0, alpha)})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
})();

// ====================================================
// AUDIO SYSTEM — Procedural Jungle Sounds
// ====================================================
const AudioSystem = {
    ctx: null,
    isPlaying: false,
    nodes: [],
    masterGain: null,

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    },

    toggle() {
        if (!this.ctx) this.init();
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
        return this.isPlaying;
    },

    play() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;
        this.startJungleAmbience();
        this.startBirdCalls();
        this.startInsects();
        this.startWaterSound();
    },

    stop() {
        this.isPlaying = false;
        this.nodes.forEach(n => {
            try { n.stop(); } catch(e) {}
            try { n.disconnect(); } catch(e) {}
        });
        this.nodes = [];
    },

    // Wind / ambient hiss
    startJungleAmbience() {
        const bufSize = this.ctx.sampleRate * 4;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.08;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
        this.nodes.push(noise);

        // Modulate the filter for wind gusts
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.15;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this.nodes.push(lfo);
    },

    // Bird chirps
    startBirdCalls() {
        const scheduleBird = () => {
            if (!this.isPlaying) return;
            const delay = 2000 + Math.random() * 5000;
            setTimeout(() => {
                if (!this.isPlaying) return;
                this.playBirdChirp();
                scheduleBird();
            }, delay);
        };
        scheduleBird();
    },

    playBirdChirp() {
        if (!this.ctx || !this.isPlaying) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const baseFreq = 1800 + Math.random() * 2000;
        osc.frequency.setValueAtTime(baseFreq, now);

        // Bird-like frequency sweep
        const chirpCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < chirpCount; i++) {
            const t = now + i * 0.12;
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.04);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, t + 0.08);
        }

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
        gain.gain.linearRampToValueAtTime(0, now + chirpCount * 0.12 + 0.05);

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;

        osc.connect(gain);
        gain.connect(pan);
        pan.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + chirpCount * 0.12 + 0.1);
    },

    // Insect buzz/cricket sounds
    startInsects() {
        const scheduleInsect = () => {
            if (!this.isPlaying) return;
            const delay = 1000 + Math.random() * 3000;
            setTimeout(() => {
                if (!this.isPlaying) return;
                this.playInsect();
                scheduleInsect();
            }, delay);
        };
        scheduleInsect();
    },

    playInsect() {
        if (!this.ctx || !this.isPlaying) return;
        const now = this.ctx.currentTime;
        const duration = 0.5 + Math.random() * 1.5;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 3500 + Math.random() * 2000;

        // AM modulation for cricket-like sound
        const modOsc = this.ctx.createOscillator();
        modOsc.frequency.value = 20 + Math.random() * 40;
        const modGain = this.ctx.createGain();
        modGain.gain.value = 0.03;

        const mainGain = this.ctx.createGain();
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.02, now + 0.05);
        mainGain.gain.setValueAtTime(0.02, now + duration - 0.1);
        mainGain.gain.linearRampToValueAtTime(0, now + duration);

        modOsc.connect(modGain);
        modGain.connect(mainGain.gain);
        osc.connect(mainGain);
        mainGain.connect(this.masterGain);

        osc.start(now);
        modOsc.start(now);
        osc.stop(now + duration + 0.1);
        modOsc.stop(now + duration + 0.1);
    },

    // Running water sound
    startWaterSound() {
        const bufSize = this.ctx.sampleRate * 4;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 600;
        bp.Q.value = 0.8;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.04;

        // Subtle modulation for water bubble effect
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.3;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 150;
        lfo.connect(lfoGain);
        lfoGain.connect(bp.frequency);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
        lfo.start();
        this.nodes.push(noise, lfo);
    },

    // One-shot parrot squawk
    playParrotSquawk() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;

        for (let i = 0; i < 2; i++) {
            const t = now + i * 0.15;
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            const freq = 800 + Math.random() * 400;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.8, t + 0.05);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.12);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 2;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.15);
        }
    },

    // Drum hit for button interactions
    playDrumHit() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);

        // Add noise burst
        const bufSize = this.ctx.sampleRate * 0.1;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.1, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 500;
        noise.connect(hp);
        hp.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.1);
    }
};

// ---- Audio Toggle Button ----
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');
if (audioToggle) {
    audioToggle.addEventListener('click', () => {
        const playing = AudioSystem.toggle();
        audioToggle.classList.toggle('active', playing);
        audioIcon.textContent = playing ? '🔊' : '🔇';
    });
}

// ---- Parrot Click ----
const parrotEl = document.getElementById('parrot');
if (parrotEl) {
    parrotEl.addEventListener('click', () => {
        AudioSystem.playParrotSquawk();
        parrotEl.style.transform = 'scale(1.2) rotate(-10deg)';
        setTimeout(() => {
            parrotEl.style.transform = '';
        }, 400);
    });
}

// ====================================================
// HOME SCREEN NAVIGATION
// ====================================================
const playBtn = document.getElementById('play-btn');
const howtoBtn = document.getElementById('howto-btn');
const howtoModal = document.getElementById('howto-modal');
const howtoClose = document.getElementById('howto-close');
const howtoGotIt = document.getElementById('howto-got-it');

if (playBtn) {
    playBtn.addEventListener('click', () => {
        AudioSystem.playDrumHit();
        // Fade out home screen, show setup
        homeScreen.style.opacity = '0';
        homeScreen.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
            homeScreen.style.display = 'none';
            setupScreen.classList.remove('hidden');
        }, 600);
    });
}

if (howtoBtn) {
    howtoBtn.addEventListener('click', () => {
        AudioSystem.playDrumHit();
        howtoModal.classList.remove('hidden');
    });
}

if (howtoClose) {
    howtoClose.addEventListener('click', () => howtoModal.classList.add('hidden'));
}
if (howtoGotIt) {
    howtoGotIt.addEventListener('click', () => howtoModal.classList.add('hidden'));
}

// Close how-to on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (howtoModal && !howtoModal.classList.contains('hidden')) {
            howtoModal.classList.add('hidden');
        }
        // Also cancel selection mode if in game
        if (selectionMode) {
            cancelSelection();
            resetActionButtons();
        }
    }
});

// ====================================================
// Setup Screen
// ====================================================
let selectedCount = 2;

document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCount = parseInt(btn.dataset.count);
        renderPlayerNameInputs(selectedCount);
    });
});

function renderPlayerNameInputs(count) {
    const container = document.getElementById('player-name-inputs');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1}`;
        input.id = `pname-${i}`;
        input.value = `Player ${i + 1}`;
        container.appendChild(input);
    }
}
renderPlayerNameInputs(2);

document.getElementById('start-game-btn').addEventListener('click', () => {
    AudioSystem.playDrumHit();
    numPlayers = selectedCount;
    const names = [];
    for (let i = 0; i < numPlayers; i++) {
        const inp = document.getElementById(`pname-${i}`);
        names.push(inp.value.trim() || `Player ${i + 1}`);
    }
    setupScreen.classList.add('hidden');
    appEl.classList.remove('hidden');
    initGame(names);
});

// ====================================================
// Game Initialization
// ====================================================
function initGame(names) {
    totemStack = TIKI_DATA.map(t => ({ ...t }));
    shuffleArray(totemStack);
    eliminatedTikis = [];

    const shuffledIds = totemStack.map(t => t.id);
    shuffleArray(shuffledIds);

    players = [];
    const tokensPerPlayer = Math.floor(TIKI_COUNT / numPlayers);
    let idx = 0;
    for (let i = 0; i < numPlayers; i++) {
        const owned = [];
        for (let j = 0; j < tokensPerPlayer; j++) owned.push(shuffledIds[idx++]);
        players.push({ id: i, name: names[i], score: 0, ownedTokens: owned });
    }

    currentPlayerIndex = 0;
    turnNumber = 1;
    totalTurnsTaken = 0;
    actionDone = false;
    isFirstAction = true;
    selectionMode = null;
    turnMaxEl.textContent = MAX_TURNS;
    actionLogEl.innerHTML = '';

    renderTotem();
    updateUIForCurrentPlayer();
    renderScores();
    addLogEntry('system', '🎮 Game started! Good luck!');
    showPassModal(players[0].name, true);
}

// ====================================================
// Score Calculation (single source of truth)
// ====================================================
function calculateScores() {
    players.forEach(p => {
        let s = 0;
        p.ownedTokens.forEach(id => {
            const ri = totemStack.findIndex(t => t.id === id);
            if (ri !== -1 && ri < RANK_POINTS.length) s += RANK_POINTS[ri];
        });
        p.score = s;
    });
}

// ====================================================
// Totem Pole Rendering
// ====================================================
function renderTotem() {
    totemPoleEl.innerHTML = '';
    rankLabelsEl.innerHTML = '';

    totemStack.forEach((token, i) => {
        // Rank label
        const rankDiv = document.createElement('div');
        rankDiv.className = 'rank-label';
        if (i === 0) rankDiv.classList.add('rank-gold');
        else if (i === 1) rankDiv.classList.add('rank-silver');
        else if (i === 2) rankDiv.classList.add('rank-bronze');
        rankDiv.innerHTML = `<span class="rank-num">${i + 1}</span>`;
        rankLabelsEl.appendChild(rankDiv);

        // Token element
        const el = createTokenElement(token);
        if (totemStack.length === 1) el.classList.add('totem-solo');
        else if (i === 0) el.classList.add('totem-top');
        else if (i === totemStack.length - 1) el.classList.add('totem-bottom');

        // Make clickable when in selection mode
        el.addEventListener('click', () => onTotemTokenClick(token.id, i));
        totemPoleEl.appendChild(el);
    });

    updateTotemInteractivity();
}

function createTokenElement(token) {
    const el = document.createElement('div');
    el.className = `tiki-token ${token.class}`;
    el.id = `token-${token.id}`;
    el.dataset.tokenId = token.id;
    el.title = token.name;
    el.innerHTML = `
        <div class="t-brow"><div class="t-brow-l"></div><div class="t-brow-r"></div></div>
        <div class="t-eyes"><div class="t-eye"></div><div class="t-eye"></div></div>
        <div class="t-mouth"></div>
        <div class="t-name">${token.emoji} ${token.name}</div>
    `;
    return el;
}

// Add/remove pointer + glow on totem tokens depending on selection mode
function updateTotemInteractivity() {
    document.querySelectorAll('#totem-pole .tiki-token').forEach(el => {
        el.classList.remove('selectable');
    });
    if (selectionMode) {
        document.querySelectorAll('#totem-pole .tiki-token').forEach(el => {
            el.classList.add('selectable');
        });
    }
}

// Called when a tiki in the totem is clicked
function onTotemTokenClick(tokenId, index) {
    if (!selectionMode) return;

    if (selectionMode === 'tikiup') {
        performTikiUp(tokenId, selectionMoveCount);
    } else if (selectionMode === 'topple') {
        performTopple(tokenId);
    }
}

function highlightAccessibleTokens() {
    document.querySelectorAll('.tiki-token').forEach(el => el.classList.remove('highlight-top'));
    if (actionDone) return;
    if (selectionMode) return;
    const count = Math.min(3, totemStack.length);
    for (let i = 0; i < count; i++) {
        const el = document.getElementById(`token-${totemStack[i].id}`);
        if (el) el.classList.add('highlight-top');
    }
}

// ====================================================
// Player UI
// ====================================================
function updateUIForCurrentPlayer() {
    const p = players[currentPlayerIndex];
    playerNameEl.textContent = p.name;
    playerAvatarEl.textContent = p.name.charAt(0).toUpperCase();
    playerAvatarEl.style.background = PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length];
    turnNumEl.textContent = turnNumber;
    const totalMaxTurns = MAX_TURNS * numPlayers;
    const progress = (totalTurnsTaken / totalMaxTurns) * 100;
    if (turnProgressEl) turnProgressEl.style.width = `${Math.min(progress, 100)}%`;

    actionDone = false;
    selectionMode = null;
    btnEndTurn.disabled = true;
    btnEndTurn.textContent = 'Confirm Move';
    actionInstr.textContent = 'Choose one action per turn.';

    // Hide cancel button
    if (cancelSelBtn) cancelSelBtn.classList.add('hidden');

    document.querySelectorAll('.action-btn').forEach(b => {
        b.classList.remove('selected');
        b.disabled = false;
    });
    updateActionAvailability();
    renderMission(p);
    highlightAccessibleTokens();
    updateTotemInteractivity();
}

function updateActionAvailability() {
    const toastBtn = document.getElementById('act-toast');
    if (toastBtn) {
        if (isFirstAction) {
            toastBtn.disabled = true;
            toastBtn.title = 'Cannot be the first action of the game';
        } else if (totemStack.length <= 3) {
            toastBtn.disabled = true;
            toastBtn.title = 'Only 3 tikis remain';
        } else {
            toastBtn.title = 'Eliminate the bottom tiki';
        }
    }
    if (totemStack.length <= 1) {
        document.querySelectorAll('.move-btn').forEach(b => b.disabled = true);
    }
}

function renderMission(player) {
    missionEl.innerHTML = '';
    player.ownedTokens.forEach((tokenId, i) => {
        const t = TIKI_DATA.find(d => d.id === tokenId);
        const rank = totemStack.findIndex(s => s.id === tokenId);
        const isEliminated = rank === -1;
        const div = document.createElement('div');
        div.className = `mission-slot rank-${i + 1}`;
        if (isEliminated) {
            div.innerHTML = `<span style="opacity:0.4;text-decoration:line-through">${t.emoji} ${t.name}</span><span class="mission-badge" style="background:rgba(255,51,102,0.2);color:#FF3366;border-color:rgba(255,51,102,0.3)">Eliminated</span>`;
        } else {
            div.innerHTML = `<span>${t.emoji} ${t.name}</span><span class="mission-badge">Rank #${rank + 1}</span>`;
        }
        missionEl.appendChild(div);
    });
}

function renderScores() {
    calculateScores();

    scoreListEl.innerHTML = '';
    const sorted = [...players].sort((a, b) => b.score - a.score);
    sorted.forEach((p, i) => {
        const li = document.createElement('li');
        if (i === 0 && p.score > 0) li.classList.add('leader');
        li.innerHTML = `
            <span class="score-name">${i === 0 ? '👑 ' : ''}${p.name}</span>
            <span class="score-value">${p.score}</span>
        `;
        scoreListEl.appendChild(li);
    });
}

// ====================================================
// Action Log
// ====================================================
function addLogEntry(type, message) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    actionLogEl.prepend(entry);
    while (actionLogEl.children.length > 20) actionLogEl.removeChild(actionLogEl.lastChild);
}

// ====================================================
// Action Handling
// ====================================================
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (actionDone) return;
        const action = btn.dataset.action;

        // Cancel any previous selection mode
        cancelSelection();

        document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (action === 'tikiup') {
            const count = parseInt(btn.dataset.count);
            enterSelectionMode('tikiup', count);
        } else if (action === 'topple') {
            enterSelectionMode('topple', 0);
        } else if (action === 'toast') {
            performTikiToast();
        }
    });
});

// Enter selection mode — user must click a tiki on the totem
function enterSelectionMode(mode, count) {
    selectionMode = mode;
    selectionMoveCount = count;

    if (mode === 'tikiup') {
        actionInstr.textContent = `⬆️ Click a tiki on the totem to move it UP ${count} position${count > 1 ? 's' : ''}`;
    } else if (mode === 'topple') {
        actionInstr.textContent = `⬇️ Click a tiki on the totem to send it to the BOTTOM`;
    }

    // Show cancel button
    if (cancelSelBtn) cancelSelBtn.classList.remove('hidden');

    // Disable action buttons while selecting
    document.querySelectorAll('.action-btn').forEach(b => (b.disabled = true));
    // Make totem tokens clickable
    updateTotemInteractivity();
    highlightAccessibleTokens();
}

function cancelSelection() {
    selectionMode = null;
    if (cancelSelBtn) cancelSelBtn.classList.add('hidden');
    updateTotemInteractivity();
}

// Cancel button event
if (cancelSelBtn) {
    cancelSelBtn.addEventListener('click', () => {
        cancelSelection();
        resetActionButtons();
    });
}

// ====================================================
// TIKI UP — Pick any tiki, move it UP by N spots
// ====================================================
function performTikiUp(tokenId, count) {
    const currentIndex = totemStack.findIndex(t => t.id === tokenId);
    if (currentIndex === -1) return;

    if (currentIndex === 0) {
        showToast('That tiki is already at the top!');
        cancelSelection();
        resetActionButtons();
        return;
    }

    const newIndex = Math.max(0, currentIndex - count);
    const token = totemStack.splice(currentIndex, 1)[0];
    totemStack.splice(newIndex, 0, token);

    const moved = currentIndex - newIndex;
    finishAction(`${token.emoji} ${token.name} moved up ${moved} spot${moved > 1 ? 's' : ''}! ⬆️`);
    addLogEntry('move', `${players[currentPlayerIndex].name}: ${token.emoji} ${token.name} up ${moved}`);
    showToast(`${token.name} moved up ${moved}!`, 'info');

    const el = document.getElementById(`token-${token.id}`);
    if (el) { el.classList.remove('just-moved'); void el.offsetWidth; el.classList.add('just-moved'); }
}

// ====================================================
// TIKI TOPPLE — Pick any tiki, send it to BOTTOM
// ====================================================
function performTopple(tokenId) {
    const currentIndex = totemStack.findIndex(t => t.id === tokenId);
    if (currentIndex === -1) return;

    if (currentIndex === totemStack.length - 1) {
        showToast('That tiki is already at the bottom!');
        cancelSelection();
        resetActionButtons();
        return;
    }

    const token = totemStack.splice(currentIndex, 1)[0];
    totemStack.push(token);

    finishAction(`${token.emoji} ${token.name} toppled to the bottom! ⬇️`);
    addLogEntry('move', `${players[currentPlayerIndex].name}: Toppled ${token.emoji} ${token.name}`);
    showToast(`${token.name} sent to bottom!`, 'info');

    const el = document.getElementById(`token-${token.id}`);
    if (el) { el.classList.remove('just-moved'); void el.offsetWidth; el.classList.add('just-moved'); }
}

// ====================================================
// TIKI TOAST — Eliminate the BOTTOM tiki
// ====================================================
function performTikiToast() {
    if (totemStack.length <= 3) {
        showToast('Only 3 tikis remain — cannot eliminate more!');
        resetActionButtons();
        return;
    }

    const bottomTiki = totemStack.pop();
    eliminatedTikis.push(bottomTiki);

    finishAction(`🔥 ${bottomTiki.emoji} ${bottomTiki.name} has been toasted! Eliminated!`);
    addLogEntry('move', `${players[currentPlayerIndex].name}: 🔥 Toasted ${bottomTiki.emoji} ${bottomTiki.name}`);
    showToast(`🔥 ${bottomTiki.name} eliminated!`, 'info');
}

// ====================================================
// Finish action + reset helpers
// ====================================================
function finishAction(message) {
    selectionMode = null;
    actionDone = true;
    isFirstAction = false;
    actionInstr.textContent = message;
    btnEndTurn.disabled = false;
    btnEndTurn.textContent = '✅ End Turn';
    if (cancelSelBtn) cancelSelBtn.classList.add('hidden');
    document.querySelectorAll('.action-btn').forEach(b => (b.disabled = true));
    renderTotem();
    renderScores();
}

function resetActionButtons() {
    document.querySelectorAll('.action-btn').forEach(b => {
        b.disabled = false;
        b.classList.remove('selected');
    });
    actionInstr.textContent = 'Choose one action per turn.';
    updateActionAvailability();
    highlightAccessibleTokens();
}

// ====================================================
// Turn Management
// ====================================================
btnEndTurn.addEventListener('click', () => {
    if (!actionDone) return;

    totalTurnsTaken++;

    // Check game end conditions
    if (totemStack.length <= 3 || turnNumber > MAX_TURNS) {
        endGame();
        return;
    }

    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    if (currentPlayerIndex === 0) turnNumber++;

    // Check again after incrementing (edge case: turn just exceeded)
    if (turnNumber > MAX_TURNS) {
        endGame();
        return;
    }

    updateUIForCurrentPlayer();
    renderScores();
    showPassModal(players[currentPlayerIndex].name, false);
});

function showPassModal(name, isFirst) {
    passMsg.textContent = isFirst
        ? `Welcome! Pass the device to ${name} to start. 🎮`
        : `Pass the device to ${name}.`;
    passModal.classList.remove('hidden');
}

btnReady.addEventListener('click', () => {
    passModal.classList.add('hidden');
    // Re-render after modal closes so tokens are fresh
    renderMission(players[currentPlayerIndex]);
});

btnRestart.addEventListener('click', () => {
    endModal.classList.add('hidden');
    // Show home screen again
    homeScreen.style.display = '';
    homeScreen.style.opacity = '1';
    appEl.classList.add('hidden');
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`[data-count="2"]`).classList.add('selected');
    selectedCount = 2;
    renderPlayerNameInputs(2);
});

// ====================================================
// Scoring & Game End
// ====================================================
function endGame() {
    calculateScores();
    renderScores();

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let html = `<div style="text-align:left;">`;

    html += `<div class="stats-section-title">🏅 Final Totem Order</div><div style="margin-bottom:12px;">`;
    totemStack.forEach((t, i) => {
        const tData = TIKI_DATA.find(d => d.id === t.id);
        const owner = players.find(p => p.ownedTokens.includes(t.id));
        const ownerName = owner ? owner.name : 'Neutral';
        const color = i === 0 ? 'var(--gold)' : i === 1 ? 'var(--silver)' : i === 2 ? 'var(--bronze)' : 'var(--text-secondary)';
        html += `<div class="rank-row">
            <span style="font-weight:900;color:${color};min-width:28px;">#${i + 1}</span>
            <span>${tData.emoji} ${tData.name}</span>
            <span class="rank-pts">${RANK_POINTS[i] || 0} pts</span>
            <span class="rank-owner">${ownerName}</span>
        </div>`;
    });
    html += `</div>`;

    if (eliminatedTikis.length > 0) {
        html += `<div class="stats-section-title">🔥 Eliminated Tikis</div><div style="margin-bottom:12px;">`;
        eliminatedTikis.forEach(t => {
            const tData = TIKI_DATA.find(d => d.id === t.id);
            const owner = players.find(p => p.ownedTokens.includes(t.id));
            const ownerName = owner ? owner.name : 'Neutral';
            html += `<div class="rank-row" style="opacity:0.5;">
                <span style="font-weight:900;color:var(--danger);min-width:28px;">✖</span>
                <span>${tData.emoji} ${tData.name}</span>
                <span class="rank-pts">0 pts</span>
                <span class="rank-owner">${ownerName}</span>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div class="stats-section-title">🏆 Player Scores</div>`;
    sortedPlayers.forEach((p, i) => {
        html += `<div class="score-row ${i === 0 ? 'winner' : ''}">
            <span class="score-row-name">${i === 0 ? '👑 ' : ''}${p.name}</span>
            <span class="score-row-pts">${p.score} pts</span>
        </div>`;
    });
    html += `<p style="text-align:center;margin-top:14px;color:var(--text-muted);font-size:0.75rem;">Game ended after ${turnNumber} round(s), ${totalTurnsTaken} turn(s) · ${eliminatedTikis.length} tiki(s) toasted</p></div>`;

    document.getElementById('final-stats').innerHTML = html;
    endModal.classList.remove('hidden');
    addLogEntry('system', `🏆 Game over! ${eliminatedTikis.length} tikis toasted.`);
    setTimeout(() => launchConfetti(), 300);
}

// ====================================================
// Confetti
// ====================================================
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ['#00F0FF', '#FF007B', '#FFD700', '#00FF9D', '#7C3AED', '#FF6B00'];
    const pieces = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 4, angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2, drift: (Math.random() - 0.5) * 1.5, opacity: 1,
    }));
    let frame = 0;
    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); frame++;
        pieces.forEach(p => {
            p.y += p.speed; p.x += p.drift; p.angle += p.spin;
            if (frame > 120) p.opacity = Math.max(0, p.opacity - 0.012);
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
            ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
        });
        if (pieces.some(p => p.opacity > 0)) requestAnimationFrame(drawConfetti);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drawConfetti();
}

// ====================================================
// Utilities
// ====================================================
function showToast(msg, type = 'error') {
    const div = document.createElement('div');
    div.className = `toast-msg${type === 'info' ? ' info' : ''}`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2800);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

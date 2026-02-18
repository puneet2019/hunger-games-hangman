// ============================================
// THE HUNGER GAMES - HANGMAN
// ============================================

const WORDS = [
    { word: "KATNISS", hint: "The Girl on Fire" },
    { word: "PEETA", hint: "The Boy with the Bread" },
    { word: "MOCKINGJAY", hint: "A rebel bird-symbol" },
    { word: "PANEM", hint: "A nation from the ashes of North America" },
    { word: "NIGHTLOCK", hint: "Deadly poisonous berries" },
    { word: "CORNUCOPIA", hint: "Golden horn at the arena's center" },
    { word: "HAYMITCH", hint: "District 12's drunken mentor" },
    { word: "PRIMROSE", hint: "Little sister, big reason to fight" },
    { word: "CAPITOL", hint: "The opulent ruling city" },
    { word: "FINNICK", hint: "Trident-wielding District 4 victor" },
    { word: "TRIBUTE", hint: "Chosen to fight in the games" },
    { word: "EFFIE", hint: "May the odds be ever in your favor" },
    { word: "CINNA", hint: "A stylist with a rebel heart" },
    { word: "GAMEMAKER", hint: "Controls the arena's fate" },
    { word: "REAPING", hint: "The day names are drawn" },
];

const MAX_WRONG = 6;

// ---- State ----

let currentWord = null;
let guessedLetters = new Set();
let wrongGuesses = 0;
let gameOver = false;

// ---- DOM ----

const $ = (id) => document.getElementById(id);
const canvas = $("hangman-canvas");
const ctx = canvas.getContext("2d");

// ---- Initialize ----

function init() {
    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessedLetters = new Set();
    wrongGuesses = 0;
    gameOver = false;

    $("result-screen").classList.add("hidden");
    $("lose-screen").classList.add("hidden");
    $("win-screen").classList.add("hidden");
    $("timer-section").classList.add("hidden");
    $("music-section").classList.add("hidden");
    $("game-area").classList.remove("hidden");

    clearCanvas();
    drawGallows();
    $("hint").textContent = "\uD83D\uDCA1 " + currentWord.hint;
    updateWordDisplay();
    createKeyboard();
    updateStats();
}

// ---- Canvas Drawing ----

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGallows() {
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Base
    ctx.beginPath();
    ctx.moveTo(20, 240);
    ctx.lineTo(200, 240);
    ctx.stroke();

    // Vertical pole
    ctx.beginPath();
    ctx.moveTo(60, 240);
    ctx.lineTo(60, 20);
    ctx.stroke();

    // Top beam
    ctx.beginPath();
    ctx.moveTo(60, 20);
    ctx.lineTo(150, 20);
    ctx.stroke();

    // Support bracket
    ctx.beginPath();
    ctx.moveTo(60, 50);
    ctx.lineTo(90, 20);
    ctx.stroke();

    // Rope
    ctx.beginPath();
    ctx.moveTo(150, 20);
    ctx.lineTo(150, 50);
    ctx.stroke();
}

function drawPart(step) {
    ctx.strokeStyle = "#e25822";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    switch (step) {
        case 1: // Head
            ctx.beginPath();
            ctx.arc(150, 70, 20, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 2: // Body
            ctx.beginPath();
            ctx.moveTo(150, 90);
            ctx.lineTo(150, 160);
            ctx.stroke();
            break;
        case 3: // Left arm
            ctx.beginPath();
            ctx.moveTo(150, 110);
            ctx.lineTo(120, 140);
            ctx.stroke();
            break;
        case 4: // Right arm
            ctx.beginPath();
            ctx.moveTo(150, 110);
            ctx.lineTo(180, 140);
            ctx.stroke();
            break;
        case 5: // Left leg
            ctx.beginPath();
            ctx.moveTo(150, 160);
            ctx.lineTo(120, 200);
            ctx.stroke();
            break;
        case 6: // Right leg + X eyes
            ctx.beginPath();
            ctx.moveTo(150, 160);
            ctx.lineTo(180, 200);
            ctx.stroke();
            // Dead eyes
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(142, 63);
            ctx.lineTo(148, 69);
            ctx.moveTo(148, 63);
            ctx.lineTo(142, 69);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(152, 63);
            ctx.lineTo(158, 69);
            ctx.moveTo(158, 63);
            ctx.lineTo(152, 69);
            ctx.stroke();
            break;
    }
}

// ---- Word Display ----

function updateWordDisplay() {
    const display = $("word-display");
    display.innerHTML = "";
    for (const ch of currentWord.word) {
        const span = document.createElement("span");
        if (ch === " ") {
            span.className = "letter space";
            span.textContent = " ";
        } else if (guessedLetters.has(ch)) {
            span.className = "letter revealed";
            span.textContent = ch;
        } else {
            span.className = "letter";
            span.textContent = "_";
        }
        display.appendChild(span);
    }
}

// ---- Keyboard ----

function createKeyboard() {
    const kb = $("keyboard");
    kb.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const ch = String.fromCharCode(i);
        const btn = document.createElement("button");
        btn.textContent = ch;
        btn.className = "key";
        if (guessedLetters.has(ch)) {
            btn.disabled = true;
            btn.classList.add(currentWord.word.includes(ch) ? "correct" : "wrong");
        }
        btn.addEventListener("click", () => guess(ch));
        kb.appendChild(btn);
    }
}

// ---- Game Logic ----

function guess(ch) {
    if (gameOver || guessedLetters.has(ch)) return;
    guessedLetters.add(ch);

    if (currentWord.word.includes(ch)) {
        updateWordDisplay();
        createKeyboard();
        checkWin();
    } else {
        wrongGuesses++;
        drawPart(wrongGuesses);
        createKeyboard();
        updateStats();
        document.querySelector(".container").classList.add("shake");
        setTimeout(
            () => document.querySelector(".container").classList.remove("shake"),
            500
        );
        if (wrongGuesses >= MAX_WRONG) lose();
    }
}

function updateStats() {
    const left = MAX_WRONG - wrongGuesses;
    $("guesses-left").textContent =
        "\u2694\uFE0F " + left + " " + (left === 1 ? "life" : "lives") + " remaining";
}

function checkWin() {
    const won = [...currentWord.word].every(
        (ch) => ch === " " || guessedLetters.has(ch)
    );
    if (won) {
        gameOver = true;
        $("game-area").classList.add("hidden");
        $("result-screen").classList.remove("hidden");
        $("win-screen").classList.remove("hidden");
        startCountdown();
    }
}

function lose() {
    gameOver = true;
    $("reveal-word").textContent = currentWord.word;
    $("game-area").classList.add("hidden");
    $("result-screen").classList.remove("hidden");
    $("lose-screen").classList.remove("hidden");
    setTimeout(init, 3000);
}

// ---- Countdown Timer ----

function startCountdown() {
    $("timer-section").classList.remove("hidden");
    let t = 5;
    $("countdown").textContent = t;

    const iv = setInterval(() => {
        t--;
        $("countdown").textContent = t;
        if (t <= 0) {
            clearInterval(iv);
            $("timer-section").classList.add("hidden");
            $("music-section").classList.remove("hidden");
            spawnHearts();
            playMusic();
        }
    }, 1000);
}

// ---- Floating Hearts ----

function spawnHearts() {
    const container = $("hearts");
    container.innerHTML = "";
    const emojis = [
        "\u2764\uFE0F",
        "\uD83D\uDC95",
        "\uD83D\uDC97",
        "\uD83D\uDC96",
        "\uD83D\uDC98",
    ];
    for (let i = 0; i < 30; i++) {
        const h = document.createElement("span");
        h.className = "heart";
        h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        h.style.left = Math.random() * 100 + "%";
        h.style.animationDelay = Math.random() * 6 + "s";
        h.style.animationDuration = 3 + Math.random() * 4 + "s";
        h.style.fontSize = 1 + Math.random() * 2 + "rem";
        container.appendChild(h);
    }
}

// ---- Music ----

async function playMusic() {
    // Try to play a user-provided music.mp3 first
    try {
        const audio = new Audio("music.mp3");
        audio.volume = 0.7;
        await audio.play();
        return;
    } catch {
        // No music.mp3 found — fall back to synthesized melody
        synthesizeMusic();
    }
}

function synthesizeMusic() {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    ac.resume();

    // Master volume
    const master = ac.createGain();
    master.gain.value = 0.35;
    master.connect(ac.destination);

    // Delay for ambient reverb-like feel
    const delay = ac.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = ac.createGain();
    feedback.gain.value = 0.15;
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(master);

    // Note frequencies
    const N = {
        F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
        G4: 392.0, A4: 440.0, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25,
    };

    // Play a single note with soft envelope
    function note(freq, start, dur, vol, type) {
        vol = vol || 0.1;
        type = type || "sine";
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = type;
        osc.frequency.value = freq;

        // Soft attack → sustain → gentle release
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(vol, start + 0.04);
        g.gain.setValueAtTime(vol, start + dur * 0.55);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(g);
        g.connect(master);
        g.connect(delay);
        osc.start(start);
        osc.stop(start + dur + 0.02);
    }

    // Timing
    var bpm = 72;
    var beat = 60 / bpm;
    var e = beat / 2; // eighth note
    var h = beat * 2; // half note
    var w = beat * 4; // whole note (one bar)

    // Arpeggio patterns for each chord (8 eighth notes per bar)
    var chords = [
        [N.C4, N.E4, N.G4, N.C5, N.G4, N.E4, N.C4, N.E4], // C major
        [N.A3, N.C4, N.E4, N.A4, N.E4, N.C4, N.A3, N.C4], // A minor
        [N.F3, N.A3, N.C4, N.F4, N.C4, N.A3, N.F3, N.A3], // F major
        [N.G3, N.B3, N.D4, N.G4, N.D4, N.B3, N.G3, N.B3], // G major
    ];

    // Melody over each chord (two half notes per bar)
    var melodies = [
        [
            [N.E5, N.C5], // over C
            [N.C5, N.A4], // over Am
            [N.A4, N.G4], // over F
            [N.B4, N.G4], // over G
        ],
        [
            [N.C5, N.E5], // variation 2
            [N.A4, N.C5],
            [N.F4, N.A4],
            [N.G4, N.B4],
        ],
    ];

    var now = ac.currentTime + 0.1;

    // Play 4 cycles (~53 seconds)
    for (var rep = 0; rep < 4; rep++) {
        var mel = melodies[rep % melodies.length];
        for (var ci = 0; ci < 4; ci++) {
            var barStart = now + (rep * 4 + ci) * w;

            // Arpeggiated chord
            for (var ni = 0; ni < 8; ni++) {
                note(chords[ci][ni], barStart + ni * e, e * 1.3, 0.07);
            }

            // Melody (triangle wave, warmer)
            note(mel[ci][0], barStart, h * 0.9, 0.09, "triangle");
            note(mel[ci][1], barStart + h, h * 0.9, 0.09, "triangle");
        }
    }
}

// ---- Ember Particles ----

function createEmbers() {
    var container = $("embers");
    for (var i = 0; i < 25; i++) {
        var ember = document.createElement("div");
        ember.className = "ember";
        ember.style.left = Math.random() * 100 + "%";
        ember.style.animationDelay = Math.random() * 5 + "s";
        ember.style.animationDuration = 3 + Math.random() * 4 + "s";
        var hue = 15 + Math.random() * 25;
        ember.style.background =
            "hsl(" + hue + ", 100%, " + (50 + Math.random() * 30) + "%)";
        container.appendChild(ember);
    }
}

// ---- Physical Keyboard Support ----

document.addEventListener("keydown", function (e) {
    var ch = e.key.toUpperCase();
    if (ch.length === 1 && ch >= "A" && ch <= "Z" && !gameOver) {
        guess(ch);
    }
});

// ---- Start ----

createEmbers();
init();

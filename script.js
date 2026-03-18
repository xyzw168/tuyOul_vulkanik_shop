/**
 * TUYUL VULKANIK - OFFICIAL ARCADE SCRIPT (FULL VERSION)
 * Fitur: Coin, Runner, Flappy, Quiz 10 Soal, WhatsApp Order, & Auto Discount.
 */

let score = 0;
let quizScore = 0;
let gameActive = false;
let gameLoop;
let isDiscountApplied = false;
let selectedMode = ''; 

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 
    setupGameControls();
    console.log("TuyOul Arcade System Ready!");
});

// --- 1. DATA KUIS (10 SOAL PENALARAN UMUM UTBK) ---
const quizData = [
    { q: "Semua TuyOul suka abu vulkanik. Sebagian penghuni kawah bukan TuyOul. Kesimpulannya?", a: ["Semua penghuni kawah suka abu", "Sebagian penghuni kawah suka abu", "Ada penghuni kawah yang bukan TuyOul"], correct: 2 },
    { q: "Jika stok TuyOul melimpah, maka harga diskon. Saat ini harga tidak diskon. Maka...", a: ["Stok TuyOul tidak melimpah", "Stok TuyOul sangat banyak", "Pembeli tidak mau beli"], correct: 0 },
    { q: "Pola Bilangan: 2, 4, 7, 12, 19, ... Berapakah angka selanjutnya?", a: ["28", "30", "31"], correct: 1 },
    { q: "Semua produk Vulkanik awet. Botol ini adalah produk Vulkanik. Jadi...", a: ["Botol ini mungkin awet", "Botol ini pasti awet", "Semua botol awet"], correct: 1 },
    { q: "Jika TuyOul rajin belajar, maka ia pintar. Jika TuyOul pintar, maka ia menang kuis. Kesimpulannya?", a: ["Jika TuyOul rajin belajar, maka ia menang kuis", "TuyOul menang kuis karena rajin", "Hanya TuyOul pintar yang rajin belajar"], correct: 0 },
    { q: "Pola Huruf: B, D, G, K, ... Huruf apakah selanjutnya?", a: ["N", "O", "P"], correct: 2 },
    { q: "Lima TuyOul (A, B, C, D, E) antre koin. A di depan B. C di belakang D. E tepat di depan A. Siapa yang paling depan?", a: ["E", "A", "D"], correct: 0 },
    { q: "Sebagian TuyOul memakai topi. Semua yang memakai topi terlihat keren. Maka...", a: ["Semua TuyOul terlihat keren", "Sebagian TuyOul terlihat keren", "TuyOul yang tidak memakai topi tidak keren"], correct: 1 },
    { q: "Pola Bilangan: 100, 95, 85, 70, 50, ... Berapakah angka selanjutnya?", a: ["25", "30", "20"], correct: 0 },
    { q: "Jika hari ini hujan, TuyOul berteduh. Hari ini TuyOul tidak berteduh. Maka...", a: ["Hari ini cerah", "Hari ini tidak hujan", "Kawah sedang penuh"], correct: 1 }
];

// --- 2. LOGIKA KUIS ---
function startQuiz() {
    quizScore = 0;
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'block';
    loadQuestion(0);
}

function loadQuestion(index) {
    if (index >= quizData.length) {
        alert("🔥 TOTAL SKOR QUIZ: " + quizScore);
        if (quizScore >= 70) {
            alert("SELAMAT! Kamu lulus seleksi TuyOul. Diskon 50% Aktif!");
            applyDiscount();
            showWin();
        } else {
            alert("Skor kamu di bawah 70. Belajar lagi ya!");
            backToMenu();
        }
        return;
    }

    const data = quizData[index];
    document.getElementById('quiz-question').innerText = `Pertanyaan ${index + 1}: ${data.q}`;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    data.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === data.correct) {
                quizScore += 10;
                loadQuestion(index + 1);
            } else { 
                alert("Salah! Jawaban benar: " + data.a[data.correct]);
                backToMenu(); 
            }
        };
        optionsDiv.appendChild(btn);
    });
}

// --- 3. SISTEM MENU & NAVIGASI GAME ---
function selectGame(mode) {
    selectedMode = mode;
    gameActive = false;
    clearTimeout(gameLoop);
    
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-window').style.display = 'block';
    document.getElementById('quiz-window').style.display = 'none'; 
    
    const jumpBtn = document.getElementById('virtual-jump-btn');
    const player = document.getElementById('player');
    player.style.top = ""; 
    player.style.bottom = "10px";

    // Gunakan maskot TuyOul untuk semua mode visual
    player.innerHTML = '<img src="maskot-tuyul.png" class="tuyul-sprite">'; 

    if(mode === 'runner') {
        player.className = 'player-runner';
        player.style.left = "50px";
        if(jumpBtn) { jumpBtn.style.display = 'inline-block'; jumpBtn.innerText = "JUMP!"; }
    } else if(mode === 'flappy') {
        player.className = 'player-flappy';
        player.style.left = "80px";
        player.style.top = "200px"; 
        if(jumpBtn) { jumpBtn.style.display = 'inline-block'; jumpBtn.innerText = "FLY!"; }
    } else if(mode === 'coin') {
        player.className = 'player-coin';
        player.style.left = "50%";
        if(jumpBtn) jumpBtn.style.display = 'none';
    }
}

function startAction() {
    if(gameActive) return;
    score = 0;
    gameActive = true;
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('voucher-popup').style.display = 'none';
    
    document.querySelectorAll('.coin, .obstacle, .pipe, .bomb').forEach(el => el.remove());

    if(selectedMode === 'coin') spawnCoin();
    else if(selectedMode === 'runner') spawnObstacle();
    else if(selectedMode === 'flappy') startFlappyLogic();
}

function backToMenu() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.querySelectorAll('.coin, .obstacle, .pipe, .bomb').forEach(el => el.remove());
    
    const player = document.getElementById('player');
    player.className = ''; 
    player.style.top = ""; 
    player.style.bottom = "10px";

    document.getElementById('game-window').style.display = 'none';
    document.getElementById('quiz-window').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
    score = 0;
    document.getElementById('score').innerText = "Skor: 0";
}

// --- 4. LOGIKA GAME COIN ---
function spawnCoin() {
    if (!gameActive || selectedMode !== 'coin') return;
    const board = document.getElementById('game-board');
    const coin = document.createElement('div');
    const isBomb = Math.random() < 0.2;
    
    coin.className = isBomb ? 'coin bomb' : 'coin';
    coin.innerHTML = isBomb ? '💣' : '💰';
    coin.style.left = Math.random() * (board.offsetWidth - 50) + 'px';
    coin.style.top = '-50px';
    board.appendChild(coin);

    let fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); coin.remove(); return; }
        let top = parseInt(coin.style.top);
        const player = document.getElementById('player');
        
        if (top > 330 && top < 380 && Math.abs(coin.offsetLeft - player.offsetLeft) < 50) {
            if(isBomb) {
                score = Math.max(0, score - 20);
                board.classList.add('shake-effect');
                setTimeout(() => board.classList.remove('shake-effect'), 300);
            } else {
                score += 10;
            }
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(fall); coin.remove();
        } else if (top > 400) {
            clearInterval(fall); coin.remove();
        } else {
            coin.style.top = (top + 5 + (score/30)) + 'px';
        }
    }, 20);
    gameLoop = setTimeout(spawnCoin, 800);
}

// --- 5. LOGIKA GAME RUNNER ---
function spawnObstacle() {
    if (!gameActive || selectedMode !== 'runner') return;
    const board = document.getElementById('game-board');
    const obs = document.createElement('div');
    obs.className = 'obstacle';
    obs.innerHTML = '🔥'; 
    board.appendChild(obs);

    let pos = board.offsetWidth;
    let move = setInterval(() => {
        if (!gameActive) { clearInterval(move); obs.remove(); return; }
        pos -= (7 + score/50);
        obs.style.left = pos + 'px';

        const player = document.getElementById('player');
        let pBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
        
        if (pos < 90 && pos > 40 && pBottom < 50) {
            gameOver("TuyOul-mu kena api kawah!");
            clearInterval(move); obs.remove();
        } else if (pos < -50) {
            score += 10;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(move); obs.remove();
        }
    }, 20);
    gameLoop = setTimeout(spawnObstacle, Math.random() * 1000 + 800);
}

// --- 6. LOGIKA GAME FLAPPY (VERSI HALUS) ---
function startFlappyLogic() {
    const player = document.getElementById('player');
    let velocity = 0;
    let gravityForce = 0.25;

    let gravityInterval = setInterval(() => {
        if(!gameActive || selectedMode !== 'flappy') { clearInterval(gravityInterval); return; }
        velocity += gravityForce;
        let top = parseInt(player.style.top) || 200;
        player.style.top = (top + velocity) + 'px';
        
        if(top > 375 || top < -20) {
            gameOver("TuyOul tenggelam di lava!");
            clearInterval(gravityInterval);
        }
    }, 20);
    spawnPipe();
}

function spawnPipe() {
    if (!gameActive || selectedMode !== 'flappy') return;
    const board = document.getElementById('game-board');
    const gap = 170; // Celah lebih lebar agar adil
    const pipeHeight = Math.random() * (board.offsetHeight - gap - 100) + 50;

    const pTop = document.createElement('div');
    pTop.className = 'pipe';
    pTop.style.height = pipeHeight + 'px';
    pTop.style.top = '0';
    pTop.style.left = board.offsetWidth + 'px';
    board.appendChild(pTop);

    const pBot = document.createElement('div');
    pBot.className = 'pipe';
    pBot.style.height = (board.offsetHeight - pipeHeight - gap) + 'px';
    pBot.style.bottom = '0';
    pBot.style.left = board.offsetWidth + 'px';
    board.appendChild(pBot);

    let moveP = setInterval(() => {
        if (!gameActive) { clearInterval(moveP); pTop.remove(); pBot.remove(); return; }
        let x = parseInt(pTop.style.left) - 4;
        pTop.style.left = x + 'px';
        pBot.style.left = x + 'px';

        const pRect = document.getElementById('player').getBoundingClientRect();
        const tRect = pTop.getBoundingClientRect();
        const bRect = pBot.getBoundingClientRect();

        if ((pRect.right > tRect.left && pRect.left < tRect.right && pRect.top < tRect.bottom) ||
            (pRect.right > bRect.left && pRect.left < bRect.right && pRect.bottom > bRect.top)) {
            gameOver("TuyOul menabrak pilar vulkanik!");
            clearInterval(moveP);
        }

        if (x < -60) {
            score += 5;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 50) showWin();
            clearInterval(moveP); pTop.remove(); pBot.remove();
        }
    }, 20);
    gameLoop = setTimeout(spawnPipe, 1500);
}

// --- 7. KONTROL & INPUT ---
function setupGameControls() {
    const board = document.getElementById('game-board');
    
    // Geser (Mouse & Touch)
    const moveH = (e) => {
        if (!gameActive || selectedMode !== 'coin') return;
        const rect = board.getBoundingClientRect();
        let x = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - rect.left;
        if (x > 25 && x < rect.width - 25) document.getElementById('player').style.left = (x - 25) + 'px';
    };
    board.addEventListener('mousemove', moveH);
    board.addEventListener('touchmove', moveH, { passive: false });

    // Keyboard
    window.addEventListener("keydown", (e) => {
        if (e.code === "Space") { e.preventDefault(); doJump(); }
        if (selectedMode === 'coin' && gameActive) {
            let p = document.getElementById('player');
            if(e.key === "ArrowLeft" && p.offsetLeft > 10) p.style.left = (p.offsetLeft - 25) + "px";
            if(e.key === "ArrowRight" && p.offsetLeft < 340) p.style.left = (p.offsetLeft + 25) + "px";
        }
    });
}

function doJump() {
    if (!gameActive) return;
    const p = document.getElementById('player');
    if (selectedMode === 'runner' && !p.classList.contains("jump-animation")) {
        p.classList.add("jump-animation");
        setTimeout(() => p.classList.remove("jump-animation"), 500);
    } else if (selectedMode === 'flappy') {
        p.style.top = (parseInt(p.style.top) - 55) + 'px';
    }
}

function gameOver(msg) {
    gameActive = false;
    alert(msg);
    backToMenu();
}

function showWin() {
    gameActive = false;
    clearTimeout(gameLoop);
    const popup = document.getElementById('voucher-popup');
    if(popup) popup.style.display = 'block';
}

// --- 8. DISKON & WHATSAPP ORDER ---
function applyDiscount() {
    isDiscountApplied = true;
    document.querySelectorAll('.display-price').forEach(el => {
        const original = parseInt(el.getAttribute('data-original'));
        el.style.textDecoration = "line-through";
        el.style.color = "#888";
        if (!el.nextElementSibling?.classList.contains('new-price')) {
            const tag = document.createElement('span');
            tag.className = 'new-price';
            tag.innerText = " Rp " + (original * 0.5).toLocaleString('id-ID');
            el.parentNode.insertBefore(tag, el.nextSibling);
        }
    });
    alert("🔥 DISKON 50% TELAH DIAKTIFKAN!");
}

function setupWhatsAppOrdering() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-secondary')) {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const title = card.querySelector('.product-title').innerText;
            const price = card.querySelector('.new-price')?.innerText || card.querySelector('.display-price').innerText;
            const text = encodeURIComponent(`🌋 Order TuyOul Vulkanik 🌋\nProduk: ${title}\nHarga: ${price}\nStatus: ${isDiscountApplied ? 'Diskon 50%' : 'Normal'}`);
            window.open(`https://wa.me/6281804554719?text=${text}`, '_blank');
        }
    });
}

// --- 9. LAIN-LAIN ---
function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function highlightActiveProductCards() {
    document.querySelectorAll('.product-card').forEach(c => {
        c.addEventListener('mouseenter', () => c.style.borderColor = '#ff5722');
        c.addEventListener('mouseleave', () => c.style.borderColor = '#333');
    });
}

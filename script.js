/**
 * TUYUL VULKANIK Website JavaScript
 * Fungsionalitas: Multi-Game (Coin & Runner), Smooth Scroll, 
 * WhatsApp Automation, dan Sistem Diskon 50%.
 */

let score = 0;
let gameActive = false;
let gameLoop;
let isDiscountApplied = false;
let selectedMode = ''; // 'coin' atau 'runner'

document.addEventListener('DOMContentLoaded', () => {
    console.log("Website TUYUL VULKANIK - Arcade Mode Ready.");
    
    smoothScrollNavigation();
    highlightActiveProductCards();
    setupWhatsAppOrdering(); 
    setupGameControls();
});

// --- 1. NAVIGASI & VISUAL ---
function smoothScrollNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function highlightActiveProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() { this.classList.add('hover-js'); });
        card.addEventListener('mouseleave', function() { this.classList.remove('hover-js'); });
    });
}

// --- 2. SISTEM MENU & KONTROL GAME ---
function selectGame(mode) {
    selectedMode = mode;
    gameActive = false;
    clearTimeout(gameLoop);
    
    // UI Switch
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-window').style.display = 'block';
    document.getElementById('voucher-popup').style.display = 'none';
    
    const player = document.getElementById('player');
    
    if(mode === 'runner') {
        player.innerHTML = '<img src="maskot-tuyul.png" style="width:50px; height:auto;">';
        player.className = 'player-runner';
        player.style.left = "50px";
        player.style.bottom = "10px";
        player.style.top = "auto";
    } else {
        player.innerHTML = '🌋';
        player.className = 'player-coin';
        player.style.left = "50%";
        player.style.bottom = "10px";
    }
}

function backToMenu() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.querySelectorAll('.coin, .obstacle, .bomb').forEach(el => el.remove());
    document.getElementById('game-menu').style.display = 'block';
    document.getElementById('game-window').style.display = 'none';
}

function startAction() {
    if(gameActive) return;
    score = 0;
    gameActive = true;
    document.getElementById('score').innerText = "Skor: 0";
    document.getElementById('voucher-popup').style.display = 'none';
    
    // Hapus objek lama
    document.querySelectorAll('.coin, .obstacle').forEach(el => el.remove());

    if(selectedMode === 'coin') {
        spawnCoin();
    } else {
        spawnObstacle();
    }
}

// --- 3. LOGIKA GAME KOIN ---
function spawnCoin() {
    if (!gameActive || selectedMode !== 'coin') return;
    
    const board = document.getElementById('game-board');
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.innerHTML = '💰';
    coin.style.left = Math.random() * (board.offsetWidth - 40) + 'px';
    coin.style.top = '-40px';
    board.appendChild(coin);

    let fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); coin.remove(); return; }
        
        let top = parseInt(coin.style.top);
        const player = document.getElementById('player');
        const pLeft = player.offsetLeft;
        const cLeft = coin.offsetLeft;

        // Deteksi Tangkap
        if (top > 340 && top < 380 && cLeft >= pLeft - 30 && cLeft <= pLeft + 50) {
            score += 10;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(fall);
            coin.remove();
        } else if (top > 400) {
            clearInterval(fall);
            coin.remove();
        } else {
            coin.style.top = (top + 6) + 'px';
        }
    }, 20);

    gameLoop = setTimeout(spawnCoin, Math.max(400, 1000 - score * 2));
}

// --- 4. LOGIKA GAME RUNNER ---
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
        
        // Deteksi Tabrakan
        if (pos < 90 && pos > 40 && pBottom < 50) {
            gameActive = false;
            alert("Yah! TuyOul-mu kena api. Skor akhir: " + score);
            backToMenu();
            clearInterval(move);
            obs.remove();
        }

        if (pos < -50) {
            score += 10;
            document.getElementById('score').innerText = "Skor: " + score;
            if(score >= 100) showWin();
            clearInterval(move);
            obs.remove();
        }
    }, 20);

    gameLoop = setTimeout(spawnObstacle, Math.random() * (2000 - 1000) + 1000);
}

// --- 5. KONTROL INPUT (KEYBOARD & TOUCH) ---
function setupGameControls() {
    // Gerakan Keyboard
    window.addEventListener("keydown", (e) => {
        if(!gameActive) return;
        const player = document.getElementById('player');
        
        // Loncat (Runner)
        if (e.code === "Space" && selectedMode === 'runner') {
            if (!player.classList.contains("jump-animation")) {
                player.classList.add("jump-animation");
                setTimeout(() => player.classList.remove("jump-animation"), 500);
            }
        }
        // Geser (Coin)
        if (selectedMode === 'coin') {
            let left = player.offsetLeft;
            if(e.key === "ArrowLeft" && left > 20) player.style.left = (left - 30) + "px";
            if(e.key === "ArrowRight" && left < 330) player.style.left = (left + 30) + "px";
        }
    });

    // Tap Layar (HP)
    document.getElementById('game-board').addEventListener('touchstart', (e) => {
        if(!gameActive) return;
        if(selectedMode === 'runner') {
            const player = document.getElementById('player');
            if (!player.classList.contains("jump-animation")) {
                player.classList.add("jump-animation");
                setTimeout(() => player.classList.remove("jump-animation"), 500);
            }
        }
    });
}

function showWin() {
    gameActive = false;
    clearTimeout(gameLoop);
    document.getElementById('voucher-popup').style.display = 'block';
}

// --- 6. DISKON & WHATSAPP ---
function applyDiscount() {
    isDiscountApplied = true;
    document.getElementById('voucher-popup').style.display = 'none';
    
    const priceElements = document.querySelectorAll('.display-price');
    priceElements.forEach(el => {
        const originalValue = parseInt(el.getAttribute('data-original'));
        const discountedValue = originalValue * 0.5;
        
        el.style.textDecoration = "line-through";
        el.style.color = "#888";
        
        if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('new-price')) {
            const newPriceTag = document.createElement('span');
            newPriceTag.className = 'new-price';
            newPriceTag.style.color = "#ff5722";
            newPriceTag.style.fontWeight = "bold";
            newPriceTag.innerText = " Rp " + discountedValue.toLocaleString('id-ID');
            el.parentNode.insertBefore(newPriceTag, el.nextSibling);
        }
    });
    alert("🔥 MANTAP! Diskon 50% Berhasil Diklaim.");
}

function setupWhatsAppOrdering() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-secondary')) {
            const card = e.target.closest('.product-card');
            if (!card) return;

            e.preventDefault();
            const namaProduk = card.querySelector('.product-title').innerText;
            const hargaFinal = card.querySelector('.new-price')?.innerText || card.querySelector('.display-price').innerText;
            const statusDiskon = isDiscountApplied ? "*SUDAH KLAIM DISKON 50%*" : "Harga Normal";
            
            const pesan = encodeURIComponent(
                `🌋 Order TUYUL VULKANIK 🌋\n\n` +
                `Produk: ${namaProduk}\n` +
                `Harga: ${hargaFinal}\n` +
                `Status: ${statusDiskon}\n\n` +
                `Mohon info pembayarannya!`
            );
            
            window.open(`https://wa.me/6281804554719?text=${pesan}`, '_blank');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // --- CURSOR & RIPPLES (Desktop Only) ---
    const cursor = document.getElementById('game-cursor');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX - 10}px`; cursor.style.top = `${e.clientY - 10}px`;
        });
        document.querySelectorAll('.interactable').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
        document.addEventListener('mousedown', (e) => {
            const ripple = document.createElement('div'); ripple.classList.add('click-ripple');
            ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
            document.body.appendChild(ripple); setTimeout(() => ripple.remove(), 600);
        });
    }

    // --- INK PARTICLES ---
    const canvas = document.getElementById('ink-particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas); resizeCanvas();
    for (let i = 0; i < 25; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 0.5, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 });
    }
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#2a2a2a';
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- CONFETTI ENGINE ---
    const cCanvas = document.getElementById('confetti-canvas');
    const cCtx = cCanvas.getContext('2d');
    let confettis = [];
    const colors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];

    function fireConfetti() {
        cCanvas.width = window.innerWidth; cCanvas.height = window.innerHeight;
        for (let i = 0; i < 150; i++) {
            confettis.push({
                x: cCanvas.width / 2, y: cCanvas.height / 2 + 50,
                vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 1) * 20 - 5,
                size: Math.random() * 10 + 5, color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10
            });
        }
        animateConfetti();
    }
    function animateConfetti() {
        if (confettis.length === 0) return;
        cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
        confettis.forEach((c, index) => {
            c.vy += 0.5; // gravity
            c.x += c.vx; c.y += c.vy; c.rot += c.rotSpeed;
            cCtx.save(); cCtx.translate(c.x, c.y); cCtx.rotate(c.rot * Math.PI / 180);
            cCtx.fillStyle = c.color; cCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            cCtx.restore();
            if (c.y > cCanvas.height) confettis.splice(index, 1);
        });
        requestAnimationFrame(animateConfetti);
    }

    // --- GAMEPLAY LOGIC & PUZZLES ---
    const gameData = {
        1: { answer: "github", question: "Guess the tech platform based on these emojis: <br><br> 🐙 🐱 💻" },
        2: { answer: "html", question: "I provide the structural skeleton for every web page. I am made entirely of tags, but I am not a game. What am I?" },
        3: { answer: "7", question: "Evaluate the JavaScript closure:<br><br><code>const add = x => y => x + y;</code><br><br>What is the output of <code>add(5)(2)</code> ?" }
    };

    let gameActive = false;
    let activeDoorId = null;

    const room = document.getElementById('room');
    const overlay = document.getElementById('overlay');
    const puzzleModal = document.getElementById('puzzle-modal');
    const puzzleQ = document.getElementById('puzzle-question');
    const puzzleInput = document.getElementById('puzzle-input');
    const scoreEl = document.getElementById('score');
    const missionText = document.getElementById('mission-text');

    // Start Game
    document.getElementById('btn-enter').addEventListener('click', () => {
        document.getElementById('flash').classList.add('flash-anim');
        setTimeout(() => {
            document.getElementById('front-gate').style.display = 'none';
            gameActive = true;
            document.getElementById('game-hud').style.opacity = '1';
        }, 250);
    });

    // --- RESPONSIVE CAMERA CONTROLS ---
    let camRotX = 0, camRotY = 0;

    // Desktop: Follow Mouse
    document.addEventListener('mousemove', (e) => {
        if (!gameActive || isTouchDevice) return;
        const pctX = (e.clientX / window.innerWidth) - 0.5;
        const pctY = (e.clientY / window.innerHeight) - 0.5;
        camRotX = -pctY * 15;
        camRotY = pctX * 30;
        room.style.transform = `translateZ(var(--cam-z)) rotateX(${camRotX}deg) rotateY(${camRotY}deg)`;
    });

    // Mobile: Swipe / Drag to look
    let isDragging = false;
    let lastTouchX = 0, lastTouchY = 0;

    document.getElementById('scene').addEventListener('touchstart', (e) => {
        if (!gameActive) return;
        isDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    document.getElementById('scene').addEventListener('touchmove', (e) => {
        if (!gameActive || !isDragging) return;

        let deltaX = e.touches[0].clientX - lastTouchX;
        let deltaY = e.touches[0].clientY - lastTouchY;

        camRotY += deltaX * 0.4; // Swipe Sensitivity
        camRotX -= deltaY * 0.4;

        // Clamp angles so user doesn't spin out of the box
        camRotX = Math.max(-20, Math.min(20, camRotX));
        camRotY = Math.max(-50, Math.min(50, camRotY));

        room.style.transform = `translateZ(var(--cam-z)) rotateX(${camRotX}deg) rotateY(${camRotY}deg)`;

        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    document.getElementById('scene').addEventListener('touchend', () => isDragging = false);


    // Door Clicks
    document.querySelectorAll('.door-frame').forEach(door => {
        door.addEventListener('click', () => {
            const doorId = parseInt(door.getAttribute('data-id'));

            if (door.classList.contains('locked')) {
                door.classList.add('shake-anim');
                setTimeout(() => door.classList.remove('shake-anim'), 400);
                return;
            }

            if (door.classList.contains('solved')) {
                openContentModal(door.getAttribute('data-target'));
            } else if (door.classList.contains('unlocked')) {
                activeDoorId = doorId;
                puzzleQ.innerHTML = gameData[doorId].question;
                puzzleInput.value = '';
                puzzleInput.classList.remove('error');

                document.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');
                puzzleModal.style.display = 'block';
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('active'), 50);
            }
        });
    });

    // Submit Puzzle
    document.getElementById('btn-submit-puzzle').addEventListener('click', checkPuzzle);
    puzzleInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPuzzle(); });

    function checkPuzzle() {
        const guess = puzzleInput.value.toLowerCase().trim();
        if (guess === gameData[activeDoorId].answer) {

            const currentDoorFrame = document.querySelector(`.door-frame[data-id="${activeDoorId}"]`);
            const targetContent = currentDoorFrame.getAttribute('data-target');

            currentDoorFrame.classList.remove('unlocked');
            currentDoorFrame.classList.add('solved');
            currentDoorFrame.querySelector('.status-icon').innerText = "[ ACCESSED ]";
            currentDoorFrame.querySelector('.room-door').classList.add('open');

            scoreEl.innerText = activeDoorId;

            if (activeDoorId < 3) {
                const nextDoor = document.querySelector(`.door-frame[data-id="${activeDoorId + 1}"]`);
                nextDoor.classList.remove('locked');
                nextDoor.classList.add('unlocked');
                nextDoor.querySelector('.status-icon').innerText = "[ UNLOCKED ]";
                missionText.innerText = `MISSION: UNLOCK DOOR ${activeDoorId + 1}`;
            }

            puzzleModal.style.display = 'none';
            openContentModal(targetContent);

        } else {
            puzzleInput.classList.add('error', 'shake-anim');
            setTimeout(() => puzzleInput.classList.remove('shake-anim'), 400);
        }
    }

    function openContentModal(targetId) {
        const activeModal = document.getElementById(targetId);
        activeModal.style.display = 'block';
        activeModal.scrollTop = 0;
    }

    // Close Modals & Handle Finale
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                puzzleModal.style.display = 'none';
                document.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');

                // Check if game just finished
                const finalDoor = document.querySelector('.door-frame[data-id="3"]');
                if (finalDoor.classList.contains('solved') && btn.classList.contains('close-btn')) {
                    if (missionText.innerText !== "MISSION: COMPLETE") {
                        missionText.innerText = "MISSION: COMPLETE";
                        missionText.classList.remove('blink');
                        missionText.style.color = "#27ae60";
                        document.getElementById('party-popup').classList.add('show');
                        fireConfetti();

                        setTimeout(() => {
                            document.getElementById('party-popup').classList.remove('show');
                        }, 5000);
                    }
                }
            }, 400);
        });
    });
});
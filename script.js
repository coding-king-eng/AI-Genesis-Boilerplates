__________.addEventListener('DOMContentLoaded', () => {         //HINT : HTML Document 

    // --- CURSOR & RIPPLES ---
    const cursor = document._________('game-cursor');           //HINT : Target element by its id
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX - 10}____`; cursor.style.top = `${e.clientY - 10}_______`;         // HINT : Add Units for the offsets
    });
    document.querySelectorAll('.interactable').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
    document.addEventListener('___________', (e) => {              //HINT : Mouse clicked event
        const ripple = document.createElement('div'); ripple.classList.add('click-ripple');
        ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple); setTimeout(() => ripple.remove(), 600);
    });

    // --- INK PARTICLES ---
    const canvas = document.getElementById('ink-particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() { 
        canvas.width = window.innerWidth;
         canvas.height = window.innerHeight; 
    }
    
    window.addEventListener('resize', _________);     //HINT : call resizeCanvas function
    
    ______;     //HINT : call resizeCanvas function
    
    for (let i = _____; i < _______; i++) {                 //HINT : Range should go from 0 till 30
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
        _____________(animateParticles);        //HINT : Call requestAnimationFrame function
    }
    ___________;                        //HINT : Call animateParticles function

    // --- CONFETTI ENGINE (For Finale) ---
    const cCanvas = document.getElementById('confetti-canvas');
    const cCtx = cCanvas.getContext('2d');
    let confettis = [];
    const colors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];

    function ______() {     //HINT : define fireConfetti function
        cCanvas.width = window.innerWidth; cCanvas.height = window.innerHeight;
        for (let i = 0; i < 150; i++) {
            confettis.push({
                x: cCanvas.width / 2, y: cCanvas.height / 2 + 100,
                vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 1) * 20 - 5,
                size: Math.random() * 10 + 5, color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10
            });
        }
        _________();                    //HINT : Call animateConfetti function
    }
    function ______() {             //HINT : define animateConfetti function
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
        // Puzzle 1: Emoji
        1: { answer: "blackberry", question: "Guess the tech platform based on these emojis: <br><br> ⬛ + 🍓" },
        // Puzzle 2: HTML Riddle
        2: { answer: "html", question: "I provide the structural skeleton for every web page. I am made entirely of tags, but I am not a game. What am I?" },
        // Puzzle 3: JS Coding Concept (Closures/Currying)
        3: { answer: "12", question: "Evaluate the JavaScript closure:<br><br><code>const add = x => y => x + y;</code><br><br>What is the output of <code>add(10)(2)</code> ?" }


        /* ☁️ + ⚡ = Cloudflare

        🦊 + 🔥 = Firefox

        📷 + 👻 = Snapchat */
    };

    let gameActive = ______;               //HINT : Set value to NO
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

    // 3D Camera
    document.addEventListener('_________', (e) => {       //Hint : Event where mouse moves
        if (__________) return;            //HINT : if GAME IS NOT ACTIVE (refer to gameActive variable), return nothing
        const pctX = (e.clientX / window.innerWidth) - 0.5;
        const pctY = (e.clientY / window.innerHeight) - 0.5;
        room.style.transform = `translateZ(200px) rotateX(${-pctY * 15}deg) rotateY(${pctX * 30}deg)`;
    });

    // Door Clicks
    document.querySelectorAll('.door-frame').forEach(door => {
        door.addEventListener('click', () => {
            const doorId = parseInt(door.getAttribute('data-id'));

            if (door.classList.contains('locked')) {
                door.classList.add('shake-anim');
                setTimeout(() => door.classList.remove('shake-anim'), 400);
                return; // Block entry
            }

            if (door.classList.contains('solved')) {
                // Already solved, just open content
                openContentModal(door.getAttribute('data-target'));
            } else if (door.classList.contains('unlocked')) {
                // Need to solve puzzle
                activeDoorId = doorId;

                // Using innerHTML so <br> and <code> tags render properly
                puzzleQ.innerHTML = gameData[doorId].question;
                puzzleInput.value = '';
                puzzleInput.classList.remove('error');

                document.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');
                puzzleModal.style.display = 'block';
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('active'), 50);
                setTimeout(() => puzzleInput.focus(), 500);
            }
        });
    });

    // Submit Puzzle
    document.getElementById('btn-submit-puzzle').addEventListener('click', checkPuzzle);
    puzzleInput.addEventListener('keypress', (e) => { if (e.key === '______') checkPuzzle(); });        //HINT : ENTER key clicked

    function _______() {                //HINT : Define checkPuzzle function
        const guess = puzzleInput.value.toLowerCase().trim();
        if (guess === gameData[activeDoorId].answer) {
            // Success!
            const currentDoorFrame = document.querySelector(`.door-frame[data-id="${activeDoorId}"]`);
            const targetContent = currentDoorFrame.getAttribute('data-target');

            // Visual updates for door
            currentDoorFrame.classList.remove('unlocked');
            currentDoorFrame.classList.add('solved');
            currentDoorFrame.querySelector('.status-icon').innerText = "[ ACCESSED ]";
            currentDoorFrame.querySelector('.room-door').classList.add('open');

            // Update HUD
            scoreEl.innerText = activeDoorId;

            // Unlock next level if applicable
            if (_________ < ______) {        //HINT : if activeDoorId is less than 3
                const nextDoor = document.querySelector(`.door-frame[data-id="${activeDoorId + 1}"]`);
                nextDoor.classList.remove('locked');
                nextDoor.classList.add('unlocked');
                nextDoor.querySelector('.status-icon').innerText = "[ _______ ]";           //HINT : Text that appears on the door when it is UNLOCKED
                missionText.innerText = `MISSION: UNLOCK DOOR ${activeDoorId + 1}`;
            }

            // Swap modals
            puzzleModal.style.display = 'none';
            _______(targetContent);     //HINT : call openContentModal function

        } else {
            // Fail
            puzzleInput.classList.add('error', 'shake-anim');
            setTimeout(() => puzzleInput.classList.remove('shake-anim'), 400);
        }
    }

    function _______(targetId) {        //HINT : define openContentModal function
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

                // Check if game just finished (Door 3 solved)
                const finalDoor = document.querySelector('.door-frame[data-id="3"]');
                if (finalDoor.classList.contains('solved') && btn.classList.contains('close-btn')) {
                    // Verify we haven't already celebrated
                    if (missionText.innerText !== "MISSION: COMPLETE") {
                        missionText.innerText = "MISSION: COMPLETE";
                        missionText.classList.remove('blink');
                        missionText.style.color = "#27ae60";
                        document.getElementById('party-popup').classList.add('show');
                        ____________;       //HINT : call fireConfetti function

                        // Hide popup after 5 seconds
                        setTimeout(() => {
                            document.getElementById('party-popup').classList.remove('show');
                        }, 5000);
                    }
                }
            }, 400);
        });
    });
});

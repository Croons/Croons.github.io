// Game Mode Script
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const character = document.getElementById('character');
    const gameToggle = document.querySelector('.game-toggle');
    const body = document.body;
    const achievements = document.querySelectorAll('.achievement');
    const secrets = document.querySelectorAll('.secret');
    
    // Game state
    let gameMode = false;
    let characterPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let characterSpeed = 5;
    let keys = { w: false, a: false, s: false, d: false };
    let unlockedAchievements = localStorage.getItem('achievements') ? 
        JSON.parse(localStorage.getItem('achievements')) : [];
    
    // Initialize
    initializeAchievements();
    placeCharacter();
    
    // Toggle game mode
    gameToggle.addEventListener('click', function() {
        gameMode = !gameMode;
        
        if (gameMode) {
            body.classList.add('game-mode-active');
            gameToggle.textContent = 'GAME MODE: ON';
            startGameLoop();
            handleKeyboardControls(true);
        } else {
            body.classList.remove('game-mode-active');
            gameToggle.textContent = 'GAME MODE: OFF';
            stopGameLoop();
            handleKeyboardControls(false);
        }
    });
    
    // Handle keyboard controls
    function handleKeyboardControls(bind) {
        if (bind) {
            document.addEventListener('keydown', keyDownHandler);
            document.addEventListener('keyup', keyUpHandler);
        } else {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        }
    }
    
    function keyDownHandler(e) {
        switch(e.key.toLowerCase()) {
            case 'w': keys.w = true; break;
            case 'a': keys.a = true; break;
            case 's': keys.s = true; break;
            case 'd': keys.d = true; break;
        }
    }
    
    function keyUpHandler(e) {
        switch(e.key.toLowerCase()) {
            case 'w': keys.w = false; break;
            case 'a': keys.a = false; break;
            case 's': keys.s = false; break;
            case 'd': keys.d = false; break;
        }
    }
    
    // Game loop
    let gameLoopId;
    
    function startGameLoop() {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    function stopGameLoop() {
        cancelAnimationFrame(gameLoopId);
    }
    
    function gameLoop() {
        updateCharacterPosition();
        checkAchievements();
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    function updateCharacterPosition() {
        if (keys.w) characterPosition.y -= characterSpeed;
        if (keys.a) characterPosition.x -= characterSpeed;
        if (keys.s) characterPosition.y += characterSpeed;
        if (keys.d) characterPosition.x += characterSpeed;
        
        // Boundary checks
        characterPosition.x = Math.max(0, Math.min(window.innerWidth - 32, characterPosition.x));
        characterPosition.y = Math.max(0, Math.min(window.innerHeight - 32, characterPosition.y));
        
        placeCharacter();
    }
    
    function placeCharacter() {
        character.style.left = `${characterPosition.x}px`;
        character.style.top = `${characterPosition.y}px`;
    }
    
    // Window resize handling
    window.addEventListener('resize', function() {
        characterPosition.x = Math.min(characterPosition.x, window.innerWidth - 32);
        characterPosition.y = Math.min(characterPosition.y, window.innerHeight - 32);
        placeCharacter();
    });
    
    // Scroll to sections when links are clicked
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Unlock achievement when visiting section
                const achievementId = 'visit-' + targetId.substring(1);
                unlockAchievement(achievementId);
            }
        });
    });
    
    // Achievement system
    function initializeAchievements() {
        // Apply previously unlocked achievements
        unlockedAchievements.forEach(id => {
            const achievement = document.querySelector(`.achievement[data-id="${id}"]`);
            if (achievement) {
                achievement.classList.add('unlocked');
                
                // Update secret achievement text
                if (id.startsWith('secret')) {
                    updateSecretAchievementText(id);
                }
            }
        });
        
        // Add click listeners to secrets
        secrets.forEach(secret => {
            secret.addEventListener('click', function() {
                const secretId = this.getAttribute('data-secret');
                unlockAchievement(secretId);
                this.classList.add('secret-found');
                
                // Visual effect and remove after animation
                setTimeout(() => {
                    this.style.display = 'none';
                }, 1000);
            });
        });
    }
    
    function unlockAchievement(id) {
        if (!unlockedAchievements.includes(id)) {
            unlockedAchievements.push(id);
            
            // Save to local storage
            localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
            
            // Update UI
            const achievement = document.querySelector(`.achievement[data-id="${id}"]`);
            if (achievement) {
                achievement.classList.add('unlocked');
                
                // Show notification
                showAchievementNotification(achievement.textContent);
                
                // Update secret achievement text
                if (id.startsWith('secret')) {
                    updateSecretAchievementText(id);
                }
            }
        }
    }
    
    function updateSecretAchievementText(secretId) {
        const achievement = document.querySelector(`.achievement[data-id="${secretId}"]`);
        if (achievement) {
            switch(secretId) {
                case 'secret-1':
                    achievement.textContent = 'Found Hidden Gem';
                    break;
                case 'secret-2':
                    achievement.textContent = 'Discovered Ancient Relic';
                    break;
                case 'secret-3':
                    achievement.textContent = 'Unlocked Mystery Chest';
                    break;
            }
        }
    }
    
    function showAchievementNotification(text) {
        const notification = document.createElement('div');
        notification.classList.add('achievement-notification');
        notification.innerHTML = `
            <div class="notification-icon">🏆</div>
            <div class="notification-text">Achievement Unlocked:<br>${text}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // Check for section-based achievements
    function checkAchievements() {
        const sections = ['about', 'projects', 'contact'];
        const scrollPos = window.scrollY + window.innerHeight / 2;
        
        sections.forEach(section => {
            const el = document.getElementById(section);
            if (el) {
                const top = el.offsetTop;
                const bottom = top + el.offsetHeight;
                
                if (scrollPos >= top && scrollPos <= bottom) {
                    unlockAchievement('visit-' + section);
                }
            }
        });
        
        // Check for character collisions with secrets
        if (gameMode) {
            secrets.forEach(secret => {
                if (secret.style.display !== 'none') {
                    const secretRect = secret.getBoundingClientRect();
                    const characterRect = character.getBoundingClientRect();
                    
                    if (isColliding(characterRect, secretRect)) {
                        const secretId = secret.getAttribute('data-secret');
                        unlockAchievement(secretId);
                        secret.classList.add('secret-found');
                        
                        // Visual effect and remove after animation
                        setTimeout(() => {
                            secret.style.display = 'none';
                        }, 1000);
                    }
                }
            });
        }
    }
    
    function isColliding(rect1, rect2) {
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }
    
    // Easter eggs
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateKonamiCode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    function activateKonamiCode() {
        // Create a special notification
        const notification = document.createElement('div');
        notification.classList.add('konami-notification');
        notification.innerHTML = `
            <div class="notification-icon">👾</div>
            <div class="notification-text">KONAMI CODE ACTIVATED!<br>Invincibility Enabled</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Apply effects
        character.classList.add('invincible');
        characterSpeed = 10;
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
                character.classList.remove('invincible');
                characterSpeed = 5;
            }, 500);
        }, 10000);
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .achievement-notification, .konami-notification {
            position: fixed;
            top: 20px;
            right: -300px;
            background-color: rgba(26, 26, 46, 0.9);
            border: 2px solid var(--accent-color);
            color: var(--text-color);
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 1000;
            transition: right 0.5s ease;
            font-family: 'VT323', monospace;
            box-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
        }
        
        .achievement-notification.show, .konami-notification.show {
            right: 20px;
        }
        
        .notification-icon {
            font-size: 2rem;
        }
        
        .konami-notification {
            border-color: gold;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
        }
        
        .invincible {
            animation: invincible 1s infinite alternate;
        }
        
        @keyframes invincible {
            0% {
                opacity: 1;
                filter: hue-rotate(0deg);
            }
            100% {
                opacity: 0.7;
                filter: hue-rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add CSS for pixel character
    const characterStyle = document.createElement('style');
    characterStyle.textContent = `
        @keyframes characterIdle {
            0% { background-position: 0px 0px; }
            100% { background-position: -32px 0px; }
        }
        
        #character {
            animation: characterIdle 0.5s steps(1) infinite alternate;
        }
    `;
    document.head.appendChild(characterStyle);
});

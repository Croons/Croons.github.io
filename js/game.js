// Game Mode Script - Grayscale Edition
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const achievements = document.querySelectorAll('.achievement');
    const secrets = document.querySelectorAll('.secret');
    const skills = document.querySelector('.skills');
    const projectsGrid = document.querySelector('.projects-grid');
    const pixelCharacters = document.querySelectorAll('.pixel-character');

    // Game state
    let unlockedAchievements = localStorage.getItem('achievements') ?
        JSON.parse(localStorage.getItem('achievements')) : [];
    let clickCounter = 0;

    // Initialize
    initializeAchievements();
    initializeAnimatedCharacters();
    setupParallaxEffect();

    // Initialize pixel characters
    function initializeAnimatedCharacters() {
        pixelCharacters.forEach(character => {
            // Set random movement pattern
            moveCharacter(character);

            // Make them interact with page elements
            character.addEventListener('animationiteration', function () {
                const randomElement = getRandomPageElement();
                if (randomElement) {
                    moveToElement(character, randomElement);
                }
            });
        });
    }

    function moveCharacter(character) {
        const maxX = window.innerWidth - 16;
        const maxY = document.body.scrollHeight - 16;
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;

        character.style.transition = `transform ${Math.random() * 5 + 10}s linear`;
        character.style.transform = `translate(${newX}px, ${newY}px)`;

        // Set character to face the right direction
        if (newX > parseFloat(character.style.left)) {
            character.style.transform += ' scaleX(1)';
        } else {
            character.style.transform += ' scaleX(-1)';
        }

        setTimeout(() => {
            moveCharacter(character);
        }, (Math.random() * 5 + 10) * 1000);
    }

    function moveToElement(character, element) {
        const elementRect = element.getBoundingClientRect();
        const scrollTop = window.scrollY;

        character.style.transition = 'transform 3s ease-in-out';
        character.style.transform = `translate(${elementRect.left}px, ${elementRect.top + scrollTop}px)`;

        setTimeout(() => {
            // Interact with the element
            element.classList.add('character-highlight');

            // Check if this is an achievement trigger
            if (element.dataset && element.dataset.achievement) {
                unlockAchievement(element.dataset.achievement);
            }

            setTimeout(() => {
                element.classList.remove('character-highlight');
            }, 1000);
        }, 3000);
    }

    function getRandomPageElement() {
        const interactableElements = [
            ...document.querySelectorAll('h2, h3, .btn, .project-card, .skills-list li, .contact-link')
        ];

        if (interactableElements.length === 0) return null;
        return interactableElements[Math.floor(Math.random() * interactableElements.length)];
    }

    // Parallax scrolling effect
    function setupParallaxEffect() {
        const parallaxLayers = document.querySelectorAll('.parallax-layer-1, .parallax-layer-2');

        window.addEventListener('scroll', function () {
            const scrollPosition = window.scrollY;

            parallaxLayers.forEach((layer, index) => {
                const speed = 0.1 * (index + 1);
                layer.style.transform = `translateY(${scrollPosition * speed}px)`;
            });
        });
    }

    // Achievement system
    function initializeAchievements() {
        // Apply previously unlocked achievements
        unlockedAchievements.forEach(id => {
            const achievement = document.querySelector(`.achievement[data-id="${id}"]`);
            if (achievement) {
                achievement.classList.add('unlocked');
            }
        });

        // Add click listeners to secrets
        secrets.forEach(secret => {
            secret.addEventListener('click', function () {
                const secretId = this.getAttribute('data-secret');
                unlockAchievement(secretId);
                this.classList.add('secret-found');

                // Visual effect and remove after animation
                setTimeout(() => {
                    this.style.display = 'none';
                }, 1000);
            });
        });

        // Add click listeners for achievement elements
        if (skills) {
            skills.addEventListener('click', function () {
                unlockAchievement('click-skills');
            });
        }

        if (projectsGrid) {
            projectsGrid.addEventListener('click', function () {
                unlockAchievement('view-all-projects');
            });
        }

        // Track scroll position for section achievements
        window.addEventListener('scroll', checkScrollAchievements);

        // Global click counter achievement
        document.addEventListener('click', function () {
            clickCounter++;
            if (clickCounter >= 20) {
                unlockAchievement('click-20-times');
            }
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
    function checkScrollAchievements() {
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
    }

    // Scroll to sections when links are clicked
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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

    // Easter eggs and Konami code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', function (e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                unlockAchievement('konami-code');
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
        notification.classList.add('achievement-notification');
        notification.innerHTML = `
            <div class="notification-icon">👾</div>
            <div class="notification-text">KONAMI CODE ACTIVATED!<br>Retro Mode Enabled</div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Apply pixel effect to entire page
        document.body.classList.add('retro-mode');

        // Add temporary effect
        document.body.style.filter = 'grayscale(100%) brightness(0.8) contrast(1.2)';

        // Spawn many pixel characters
        for (let i = 0; i < 10; i++) {
            spawnTemporaryCharacter();
        }

        // Remove effects after delay
        setTimeout(() => {
            notification.classList.remove('show');
            document.body.style.filter = '';

            setTimeout(() => {
                notification.remove();
                document.body.classList.remove('retro-mode');
            }, 500);
        }, 10000);
    }

    function spawnTemporaryCharacter() {
        const character = document.createElement('div');
        character.classList.add('pixel-character');

        // Random position
        character.style.top = Math.random() * 100 + 'vh';
        character.style.left = Math.random() * 100 + 'vw';

        // Random animation class
        if (Math.random() > 0.5) {
            character.classList.add('jumping');
        }

        document.body.appendChild(character);

        setTimeout(() => {
            character.remove();
        }, 10000);
    }

    // Add CSS for retro mode
    const style = document.createElement('style');
    style.textContent = `
        .retro-mode * {
            transition: all 0.3s ease;
        }
        
        .character-highlight {
            filter: brightness(1.5);
            animation: pulse 0.5s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
});
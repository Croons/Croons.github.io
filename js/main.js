document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const projectCards = document.querySelectorAll('.project-card');
    const projectModal = document.querySelector('.project-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const achievements = document.querySelectorAll('.achievement');
    const secrets = document.querySelectorAll('.secret');
    const skills = document.querySelector('.skills');
    const projectsGrid = document.querySelector('.projects-grid');
    const achievementContainer = document.querySelector('.achievement-container');
    const pixelCharacter = document.querySelector('.pixel-character');
    const achievementNotification = document.querySelector('.achievement-notification');
    const btnReadMore = document.querySelector('.btn-read-more');
    const btnReadLess = document.querySelector('.btn-read-less');
    const bioShort = document.querySelector('.bio-short');
    const bioFull = document.querySelector('.bio-full');

    // Game state
    let unlockedAchievements = localStorage.getItem('achievements')
        ? JSON.parse(localStorage.getItem('achievements'))
        : [];
    let clickCounter = 0;

    // Initialize
    initializeAchievements();
    initializePixelCharacter();
    initializeScrollAnimations();
    initializeModals();
    initializeBioToggle();

    // Scroll to sections when links are clicked
    const navLinks = document.querySelectorAll('nav a, .quick-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Smooth scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Unlock achievement when visiting section
                const achievementId = 'visit-' + targetId.substring(1);
                unlockAchievement(achievementId);
            }
        });
    });

    // Initialize read more/less toggle for bio
    function initializeBioToggle() {
        btnReadMore.addEventListener('click', function () {
            bioShort.style.display = 'none';
            bioFull.style.display = 'block';
        });

        btnReadLess.addEventListener('click', function () {
            bioFull.style.display = 'none';
            bioShort.style.display = 'block';
        });
    }

    // Initialize achievement system
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

        // Achievement panel toggle
        document.querySelector('.achievement-container::after').addEventListener('click', function () {
            achievementContainer.classList.toggle('show');
        });
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

    // Initialize pixel character and jumping game
    function initializePixelCharacter() {
        if (!document.querySelector('.pixel-character')) return;

        // Game elements
        const character = document.querySelector('.pixel-character');
        const gameArea = document.querySelector('.game-area');
        const scoreDisplay = document.querySelector('.score');

        // Game state
        let gameActive = true;
        let jumping = false;
        let score = 0;
        let highScore = 0;
        let movingLeft = false;
        let movingRight = false;
        let characterPosition = 20; // Percentage from left
        const moveSpeed = 0.5; // Percentage per frame
        const minPosition = 5; // Min percentage from left
        const maxPosition = 85; // Max percentage from left
        const jumpHeight = 40; // px

        // Controls
        document.addEventListener('keydown', function (e) {
            if (!gameActive) return;

            switch (e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    movingLeft = true;
                    if (!jumping) {
                        character.className = 'pixel-character run-left';
                    }
                    break;
                case 'd':
                case 'arrowright':
                    movingRight = true;
                    if (!jumping) {
                        character.className = 'pixel-character run-right';
                    }
                    break;
                case 'w':
                case 'arrowup':
                case ' ':
                    if (!jumping) {
                        jump();
                    }
                    break;
            }
        });

        document.addEventListener('keyup', function (e) {
            switch (e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    movingLeft = false;
                    if (!jumping && !movingRight) {
                        character.className = 'pixel-character idle';
                    }
                    break;
                case 'd':
                case 'arrowright':
                    movingRight = false;
                    if (!jumping && !movingLeft) {
                        character.className = 'pixel-character idle';
                    }
                    break;
            }
        });

        // Game loop
        function gameLoop() {
            if (!gameActive) return;

            // Move character left/right
            if (movingLeft && characterPosition > minPosition) {
                characterPosition -= moveSpeed;
            }
            if (movingRight && characterPosition < maxPosition) {
                characterPosition += moveSpeed;
            }

            // Update character position
            character.style.left = characterPosition + '%';

            requestAnimationFrame(gameLoop);
        }

        // Jump function
        function jump() {
            if (jumping) return;

            jumping = true;
            character.className = 'pixel-character jump';
            character.style.bottom = jumpHeight + 'px';

            setTimeout(() => {
                character.style.bottom = '0px';

                setTimeout(() => {
                    jumping = false;

                    // Reset animation based on movement
                    if (movingLeft) {
                        character.className = 'pixel-character run-left';
                    } else if (movingRight) {
                        character.className = 'pixel-character run-right';
                    } else {
                        character.className = 'pixel-character idle';
                    }
                }, 500);
            }, 500);
        }

        // Obstacle spawning
        function spawnObstacle() {
            if (!gameActive) return;

            // Create obstacle
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');

            // Randomize obstacle type (cactus or rock)
            const obstacleType = Math.random() > 0.5 ? 0 : -16;
            obstacle.style.backgroundPosition = obstacleType + 'px 0';

            obstacle.style.left = '100%';
            gameArea.appendChild(obstacle);

            // Random time until next obstacle (speed increases with score)
            const difficultyFactor = Math.max(0.7, 1 - (score * 0.01));
            const nextSpawnTime = Math.random() * 3000 * difficultyFactor + 1000;

            // Obstacle movement
            let obstaclePosition = 100;
            const obstacleSpeed = 0.2 + (score * 0.002);

            const moveObstacle = setInterval(() => {
                if (!gameActive) {
                    clearInterval(moveObstacle);
                    return;
                }

                obstaclePosition -= obstacleSpeed;
                obstacle.style.left = obstaclePosition + '%';

                // Check if obstacle passed character position
                if (obstaclePosition < characterPosition - 2 && obstaclePosition > characterPosition - 5) {
                    // Passed successfully, increment score
                    if (!obstacle.passed) {
                        obstacle.passed = true;
                        score++;
                        highScore = Math.max(score, highScore);
                        scoreDisplay.textContent = score;

                        // Achievements based on score
                        if (score === 10) unlockAchievement('high-score-10');
                        if (score === 25) unlockAchievement('high-score-25');
                        if (score === 50) unlockAchievement('high-score-50');
                    }
                }

                // Check collision
                const characterRect = character.getBoundingClientRect();
                const obstacleRect = obstacle.getBoundingClientRect();

                if (
                    characterRect.left < obstacleRect.right &&
                    characterRect.right > obstacleRect.left &&
                    characterRect.bottom > obstacleRect.top &&
                    characterRect.top < obstacleRect.bottom
                ) {
                    // Collision detected
                    clearInterval(moveObstacle);
                    gameOver();
                }

                // Remove when off screen
                if (obstaclePosition < -10) {
                    clearInterval(moveObstacle);
                    obstacle.remove();
                }
            }, 16); // ~60fps

            // Schedule next obstacle
            setTimeout(spawnObstacle, nextSpawnTime);
        }

        // Game over function
        function gameOver() {
            gameActive = false;

            // Show game over effect
            character.style.opacity = '0.5';
            character.className = 'pixel-character idle';

            // Check for master jumper achievement (score >= 15)
            if (score >= 15) {
                unlockAchievement('master-jumper');
            }

            // Reset everything after a delay
            setTimeout(() => {
                // Reset character
                character.style.opacity = '1';
                character.style.bottom = '0px';
                characterPosition = 20;
                character.style.left = characterPosition + '%';

                // Reset game state
                jumping = false;
                movingLeft = false;
                movingRight = false;

                // Remove all obstacles
                document.querySelectorAll('.obstacle').forEach(el => el.remove());

                // Reset score
                score = 0;
                scoreDisplay.textContent = score;

                // Restart game
                gameActive = true;
                setTimeout(spawnObstacle, 2000);
            }, 2000);
        }

        // Start game
        gameLoop();
        setTimeout(spawnObstacle, 2000);

        // Click character to jump and get achievement
        character.addEventListener('click', function () {
            unlockAchievement('click-pixel');
            if (!jumping && gameActive) {
                jump();
            }
        });
    }

    // Unlock achievement and show notification
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

    // Show achievement notification
    function showAchievementNotification(text) {
        const notificationName = achievementNotification.querySelector('.notification-name');
        notificationName.textContent = text;

        // Animate in
        achievementNotification.classList.add('show');

        // Remove after delay
        setTimeout(() => {
            achievementNotification.classList.remove('show');
        }, 3000);
    }

    // Initialize scroll animations
    function initializeScrollAnimations() {
        const elements = document.querySelectorAll('.section-title, .about-content, .project-card, .contact-content');

        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(element => {
            // Set initial opacity to 0
            element.style.opacity = '0';
            observer.observe(element);
        });
    }

    // Initialize project modals
    function initializeModals() {
        projectCards.forEach(card => {
            card.addEventListener('click', function () {
                const projectId = this.getAttribute('data-project');
                if (projectId && projectData[projectId]) {
                    showProjectModal(projectId);
                }
            });
        });

        // Close modal when clicking close button
        closeModalBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside
        projectModal.addEventListener('click', function (e) {
            if (e.target === projectModal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && projectModal.classList.contains('show')) {
                closeModal();
            }
        });
    }

    // Show project modal with data
    function showProjectModal(projectId) {
        const data = projectData[projectId];

        // Set modal content
        projectModal.querySelector('.modal-header h2').textContent = data.title;
        projectModal.querySelector('.project-description').innerHTML = data.description;
        projectModal.querySelector('.dev-time').textContent = data.devTime;
        projectModal.querySelector('.team-size').textContent = data.teamSize;

        // Set technologies
        const techContainer = projectModal.querySelector('.project-details .project-tech');
        techContainer.innerHTML = '';
        data.tech.forEach(tech => {
            const span = document.createElement('span');
            span.textContent = tech;
            techContainer.appendChild(span);
        });

        // Set gallery images
        const galleryContainer = projectModal.querySelector('.gallery-container');
        galleryContainer.innerHTML = '';
        data.gallery.forEach(img => {
            const imgEl = document.createElement('img');
            imgEl.src = img;
            imgEl.alt = data.title;
            galleryContainer.appendChild(imgEl);
        });

        // Set video
        projectModal.querySelector('.video-container').innerHTML = data.videoEmbed;

        // Set links
        projectModal.querySelector('.btn-code').href = data.links.code;
        projectModal.querySelector('.btn-play').href = data.links.play;
        projectModal.querySelector('.btn-download').href = data.links.download;

        // Show modal
        projectModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Close project modal
    function closeModal() {
        projectModal.classList.remove('show');
        document.body.style.overflow = '';

        // Reset video to prevent it from playing in background
        setTimeout(() => {
            const videoContainer = projectModal.querySelector('.video-container');
            const videoIframe = videoContainer.querySelector('iframe');
            if (videoIframe) {
                const videoSrc = videoIframe.src;
                videoIframe.src = videoSrc;
            }
        }, 300);
    }
});
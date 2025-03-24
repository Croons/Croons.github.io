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
        document.querySelector('.achievement-container').addEventListener('click', function (e) {
            if (e.target === this || e.target.closest('.achievement-container::after')) {
                achievementContainer.classList.toggle('show');
            }
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

    // Initialize pixel character movement
    function initializePixelCharacter() {
        if (!pixelCharacter) return;

        // Set initial position
        pixelCharacter.style.left = '10%';
        moveCharacter();

        // Add click listener for pixel character achievement
        pixelCharacter.addEventListener('click', function () {
            unlockAchievement('click-pixel');
            this.classList.add('running');
            setTimeout(() => {
                this.classList.remove('running');
            }, 3000);
        });
    }

    function moveCharacter() {
        const maxX = window.innerWidth - 50;
        const newX = Math.random() * maxX;
        const currentX = parseInt(pixelCharacter.style.left) || 0;

        // Determine direction
        const goingRight = newX > currentX;

        // Update position
        pixelCharacter.style.left = newX + 'px';

        // Flip character based on direction
        pixelCharacter.style.transform = goingRight ? 'scaleX(1)' : 'scaleX(-1)';

        // Move character again after a random delay
        setTimeout(moveCharacter, Math.random() * 8000 + 5000);
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
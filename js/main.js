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
    const achievementNotification = document.querySelector('.achievement-notification');
    const experienceSection = document.getElementById('experience');
    const pixelDotsContainer = document.getElementById('pixel-dots-container');
    const skillItems = document.querySelectorAll('.skills-list li');

    // Game state
    let unlockedAchievements = localStorage.getItem('achievements')
        ? JSON.parse(localStorage.getItem('achievements'))
        : [];
    let clickCounter = 0;

    // Initialize
    initializeAchievements();
    initializeScrollAnimations();
    initializeModals();
    initializeGame();
    createPixelDots();
    initializeExpandableSkills();

    // Initialize expandable skills
    function initializeExpandableSkills() {
        skillItems.forEach(skill => {
            skill.addEventListener('click', function (e) {
                // Prevent click from affecting achievement
                e.stopPropagation();

                // Toggle expanded class
                this.classList.toggle('expanded');

                // Get the description element
                const description = this.querySelector('.skill-description');

                // Get the computed style to check if it's already expanded
                const computedStyle = window.getComputedStyle(description);

                // If it's already expanded, collapse it
                if (description.style.maxHeight !== '0px' && this.classList.contains('expanded')) {
                    description.style.maxHeight = description.scrollHeight + 'px';
                    // Force reflow
                    description.offsetHeight;
                    description.style.maxHeight = '100px';
                } else {
                    // Otherwise, set it to 0 first to ensure animation works
                    description.style.maxHeight = '0px';
                    // Force reflow
                    description.offsetHeight;
                    // Then set to actual height if expanding
                    if (this.classList.contains('expanded')) {
                        description.style.maxHeight = description.scrollHeight + 'px';
                    }
                }

                // Unlock achievement for interacting with skills
                unlockAchievement('click-skills');
            });
        });
    }

    // Create floating pixel dots
    function createPixelDots() {
        const numDots = 120; // Increased number of dots

        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('pixel-dot');

            // Random position
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            dot.style.left = `${randomX}%`;
            dot.style.top = `${randomY}%`;

            // Random opacity between 0.5 and 1
            const randomOpacity = 0.2 + Math.random() * 0.4;
            dot.style.opacity = randomOpacity;

            // Random animation duration between 15 and 30 seconds (faster)
            const animationDuration = 15 + Math.random() * 15;

            // Set animation with proper syntax to ensure it works
            dot.style.animation = `floatAnimation ${animationDuration}s ease-in-out infinite`;

            // Random animation delay to prevent synchronized movement
            const animationDelay = Math.random() * 10;
            dot.style.animationDelay = `${animationDelay}s`;

            // Random initial rotation
            const randomRotation = Math.random() * 360;
            dot.style.transform = `rotate(${randomRotation}deg)`;

            pixelDotsContainer.appendChild(dot);
        }
    }

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

        if (experienceSection) {
            experienceSection.addEventListener('click', function () {
                unlockAchievement('visit-experience');
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
        if (achievementContainer) {
            achievementContainer.addEventListener('click', function () {
                this.classList.toggle('show');
            });
        }
    }

    // Check for section-based achievements
    function checkScrollAchievements() {
        const sections = ['about', 'projects', 'experience', 'contact'];
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

    // Initialize scroll animations
    function initializeScrollAnimations() {
        const elements = document.querySelectorAll('.section-title, .about-content, .project-card, .experience-card, .contact-content');

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
        if (!achievementNotification) return;

        const notificationName = achievementNotification.querySelector('.notification-name');
        if (notificationName) {
            notificationName.textContent = text;
        }

        // Animate in
        achievementNotification.classList.add('show');

        // Remove after delay
        setTimeout(() => {
            achievementNotification.classList.remove('show');
        }, 3000);
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
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        // Close modal when clicking outside
        if (projectModal) {
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
    }

    // Show project modal with data
    function showProjectModal(projectId) {
        if (!projectModal) return;

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

        // Set primary button
        const primaryButton = projectModal.querySelector('.project-primary-btn');
        primaryButton.textContent = data.primaryButton.text;
        primaryButton.href = data.primaryButton.link;

        // Show modal
        projectModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Close project modal
    function closeModal() {
        if (!projectModal) return;

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

    // Initialize game elements
    function initializeGame() {
        // Add random position to secrets
        secrets.forEach(secret => {
            const parent = secret.parentElement;
            const randomX = Math.floor(Math.random() * (parent.offsetWidth - 40)) + 20;
            const randomY = Math.floor(Math.random() * (parent.offsetHeight - 40)) + 20;

            secret.style.left = `${randomX}px`;
            secret.style.top = `${randomY}px`;
        });
    }
});
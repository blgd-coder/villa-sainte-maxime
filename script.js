/* ============================================
   ENTRE MER, CIEL & PINS — Villa Sainte-Maxime
   Script principal
   ============================================ */

(function () {
    'use strict';

    // ---- DOM REFERENCES ----
    var header       = document.getElementById('header');
    var menuToggle   = document.querySelector('.menu-toggle');
    var mobileMenu   = document.getElementById('mobileMenu');
    var lightbox     = document.getElementById('lightbox');
    var lightboxImg  = lightbox.querySelector('.lightbox-img');
    var lightboxCounter = lightbox.querySelector('.lightbox-counter');
    var videoWrapper = document.getElementById('videoWrapper');
    var videoModal   = document.getElementById('videoModal');
    var videoPlayer  = document.getElementById('videoPlayer');


    // ============================================
    // HEADER — Scroll behavior
    // ============================================
    function handleHeaderScroll() {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();


    // ============================================
    // MOBILE MENU
    // ============================================
    function toggleMobileMenu() {
        var isOpen = mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', !isOpen);
        mobileMenu.setAttribute('aria-hidden', isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    menuToggle.addEventListener('click', toggleMobileMenu);

    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (mobileMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });


    // ============================================
    // SMOOTH SCROLL for anchor links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var headerHeight = header.offsetHeight;
            var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        });
    });


    // ============================================
    // SLIDERS
    // ============================================
    document.querySelectorAll('[data-slider]').forEach(function (slider) {
        var track = slider.querySelector('.slider-track');
        var prevBtn = slider.querySelector('.slider-btn--prev');
        var nextBtn = slider.querySelector('.slider-btn--next');

        if (!track || !prevBtn || !nextBtn) return;

        function getScrollAmount() {
            var firstSlide = track.querySelector('.slider-slide');
            if (!firstSlide) return 300;
            return firstSlide.offsetWidth + 16; // width + gap
        }

        prevBtn.addEventListener('click', function () {
            track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', function () {
            track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
    });


    // ============================================
    // LIGHTBOX — Gallery, Sliders & Plans
    // ============================================
    var galleryImages = [];
    var currentIndex = 0;

    function collectGalleryImages() {
        galleryImages = [];
        var seen = {};
        // Collect from gallery items, slider slides, and plan items
        document.querySelectorAll('.gallery-item img, .slider-slide img, .plan-item img').forEach(function (img) {
            // Deduplicate by src
            if (!seen[img.src]) {
                seen[img.src] = true;
                galleryImages.push({ src: img.src, alt: img.alt });
            }
        });
    }

    collectGalleryImages();

    function openLightbox(imgSrc) {
        // Find the index matching this src
        for (var i = 0; i < galleryImages.length; i++) {
            if (galleryImages[i].src === imgSrc) {
                currentIndex = i;
                break;
            }
        }
        updateLightboxImage();
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        lightboxImg.classList.remove('loaded');
        lightboxImg.src = galleryImages[currentIndex].src;
        lightboxImg.alt = galleryImages[currentIndex].alt;
        lightboxImg.onload = function () {
            lightboxImg.classList.add('loaded');
        };
        lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
    }

    function navigateLightbox(direction) {
        currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    // Click handlers — gallery items, slider slides, plan items
    document.querySelectorAll('.gallery-item, .slider-slide, .plan-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var img = item.querySelector('img');
            if (img) openLightbox(img.src);
        });

        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var img = item.querySelector('img');
                if (img) openLightbox(img.src);
            }
        });
    });

    // Lightbox controls
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () {
        navigateLightbox(-1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () {
        navigateLightbox(1);
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open') && !videoModal.classList.contains('open')) return;

        if (lightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }

        if (videoModal.classList.contains('open')) {
            if (e.key === 'Escape') closeVideoModal();
        }
    });


    // ============================================
    // VIDEO MODAL
    // ============================================
    function openVideoModal() {
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        videoPlayer.play();
    }

    function closeVideoModal() {
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        videoPlayer.pause();
    }

    videoWrapper.addEventListener('click', openVideoModal);

    videoModal.querySelector('.video-modal-close').addEventListener('click', closeVideoModal);

    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });


    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    function initRevealAnimations() {
        var selectors = [
            '.section-header',
            '.distinction-item',
            '.lifestyle-content',
            '.lifestyle-images',
            '.keyfact',
            '.gallery-hero-img',
            '.slider-section',
            '.gallery-duo',
            '.video-wrapper',
            '.plan-item',
            '.location-content',
            '.location-visual',
            '.location-map-editorial',
            '.flexibility-card',
            '.trust-item',
            '.pricing-inner',
            '.contact-content',
            '.contact-card'
        ];

        selectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                el.classList.add('reveal');
            });
        });

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var parent = entry.target.closest('.distinction-grid, .keyfacts-grid, .flexibility-grid, .trust-grid');
                        if (parent) {
                            var siblings = parent.querySelectorAll('.reveal');
                            siblings.forEach(function (sibling, i) {
                                sibling.style.transitionDelay = (i * 0.08) + 's';
                            });
                        }
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -30px 0px'
            });

            document.querySelectorAll('.reveal').forEach(function (el) {
                observer.observe(el);
            });
        } else {
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    initRevealAnimations();


    // ============================================
    // TOUCH SWIPE for Lightbox (mobile)
    // ============================================
    var touchStartX = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            navigateLightbox(diff > 0 ? 1 : -1);
        }
    }, { passive: true });

})();

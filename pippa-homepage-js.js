// Homepage JavaScript for Pippa of London
// Handles animations, interactions, and dynamic elements on the homepage

// Homepage initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all homepage components
    initHeroAnimations();
    initScrollAnimations();
    initInteractiveElements();
    initTestimonials();
    initStatCounters();
    initParallaxEffects();
    initLoadingOptimizations();
});

// Hero Section Animations
function initHeroAnimations() {
    const hero = document.querySelector('#hero');
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    // Add entrance animations
    if (heroContent) {
        heroContent.classList.add('animate-in');
    }
    
    // Floating badges animation
    const badges = document.querySelectorAll('.floating-badge');
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Hero image loading with placeholder
    const heroImage = hero?.querySelector('img');
    if (heroImage) {
        heroImage.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    }
}

// Scroll-triggered Animations
function initScrollAnimations() {
    const animationElements = document.querySelectorAll(
        '.section-header, .step, .feature, .benefit, .stat, .tech-card'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered animation delays for grouped elements
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll(entry.target.tagName);
                const index = Array.from(siblings).indexOf(entry.target);
                
                entry.target.style.animationDelay = `${index * 0.1}s`;
                entry.target.classList.add('animate-in');
                
                // Unobserve after animation
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animationElements.forEach(el => {
        animationObserver.observe(el);
    });
}

// Interactive Elements
function initInteractiveElements() {
    // CTA Button interactions
    const ctaButtons = document.querySelectorAll('.btn');
    
    ctaButtons.forEach(button => {
        // Ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
        
        // Magnetic hover effect
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            this.style.transform = `translate(${deltaX * 5}px, ${deltaY * 5}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // How it works steps interaction
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            this.querySelector('.step-icon').style.transform = 'scale(1.2) rotate(10deg)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.querySelector('.step-icon').style.transform = '';
        });
    });
}

// Testimonials Carousel (if implemented)
function initTestimonials() {
    const testimonialSection = document.querySelector('#social-proof');
    if (!testimonialSection) return;
    
    // Simulated testimonials data
    const testimonials = [
        {
            name: "Sarah M.",
            text: "Finally found my perfect foundation shade! The AI matching is incredibly accurate.",
            rating: 5
        },
        {
            name: "Priya K.",
            text: "Love how it works for all skin tones. My deeper complexion was matched perfectly!",
            rating: 5
        },
        {
            name: "Emma L.",
            text: "No more guessing games at the beauty counter. This technology is a game-changer!",
            rating: 5
        }
    ];
    
    // Create testimonial carousel structure
    const testimonialsContainer = document.createElement('div');
    testimonialsContainer.className = 'testimonials-carousel';
    testimonialsContainer.innerHTML = `
        <div class="testimonials-track">
            ${testimonials.map((testimonial, index) => `
                <div class="testimonial-card ${index === 0 ? 'active' : ''}">
                    <div class="stars">${'★'.repeat(testimonial.rating)}</div>
                    <p>"${testimonial.text}"</p>
                    <cite>- ${testimonial.name}</cite>
                </div>
            `).join('')}
        </div>
        <div class="testimonial-dots">
            ${testimonials.map((_, index) => `
                <button class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
            `).join('')}
        </div>
    `;
    
    // Add carousel styles
    const carouselStyles = `
        <style>
            .testimonials-carousel {
                max-width: 600px;
                margin: 40px auto 0;
                position: relative;
            }
            
            .testimonials-track {
                display: flex;
                transition: transform 0.5s ease;
            }
            
            .testimonial-card {
                flex: 0 0 100%;
                padding: 30px;
                text-align: center;
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .testimonial-card.active {
                opacity: 1;
            }
            
            .testimonial-card .stars {
                color: var(--primary-gold);
                font-size: 24px;
                margin-bottom: 20px;
            }
            
            .testimonial-card p {
                font-size: 1.125rem;
                font-style: italic;
                margin-bottom: 15px;
                color: var(--charcoal);
            }
            
            .testimonial-card cite {
                color: var(--medium-gray);
                font-style: normal;
                font-weight: 500;
            }
            
            .testimonial-dots {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            }
            
            .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: none;
                background: var(--light-gray);
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .dot.active {
                background: var(--deep-rose);
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', carouselStyles);
    testimonialSection.appendChild(testimonialsContainer);
    
    // Carousel functionality
    let currentIndex = 0;
    const dots = testimonialsContainer.querySelectorAll('.dot');
    const cards = testimonialsContainer.querySelectorAll('.testimonial-card');
    
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            showTestimonial(index);
        });
    });
    
    function showTestimonial(index) {
        // Update active states
        cards[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        
        cards[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        
        // Move track
        const track = testimonialsContainer.querySelector('.testimonials-track');
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Auto-advance testimonials
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(nextIndex);
    }, 5000);
}

// Animated Stat Counters
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                animateCounter(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        countObserver.observe(stat);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const value = parseInt(text);
    const suffix = text.replace(/[0-9]/g, '');
    const duration = 2000;
    const step = value / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= value) {
            current = value;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;
    
    // Add parallax on scroll
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Loading Optimizations
function initLoadingOptimizations() {
    // Lazy load images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('lazy-loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
    
    // Preload critical assets
    const criticalAssets = [
        '/website/global.css',
        '/website/navigation.js'
    ];
    
    criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset;
        link.as = asset.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // Log performance metrics for optimization
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    });
    
    perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
}

// Export functions for use in other modules
window.homepageAPI = {
    animateCounter,
    initScrollAnimations,
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add required CSS for animations
const animationStyles = `
<style>
    .animate-in {
        animation: fadeInUp 0.8s ease-out both;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        background: var(--white);
        box-shadow: var(--shadow-lg);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid var(--success);
    }
    
    .notification-error {
        border-left: 4px solid var(--error);
    }
    
    .notification-info {
        border-left: 4px solid var(--info);
    }
    
    img.lazy-loaded {
        animation: fadeIn 0.5s ease-out;
    }
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);
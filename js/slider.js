/**
 * TOLEX RESTAURANT - Premium Slider Revolution Style Engine
 * Cinematic animated hero slider with Ken Burns zoom, line reveal text,
 * layered parallax, slide progress timer, pause-on-hover, and touch support.
 */

class TolexHeroSlider {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.options = Object.assign({
      duration: 7000, // 7 seconds per slide
      autoplay: true,
      pauseOnHover: true,
      kenBurns: true
    }, options);

    this.slides = Array.from(this.container.querySelectorAll('.hero-slide'));
    this.totalSlides = this.slides.length;
    if (this.totalSlides === 0) return;

    this.currentIndex = 0;
    this.timer = null;
    this.timerStartTime = 0;
    this.timeRemaining = this.options.duration;
    this.isPaused = false;
    this.isTransitioning = false;

    // Controls
    this.prevBtn = this.container.querySelector('.slider-nav-prev');
    this.nextBtn = this.container.querySelector('.slider-nav-next');
    this.indicators = Array.from(this.container.querySelectorAll('.slider-indicator-item'));
    this.progressBar = this.container.querySelector('.slider-progress-fill');
    this.counterCurrent = this.container.querySelector('.slider-counter-current');
    this.counterTotal = this.container.querySelector('.slider-counter-total');

    // Touch support
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    if (this.counterTotal) {
      this.counterTotal.textContent = String(this.totalSlides).padStart(2, '0');
    }

    // Set initial active slide
    this.goToSlide(0, false);

    // Event Listeners
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prev();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.next();
      });
    }

    // Indicator clicks
    this.indicators.forEach((indicator, idx) => {
      indicator.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentIndex !== idx && !this.isTransitioning) {
          this.goToSlide(idx);
        }
      });
    });

    // Pause on hover
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pause());
      this.container.addEventListener('mouseleave', () => this.resume());
    }

    // Touch events for mobile
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Only trigger if slider is in viewport
      const rect = this.container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Handle visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    const minSwipe = 45;
    if (Math.abs(swipeDistance) > minSwipe) {
      if (swipeDistance < 0) {
        this.next(); // swipe left -> next slide
      } else {
        this.prev(); // swipe right -> prev slide
      }
    }
  }

  goToSlide(index, animate = true) {
    if (this.isTransitioning && animate) return;
    this.isTransitioning = true;

    // Normalize index
    let nextIndex = index;
    if (nextIndex >= this.totalSlides) nextIndex = 0;
    if (nextIndex < 0) nextIndex = this.totalSlides - 1;

    // Deactivate previous slide
    this.slides.forEach((slide, i) => {
      if (i !== nextIndex) {
        slide.classList.remove('is-active', 'ken-burns-active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Activate next slide
    const activeSlide = this.slides[nextIndex];
    activeSlide.classList.add('is-active');
    activeSlide.setAttribute('aria-hidden', 'false');

    // Trigger Ken Burns zoom effect
    if (this.options.kenBurns && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Force repaint to reset CSS animation smoothly
      void activeSlide.offsetWidth;
      activeSlide.classList.add('ken-burns-active');
    }

    // Update Counter
    if (this.counterCurrent) {
      this.counterCurrent.textContent = String(nextIndex + 1).padStart(2, '0');
    }

    // Update Indicators
    this.indicators.forEach((ind, i) => {
      if (i === nextIndex) {
        ind.classList.add('is-active');
        ind.setAttribute('aria-selected', 'true');
      } else {
        ind.classList.remove('is-active');
        ind.setAttribute('aria-selected', 'false');
      }
    });

    this.currentIndex = nextIndex;

    // Reset transition lock after slide animation begins
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);

    // Restart Autoplay Timer
    this.resetTimer();
  }

  next() {
    this.goToSlide(this.currentIndex + 1);
  }

  prev() {
    this.goToSlide(this.currentIndex - 1);
  }

  resetTimer() {
    this.clearTimer();
    this.timeRemaining = this.options.duration;
    this.startProgressAnimation();

    if (this.options.autoplay && !this.isPaused) {
      this.timerStartTime = Date.now();
      this.timer = setTimeout(() => {
        this.next();
      }, this.timeRemaining);
    }
  }

  startProgressAnimation() {
    if (!this.progressBar) return;

    // Reset progress bar width
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = '0%';

    // Animate forward smoothly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!this.isPaused) {
          this.progressBar.style.transition = `width ${this.options.duration}ms linear`;
          this.progressBar.style.width = '100%';
        }
      });
    });
  }

  pause() {
    if (this.isPaused) return;
    this.isPaused = true;

    // Calculate remaining time
    const elapsed = Date.now() - this.timerStartTime;
    this.timeRemaining = Math.max(0, this.timeRemaining - elapsed);
    this.clearTimer();

    // Pause CSS animation on progress bar
    if (this.progressBar) {
      const computedStyle = window.getComputedStyle(this.progressBar);
      const currentWidth = computedStyle.getPropertyValue('width');
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = currentWidth;
    }

    // Add pause indicator class
    this.container.classList.add('slider-paused');
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.container.classList.remove('slider-paused');

    if (this.options.autoplay && this.timeRemaining > 0) {
      this.timerStartTime = Date.now();

      // Resume progress bar animation
      if (this.progressBar) {
        this.progressBar.style.transition = `width ${this.timeRemaining}ms linear`;
        this.progressBar.style.width = '100%';
      }

      this.timer = setTimeout(() => {
        this.next();
      }, this.timeRemaining);
    } else {
      this.resetTimer();
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy() {
    this.clearTimer();
  }
}

// Global initialization helper
document.addEventListener('DOMContentLoaded', () => {
  const heroSliderEl = document.querySelector('.hero-slider-container');
  if (heroSliderEl) {
    window.tolexSlider = new TolexHeroSlider('.hero-slider-container', {
      duration: 6500,
      autoplay: true,
      pauseOnHover: true,
      kenBurns: true
    });
  }
});

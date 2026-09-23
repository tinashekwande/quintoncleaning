(function() {
  'use strict';
  
  // Ensure init runs even if DOMContentLoaded has already fired
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initScrollAnimations();
    initHeaderScroll();
    initContactForm();
    initCopyrightYear();
    initGallery();
    initLightbox();
  }
  
  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu-close');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (!toggle || !menu) return;
    
    const focusableElements = menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements.length ? focusableElements[0] : null;
    const lastFocusable = focusableElements.length ? focusableElements[focusableElements.length - 1] : null;

    function openMenu() {
      menu.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }

    toggle.addEventListener('click', openMenu);
    
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
      }
      
      if (e.key === 'Tab' && menu.classList.contains('is-open') && firstFocusable && lastFocusable) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
    
    const navLinks = menu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  function initSmoothScroll() {
    const headerHeight = 72;
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    
    if (!sections.length || !navLinks.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.4 });
    
    sections.forEach(section => observer.observe(section));
  }

  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }
    
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    elements.forEach(el => observer.observe(el));
  }

  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initContactForm() {
    const form = document.getElementById('quote-form');
    if (!form) return;
    
    let isSubmitting = false;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      const formGroups = form.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const error = group.querySelector('.form-error');
        if (input) input.classList.remove('error');
        if (error) error.classList.remove('visible');
      });
      
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        showSuccess();
        return;
      }
      
      let isValid = true;
      let firstInvalid = null;
      
      const nameInput = form.querySelector('[name="name"]');
      if (nameInput) {
        const nameVal = nameInput.value.trim();
        if (nameVal.length < 2) {
          showError(nameInput, 'Name must be at least 2 characters');
          isValid = false;
          if (!firstInvalid) firstInvalid = nameInput;
        }
      }
      
      const phoneInput = form.querySelector('[name="phone"]');
      if (phoneInput) {
        const phoneVal = phoneInput.value.trim().replace(/[\s\-]/g, '');
        if (!/^\d{10}$/.test(phoneVal)) {
          showError(phoneInput, 'Please enter a valid 10-digit South African phone number');
          isValid = false;
          if (!firstInvalid) firstInvalid = phoneInput;
        }
      }
      
      const serviceInput = form.querySelector('[name="service"]');
      if (serviceInput) {
        if (serviceInput.value.trim() === '') {
          showError(serviceInput, 'Please select a service');
          isValid = false;
          if (!firstInvalid) firstInvalid = serviceInput;
        }
      }
      
      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      
      isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      
      const messageInput = form.querySelector('[name="message"]');
      
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const service = serviceInput ? serviceInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      
      let whatsappMsg = `Hi, I'd like to request a quote from Quinton Chinoz Projects.\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nMessage: ${message}`;
      const encodedMsg = encodeURIComponent(whatsappMsg);
      const whatsappUrl = `https://wa.me/27677352364?text=${encodedMsg}`;
      
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => {
        showSuccess();
      }, 1000);
      
      setTimeout(() => {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }, 3000);
    });
    
    function showError(input, message) {
      if (!input) return;
      input.classList.add('error');
      const group = input.closest('.form-group');
      if (group) {
        const errorSpan = group.querySelector('.form-error');
        if (errorSpan) {
          errorSpan.textContent = message;
          errorSpan.classList.add('visible');
        }
      }
    }
    
    function showSuccess() {
      form.style.display = 'none';
      const successMsg = document.querySelector('.form-success');
      if (successMsg) {
        successMsg.classList.add('visible');
      }
      form.reset();
    }
  }

  function initCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  function initGallery() {
    const filterBar = document.querySelector('.gallery-filter-bar');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const cards = document.querySelectorAll('.gallery-card');

    if (!filterBtns.length || !cards.length) return;

    function applyFilter(selectedFilter, clickedBtn) {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      if (clickedBtn) {
        clickedBtn.classList.add('active');
        clickedBtn.setAttribute('aria-selected', 'true');
      }

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (selectedFilter === 'all' || category === selectedFilter) {
          card.classList.remove('is-hidden');
          card.classList.add('is-visible');
          card.style.display = '';
        } else {
          card.classList.add('is-hidden');
          card.classList.remove('is-visible');
          card.style.display = 'none';
        }
      });
    }

    // Direct click listeners on buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const filter = this.getAttribute('data-filter') || 'all';
        applyFilter(filter, this);
      });
    });

    // Delegation on filter bar container
    if (filterBar) {
      filterBar.addEventListener('click', function(e) {
        const btn = e.target.closest('.gallery-filter-btn');
        if (btn) {
          e.preventDefault();
          const filter = btn.getAttribute('data-filter') || 'all';
          applyFilter(filter, btn);
        }
      });
    }
  }

  function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const cat = document.getElementById('lightbox-category');
    const counter = document.getElementById('lightbox-counter');
    const quoteBtn = document.getElementById('lightbox-quote-btn');
    const prevBtn = modal.querySelector('.lightbox-prev');
    const nextBtn = modal.querySelector('.lightbox-next');
    const closeBtn = modal.querySelector('.lightbox-close-btn');
    const backdrop = modal.querySelector('.lightbox-backdrop');

    let currentCards = [];
    let currentIndex = 0;
    let lastFocused = null;

    function getVisibleCards() {
      return Array.from(document.querySelectorAll('.gallery-card')).filter(card => {
        return !card.classList.contains('is-hidden') && card.style.display !== 'none';
      });
    }

    function showItem(idx) {
      currentCards = getVisibleCards();
      if (!currentCards.length) return;
      if (idx < 0) idx = currentCards.length - 1;
      if (idx >= currentCards.length) idx = 0;
      currentIndex = idx;

      const card = currentCards[currentIndex];
      const cardImg = card.querySelector('.gallery-card-img');
      const fullSrc = cardImg ? (cardImg.getAttribute('data-full') || cardImg.src) : '';
      const cardTitle = card.querySelector('.gallery-card-title')?.textContent?.trim() || 'Cleaning Project';
      const cardDesc = card.querySelector('.gallery-card-desc')?.textContent?.trim() || '';
      const cardCat = card.querySelector('.gallery-category-pill')?.textContent?.trim() || '';

      if (img) {
        img.style.opacity = '0.3';
        img.src = fullSrc;
        img.alt = cardTitle;
        img.onload = function() {
          img.style.opacity = '1';
        };
        setTimeout(() => {
          if (img) img.style.opacity = '1';
        }, 120);
      }

      if (title) title.textContent = cardTitle;
      if (desc) desc.textContent = cardDesc;
      if (cat) cat.textContent = cardCat;
      if (counter) counter.textContent = `${currentIndex + 1} / ${currentCards.length}`;

      if (quoteBtn) {
        const msg = encodeURIComponent(`Hi Quinton Chinoz Projects, I saw "${cardTitle}" in your project gallery and would like to enquire about a similar cleaning service.`);
        quoteBtn.href = `https://wa.me/27677352364?text=${msg}`;
      }
    }

    function openLightbox(clickedCard) {
      currentCards = getVisibleCards();
      currentIndex = currentCards.indexOf(clickedCard);
      if (currentIndex === -1) currentIndex = 0;

      lastFocused = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      showItem(currentIndex);
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    // Grid event delegation for card clicks
    const grid = document.getElementById('gallery-grid');
    if (grid) {
      grid.addEventListener('click', function(e) {
        const card = e.target.closest('.gallery-card');
        if (card && !card.classList.contains('is-hidden')) {
          e.preventDefault();
          openLightbox(card);
        }
      });
    }

    // Direct card click handlers as secondary guarantee
    document.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', function(e) {
        e.preventDefault();
        openLightbox(this);
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(this);
        }
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showItem(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showItem(currentIndex + 1);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeLightbox();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
      if (e.key === 'ArrowRight') showItem(currentIndex + 1);
    });
  }

})();

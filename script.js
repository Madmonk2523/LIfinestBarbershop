/* ============================================================
   L.I. FINEST BARBER SHOP — SCRIPT
   Hicksville, NY
   ============================================================ */

(function () {
  'use strict';

  /* ── Footer year ──────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sticky header scroll state ───────────────────────── */
  const header = document.getElementById('site-header');

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Hamburger / Mobile Menu ───────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', function () {
    const isOpen = !mobileMenu.classList.contains('open');
    if (isOpen) {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
    } else {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  // Close menu when any mobile link is clicked
  document.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (
      mobileMenu.classList.contains('open') &&
      !header.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  /* ── Smooth Scroll (offset for sticky header) ─────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight - 4;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ── Scroll Reveal (IntersectionObserver) ────────────── */
  // Content stays visible if JavaScript or IntersectionObserver is unavailable.
  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      // Never hide content already on screen while the page initializes.
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        el.classList.add('reveal-pending');
        revealObserver.observe(el);
      }
    });
  }

  /* ── Gallery Lightbox ─────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const closeBtn     = document.getElementById('lightbox-close');
  const prevBtn      = document.getElementById('lightbox-prev');
  const nextBtn      = document.getElementById('lightbox-next');

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex   = 0;
  let imageTimer;
  let openingItem;

  function openLightbox(index) {
    clearTimeout(imageTimer);
    openingItem = galleryItems[index];
    lightboxImg.style.opacity = '1';
    currentIndex = index;
    const img    = galleryItems[index].querySelector('.gallery-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    updateNavButtons();
  }

  function closeLightbox() {
    clearTimeout(imageTimer);
    lightboxImg.style.opacity = '1';
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Restore focus to the item that opened it
    if (openingItem) openingItem.focus();
    // Clear src after animation ends
    setTimeout(function () {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.src = '';
        lightboxImg.alt = '';
      }
    }, 320);
  }

  function showImage(index) {
    if (index < 0 || index >= galleryItems.length) return;
    currentIndex = index;
    const img = galleryItems[index].querySelector('.gallery-img');
    // Cancel a pending transition when navigating quickly.
    clearTimeout(imageTimer);
    lightboxImg.style.opacity = '0';
    imageTimer = setTimeout(function () {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.opacity = '1';
    }, 150);
    updateNavButtons();
  }

  function updateNavButtons() {
    prevBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    nextBtn.style.visibility = currentIndex === galleryItems.length - 1 ? 'hidden' : 'visible';
  }

  // Attach click handlers to each gallery item
  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () { openLightbox(index); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click',  function () { showImage(currentIndex - 1); });
  nextBtn.addEventListener('click',  function () { showImage(currentIndex + 1); });

  // Click outside image to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard: Escape to close, arrows to navigate
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      { closeLightbox(); }
    if (e.key === 'ArrowRight')  { showImage(currentIndex + 1); }
    if (e.key === 'ArrowLeft')   { showImage(currentIndex - 1); }
  });

  /* ── Touch/swipe support for lightbox ────────────────── */
  let touchStartX = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showImage(currentIndex + 1); // swipe left → next
      } else {
        showImage(currentIndex - 1); // swipe right → prev
      }
    }
  }, { passive: true });

  /* ── Highlight active nav link on scroll ─────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function setActiveNav() {
    const scrollPos = window.scrollY + header.offsetHeight + 60;
    let activeId = '';

    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) {
        activeId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('nav-active', link.getAttribute('href') === '#' + activeId);
    });
    mobileLinks.forEach(function (link) {
      link.classList.toggle('nav-active', link.getAttribute('href') === '#' + activeId);
    });
  }

  window.addEventListener('scroll', setActiveNav, { passive: true });

})();

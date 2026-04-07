/**
 * GamingHub — main.js
 * Handles mobile nav, lazy-loading of non-hero images, and image fallback.
 */

// ─── Mobile Nav Toggle ────────────────────────────────────────────────────────
(function initMobileNav() {
  var header = document.getElementById('site-header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is clicked (single-page navigation)
  var navLinks = header.querySelectorAll('.site-nav a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}());

// ─── Lazy Load (Req 7.1) ──────────────────────────────────────────────────────
// Uses IntersectionObserver to swap data-src → src on non-hero images.
// Hero images use src directly (loading="eager") and are excluded.

(function initLazyLoad() {
  const lazyImages = Array.from(
    document.querySelectorAll('img[data-src]:not(.post-hero-img)')
  );

  if (!lazyImages.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    lazyImages.forEach(function (img) { observer.observe(img); });
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}());

// ─── Image Fallback (Req 5.4) ─────────────────────────────────────────────────
// On load error, replaces <img> with a styled <div class="img-fallback">
// showing the image's alt text.

(function initImageFallback() {
  function handleImgError(img) {
    const alt = img.getAttribute('alt') || '';
    const fallback = document.createElement('div');
    fallback.className = 'img-fallback';
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', alt);
    fallback.textContent = alt;
    // Preserve dimensions if set
    if (img.width) fallback.style.width = img.width + 'px';
    if (img.height) fallback.style.height = img.height + 'px';
    img.parentNode.replaceChild(fallback, img);
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () { handleImgError(img); }, { once: true });
  });
}());

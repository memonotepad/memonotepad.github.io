// Header Component
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <nav class="nav-container" role="navigation" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Memo Notepad Home">
        <span class="logo-icon">📝</span>
        <span class="logo-text">Memo<strong>Notepad</strong></span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navMenu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navMenu" role="list">
        <li><a href="/" class="nav-link">Home</a></li>
        <li><a href="/diary" class="nav-link">Diary</a></li>
        <li><a href="/case-converter" class="nav-link">Case Converter</a></li>
        <li><a href="/decision-maker" class="nav-link">Choice Maker</a></li>
        <li><a href="/random-text" class="nav-link">Random Text</a></li>
        <li><a href="/blog" class="nav-link">Blog</a></li>
        <li><a href="/about" class="nav-cta">About</a></li>
      </ul>
    </nav>
  `;

  // Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile toggle
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active section highlight
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();

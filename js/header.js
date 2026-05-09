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
        <li><a href="#features" class="nav-link">Features</a></li>
        <li><a href="#app" class="nav-link">Open App</a></li>
        <li><a href="#how-it-works" class="nav-link">How It Works</a></li>
        <li><a href="#use-cases" class="nav-link">Use Cases</a></li>
        <li><a href="#faq" class="nav-link">FAQ</a></li>
        <li><a href="#app" class="nav-cta">Start Writing Free</a></li>
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

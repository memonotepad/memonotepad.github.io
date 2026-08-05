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
        <!-- All Tools Dropdown -->
        <li class="dropdown">
          <button class="nav-link dropdown-toggle" id="dropdownToggle" aria-haspopup="true" aria-expanded="false" aria-controls="dropdownMenu">
            All Tools <span class="dropdown-arrow">▾</span>
          </button>
          <ul class="dropdown-menu" id="dropdownMenu" role="menu" aria-label="Tools">
            <li><a href="/case-converter" class="dropdown-link" role="menuitem">Case Converter</a></li>
            <li><a href="/decision-maker" class="dropdown-link" role="menuitem">Choice Maker</a></li>
            <li><a href="/random-text" class="dropdown-link" role="menuitem">Random Text</a></li>
            <li><a href="/word-shuffler" class="dropdown-link" role="menuitem">Word Shuffle</a></li>
            <li><a href="/dream-journal" class="dropdown-link" role="menuitem">Dream Journal</a></li>
            <li><a href="/list-maker" class="dropdown-link" role="menuitem">Make A List</a></li>
            <li><a href="/notepad" class="dropdown-link" role="menuitem">Notepad Editor</a></li>
          </ul>
        </li>
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
    
    // Close dropdown when closing mobile menu
    if (!open) {
      const dropdownMenu = document.getElementById('dropdownMenu');
      const dropdownToggle = document.getElementById('dropdownToggle');
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Dropdown toggle - works on both desktop and mobile
  const dropdownToggle = document.getElementById('dropdownToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  let dropdownOpen = false;

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownOpen = !dropdownOpen;
    dropdownMenu.classList.toggle('open', dropdownOpen);
    dropdownToggle.setAttribute('aria-expanded', dropdownOpen);
  };

  // Click handler for dropdown toggle
  dropdownToggle.addEventListener('click', toggleDropdown);

  // Touch support for mobile
  dropdownToggle.addEventListener('touchstart', (e) => {
    // Allow touch to work the same as click
  }, { passive: true });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      dropdownMenu.classList.remove('open');
      dropdownOpen = false;
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownOpen) {
      dropdownMenu.classList.remove('open');
      dropdownOpen = false;
      dropdownToggle.setAttribute('aria-expanded', 'false');
      dropdownToggle.focus();
    }
  });

  // Close dropdown on link click (especially important for mobile)
  dropdownMenu.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
      dropdownOpen = false;
      dropdownToggle.setAttribute('aria-expanded', 'false');
      
      // Close mobile menu if open
      if (window.innerWidth <= 768 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close mobile menu on nav link click
  menu.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Close mobile menu on desktop
      if (window.innerWidth > 768 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }, 250);
  });

  // Active section highlight
  const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
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

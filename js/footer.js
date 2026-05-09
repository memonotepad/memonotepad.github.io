// Footer Component
(function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="Memo Notepad Home">
          <span class="logo-icon">📝</span>
          <span class="logo-text">Memo<strong>Notepad</strong></span>
        </a>
        <p class="footer-tagline">Your thoughts, organised online.<br>Free memo notepad for everyone.</p>
        <div class="footer-badges">
          <span class="badge">🔒 Private</span>
          <span class="badge">⚡ Fast</span>
          <span class="badge">☁️ Online</span>
          <span class="badge">📱 Mobile</span>
        </div>
      </div>

      <div class="footer-links-group">
        <h3>Product</h3>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#app">Open Notepad</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#use-cases">Use Cases</a></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h3>Resources</h3>
        <ul>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#tips">Writing Tips</a></li>
          <li><a href="#keyboard">Keyboard Shortcuts</a></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h3>About</h3>
        <ul>
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="/terms.html">Terms of Service</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${year} <a href="https://memonotepad.github.io">MemoNotepad.github.io</a> — Free Online Memo Notepad. All rights reserved.</p>
      <p class="footer-keywords">memo notepad · online notepad · memo pads online · my memo notepad</p>
    </div>
  `;
})();

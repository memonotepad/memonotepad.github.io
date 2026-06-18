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
        <h3>MemoPad</h3>
        <ul>
          <li><a href="/#features">Features</a></li>
          <li><a href="/#app">Open Notepad</a></li>
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#use-cases">Use Cases</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h3>More Tools</h3>
        <ul>
        <li><a href="/diary">Diary</a></li>
        <li><a href="/case-converter">Case Converter</a></li>
        <li><a href="/decision-maker">Choice Maker</a></li>
        <li><a href="/random-text">Random Text</a></li>
        <li><a href="/word-shuffler">Word Shuffle</a></li>
        <li><a href="/dream-journal">Dream Journal</a></li>
        <li><a href="/list-maker">Make A List</a></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h3>Pages</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Use</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${year} <a href="https://memonotepad.github.io">MemoNotepad.github.io</a> — Free Online Memo Notepad. All rights reserved.</p>
      <p class="footer-keywords">memo notepad · online notepad · memo pads online · my memo notepad</p>
    </div>
  `;
})();

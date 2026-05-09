// Memo Notepad — Main App Logic

(function () {
  /* ─────────────── STATE ─────────────── */
  let memos = JSON.parse(localStorage.getItem('memoNotepadMemos') || '[]');
  let activeMemoId = localStorage.getItem('activeMemoId') || null;
  let searchQuery = '';
  let sortMode = 'updated'; // 'updated' | 'created' | 'alpha'
  let filterColor = null;
  let wordWrap = JSON.parse(localStorage.getItem('wordWrap') ?? 'true');
  let fontSize = parseInt(localStorage.getItem('fontSize') || '15');
  let autoSaveTimer = null;
  let isDirty = false;

  const COLORS = ['#fff9db','#d3f9d8','#d0ebff','#f3d9fa','#ffe8cc','#ffc9c9','#e9ecef'];
  const COLOR_NAMES = ['Yellow','Green','Blue','Purple','Orange','Red','Grey'];

  /* ─────────────── DOM REFS ─────────────── */
  const memoList     = document.getElementById('memoList');
  const editor       = document.getElementById('memoEditor');
  const titleInput   = document.getElementById('memoTitle');
  const charCount    = document.getElementById('charCount');
  const wordCountEl  = document.getElementById('wordCountEl');
  const searchInput  = document.getElementById('searchInput');
  const newMemoBtn   = document.getElementById('newMemoBtn');
  const deleteMemoBtn= document.getElementById('deleteMemoBtn');
  const exportBtn    = document.getElementById('exportBtn');
  const copyBtn      = document.getElementById('copyBtn');
  const printBtn     = document.getElementById('printBtn');
  const sortSelect   = document.getElementById('sortSelect');
  const colorPicker  = document.getElementById('colorPicker');
  const filterColorBtns = document.querySelectorAll('.filter-color');
  const wrapToggle   = document.getElementById('wrapToggle');
  const fontSizeEl   = document.getElementById('fontSize');
  const saveStatus   = document.getElementById('saveStatus');
  const memoCount    = document.getElementById('memoCount');
  const emptyState   = document.getElementById('emptyState');
  const editorPanel  = document.getElementById('editorPanel');
  const welcomePanel = document.getElementById('welcomePanel');
  const importBtn    = document.getElementById('importBtn');
  const importFile   = document.getElementById('importFile');
  const clearAllBtn  = document.getElementById('clearAllBtn');
  const undoBtn      = document.getElementById('undoBtn');
  const findInput    = document.getElementById('findInput');
  const findCount    = document.getElementById('findCount');

  /* ─────────────── INIT ─────────────── */
  function init() {
    if (memos.length === 0) createMemo(true);
    else {
      if (!activeMemoId || !memos.find(m => m.id === activeMemoId)) {
        activeMemoId = memos[0].id;
      }
      renderList();
      openMemo(activeMemoId);
    }
    applyEditorPrefs();
    renderColorPicker();
    updateMemoCount();
  }

  /* ─────────────── MEMO CRUD ─────────────── */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function createMemo(silent = false) {
    const memo = {
      id: generateId(),
      title: 'Untitled Memo',
      content: '',
      color: COLORS[0],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      pinned: false,
    };
    memos.unshift(memo);
    saveMemos();
    renderList();
    openMemo(memo.id);
    if (!silent) titleInput.select();
    updateMemoCount();
  }

  function deleteMemo(id) {
    if (!confirm('Delete this memo? This cannot be undone.')) return;
    memos = memos.filter(m => m.id !== id);
    if (memos.length === 0) {
      activeMemoId = null;
      showWelcome();
    } else {
      activeMemoId = memos[0].id;
      openMemo(activeMemoId);
    }
    saveMemos();
    renderList();
    updateMemoCount();
  }

  function openMemo(id) {
    const memo = memos.find(m => m.id === id);
    if (!memo) return;
    activeMemoId = id;
    localStorage.setItem('activeMemoId', id);
    titleInput.value = memo.title;
    editor.value = memo.content;
    if (colorPicker) setActiveColor(memo.color);
    updateCounts();
    showEditor();
    renderList(); // re-highlight active
    isDirty = false;
    setSaveStatus('saved');
  }

  function saveMemos() {
    localStorage.setItem('memoNotepadMemos', JSON.stringify(memos));
  }

  function saveActiveMemo() {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) return;
    memo.title = titleInput.value.trim() || 'Untitled Memo';
    memo.content = editor.value;
    memo.updated = new Date().toISOString();
    saveMemos();
    renderList();
    isDirty = false;
    setSaveStatus('saved');
  }

  /* ─────────────── RENDER LIST ─────────────── */
  function getSortedFiltered() {
    let list = [...memos];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
      );
    }
    if (filterColor) list = list.filter(m => m.color === filterColor);

    // Pinned first
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      if (sortMode === 'alpha') return a.title.localeCompare(b.title);
      if (sortMode === 'created') return new Date(b.created) - new Date(a.created);
      return new Date(b.updated) - new Date(a.updated);
    });
    return list;
  }

  function renderList() {
    const list = getSortedFiltered();
    memoList.innerHTML = '';

    if (list.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
    }

    list.forEach(memo => {
      const li = document.createElement('li');
      li.className = 'memo-item' + (memo.id === activeMemoId ? ' active' : '') + (memo.pinned ? ' pinned' : '');
      li.setAttribute('data-id', memo.id);
      li.style.setProperty('--memo-color', memo.color);
      const preview = memo.content.replace(/\s+/g, ' ').slice(0, 80) || 'Empty memo...';
      const date = formatDate(memo.updated);
      li.innerHTML = `
        <div class="memo-item-color"></div>
        <div class="memo-item-body">
          <div class="memo-item-header">
            <span class="memo-item-title">${escHtml(memo.title)}</span>
            <span class="memo-item-date">${date}</span>
          </div>
          <span class="memo-item-preview">${escHtml(preview)}</span>
        </div>
        <div class="memo-item-actions">
          <button class="pin-btn ${memo.pinned ? 'pinned' : ''}" title="${memo.pinned ? 'Unpin' : 'Pin'}" data-id="${memo.id}">📌</button>
          <button class="del-btn" title="Delete" data-id="${memo.id}">🗑</button>
        </div>
      `;
      li.addEventListener('click', (e) => {
        if (e.target.closest('.del-btn')) { deleteMemo(memo.id); return; }
        if (e.target.closest('.pin-btn')) { togglePin(memo.id); return; }
        openMemo(memo.id);
      });
      memoList.appendChild(li);
    });
  }

  function togglePin(id) {
    const memo = memos.find(m => m.id === id);
    if (memo) { memo.pinned = !memo.pinned; saveMemos(); renderList(); }
  }

  /* ─────────────── EDITOR UI ─────────────── */
  function showEditor() {
    welcomePanel.style.display = 'none';
    editorPanel.style.display = 'flex';
  }
  function showWelcome() {
    editorPanel.style.display = 'none';
    welcomePanel.style.display = 'flex';
  }

  function updateCounts() {
    const text = editor.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCount.textContent = chars.toLocaleString() + ' chars';
    wordCountEl.textContent = words.toLocaleString() + ' words';
  }

  function setSaveStatus(status) {
    if (status === 'saving') {
      saveStatus.textContent = '⏳ Saving…';
      saveStatus.className = 'save-status saving';
    } else {
      saveStatus.textContent = '✅ Saved';
      saveStatus.className = 'save-status saved';
    }
  }

  function updateMemoCount() {
    if (memoCount) memoCount.textContent = memos.length + ' memo' + (memos.length !== 1 ? 's' : '');
  }

  /* ─────────────── EDITOR PREFS ─────────────── */
  function applyEditorPrefs() {
    editor.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
    editor.style.overflowX = wordWrap ? 'hidden' : 'auto';
    if (wrapToggle) wrapToggle.textContent = wordWrap ? '↵ Wrap ON' : '↵ Wrap OFF';
    editor.style.fontSize = fontSize + 'px';
    if (fontSizeEl) fontSizeEl.textContent = fontSize + 'px';
  }

  /* ─────────────── COLOR PICKER ─────────────── */
  function renderColorPicker() {
    if (!colorPicker) return;
    colorPicker.innerHTML = '';
    COLORS.forEach((color, i) => {
      const btn = document.createElement('button');
      btn.className = 'color-dot';
      btn.style.background = color;
      btn.title = COLOR_NAMES[i];
      btn.setAttribute('aria-label', `Set memo color to ${COLOR_NAMES[i]}`);
      btn.addEventListener('click', () => setMemoColor(color));
      colorPicker.appendChild(btn);
    });
  }

  function setActiveColor(color) {
    if (!colorPicker) return;
    colorPicker.querySelectorAll('.color-dot').forEach(b => {
      b.classList.toggle('active', b.style.background === color || b.style.backgroundColor === color);
    });
    editorPanel.style.setProperty('--active-memo-color', color);
  }

  function setMemoColor(color) {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) return;
    memo.color = color;
    saveMemos();
    setActiveColor(color);
    renderList();
  }

  /* ─────────────── EXPORT / IMPORT ─────────────── */
  function exportMemo() {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) return;
    const blob = new Blob([`${memo.title}\n${'─'.repeat(40)}\n\n${memo.content}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (memo.title.replace(/[^a-z0-9]/gi, '_') || 'memo') + '.txt';
    a.click();
  }

  function exportAllMemos() {
    const data = JSON.stringify(memos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'all_memos_backup.json';
    a.click();
  }

  function importMemos(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (!confirm(`Import ${imported.length} memos? They will be added to your existing memos.`)) return;
          imported.forEach(m => {
            if (!memos.find(x => x.id === m.id)) memos.push(m);
          });
          saveMemos();
          renderList();
          updateMemoCount();
          showToast('✅ Memos imported successfully!');
        } else {
          showToast('❌ Invalid file format.');
        }
      } catch { showToast('❌ Could not parse file.'); }
    };
    reader.readAsText(file);
  }

  /* ─────────────── FIND IN MEMO ─────────────── */
  let findMatches = 0;
  function findInMemo(q) {
    if (!q) { findCount.textContent = ''; return; }
    const text = editor.value.toLowerCase();
    const term = q.toLowerCase();
    let count = 0;
    let pos = 0;
    while ((pos = text.indexOf(term, pos)) !== -1) { count++; pos += term.length; }
    findCount.textContent = count ? `${count} match${count !== 1 ? 'es' : ''}` : 'No matches';
  }

  /* ─────────────── KEYBOARD SHORTCUTS ─────────────── */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey)) {
      if (e.key === 's') { e.preventDefault(); saveActiveMemo(); showToast('Memo saved!'); }
      if (e.key === 'n') { e.preventDefault(); createMemo(); }
      if (e.key === 'd' && e.shiftKey) { e.preventDefault(); if (activeMemoId) deleteMemo(activeMemoId); }
    }
  });

  /* ─────────────── TOAST ─────────────── */
  function showToast(msg, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  /* ─────────────── HELPERS ─────────────── */
  function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─────────────── EVENT LISTENERS ─────────────── */
  newMemoBtn.addEventListener('click', () => createMemo());

  deleteMemoBtn.addEventListener('click', () => {
    if (activeMemoId) deleteMemo(activeMemoId);
  });

  editor.addEventListener('input', () => {
    updateCounts();
    isDirty = true;
    setSaveStatus('saving');
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveActiveMemo, 800);
  });

  titleInput.addEventListener('input', () => {
    isDirty = true;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveActiveMemo, 800);
  });

  if (exportBtn) exportBtn.addEventListener('click', exportMemo);

  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(editor.value).then(() => showToast('📋 Copied to clipboard!'));
  });

  if (printBtn) printBtn.addEventListener('click', () => {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${escHtml(memo.title)}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.7;color:#222;}h1{border-bottom:2px solid #ccc;padding-bottom:10px;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><h1>${escHtml(memo.title)}</h1><pre>${escHtml(memo.content)}</pre></body></html>`);
    w.document.close();
    w.print();
  });

  if (sortSelect) sortSelect.addEventListener('change', () => {
    sortMode = sortSelect.value;
    renderList();
  });

  if (searchInput) searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderList();
  });

  if (wrapToggle) wrapToggle.addEventListener('click', () => {
    wordWrap = !wordWrap;
    localStorage.setItem('wordWrap', JSON.stringify(wordWrap));
    applyEditorPrefs();
  });

  // Font size controls
  document.getElementById('fontIncrease')?.addEventListener('click', () => {
    fontSize = Math.min(fontSize + 1, 24);
    localStorage.setItem('fontSize', fontSize);
    applyEditorPrefs();
  });
  document.getElementById('fontDecrease')?.addEventListener('click', () => {
    fontSize = Math.max(fontSize - 1, 11);
    localStorage.setItem('fontSize', fontSize);
    applyEditorPrefs();
  });

  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      if (e.target.files[0]) importMemos(e.target.files[0]);
      importFile.value = '';
    });
  }

  document.getElementById('exportAllBtn')?.addEventListener('click', exportAllMemos);

  if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
    if (confirm('Clear ALL memos? This cannot be undone!')) {
      memos = [];
      activeMemoId = null;
      saveMemos();
      renderList();
      showWelcome();
      updateMemoCount();
    }
  });

  if (findInput) {
    findInput.addEventListener('input', () => findInMemo(findInput.value));
  }

  // Mobile: swipe to show list
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    const sidebar = document.getElementById('appSidebar');
    if (!sidebar) return;
    if (diff > 60) sidebar.classList.add('mobile-open');
    if (diff < -60) sidebar.classList.remove('mobile-open');
  });

  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('appSidebar')?.classList.toggle('mobile-open');
  });

  /* ─────────────── SCROLL ANIMATIONS ─────────────── */
  const animEls = document.querySelectorAll('[data-animate]');
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animEls.forEach(el => animObserver.observe(el));

  /* ─────────────── START ─────────────── */
  init();

  // Keyboard shortcuts modal
  document.getElementById('shortcutsBtn')?.addEventListener('click', () => {
    document.getElementById('shortcutsModal')?.classList.toggle('open');
  });
  document.getElementById('closeShortcuts')?.addEventListener('click', () => {
    document.getElementById('shortcutsModal')?.classList.remove('open');
  });
})();

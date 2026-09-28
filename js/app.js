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

  /* ─────────────── SHARED EXPORT MODAL (COUNTDOWN + AD) ─────────────── */
  const PDF_CONFIG = {
    modal:        null,
    countdownEl:  null,
    libPromise:   null,
    COUNTDOWN:    5,
    // Pinned version on unpkg — do NOT use @latest in production.
    CDN: 'https://unpkg.com/jspdf@4.2.1/dist/jspdf.umd.min.js',
    // Fallback used only if the primary fails.
    FALLBACK_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  };

  let pdfAdLoaded = false;

  function loadJsPdf() {
    if (PDF_CONFIG.libPromise) return PDF_CONFIG.libPromise;

    PDF_CONFIG.libPromise = new Promise((resolve, reject) => {
      // Already loaded from a previous click?
      if (window.jspdf && window.jspdf.jsPDF) {
        return resolve(window.jspdf.jsPDF);
      }

      const tryLoad = (src, onFail) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
          else onFail();
        };
        script.onerror = onFail;
        document.head.appendChild(script);
      };

      // 1st try: pinned unpkg.  2nd try: cdnjs fallback.
      tryLoad(PDF_CONFIG.CDN, () => {
        console.warn('[PDF] Primary CDN failed, trying fallback…');
        tryLoad(PDF_CONFIG.FALLBACK_CDN, () =>
          reject(new Error('jsPDF unavailable (primary + fallback)'))
        );
      });
    });

    return PDF_CONFIG.libPromise;
  }

  function injectPdfAd() {
    if (pdfAdLoaded) return;
    const container = document.getElementById('pdfAdContainer');
    if (!container) return;
    pdfAdLoaded = true;

    // atOptions must exist BEFORE invoke.js runs
    window.atOptions = {
      key: 'd269d78e4bed1c12a52e4012703540e4',
      format: 'iframe',
      height: 250,
      width: 300,
      params: {}
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.highrevenueformat.com/d269d78e4bed1c12a52e4012703540e4/invoke.js';
    script.onerror = () => {
      console.warn('[PDF Ad] Failed to load ad script.');
      container.innerHTML =
        '<div class="pdf-ad-placeholder"><span>Advertisement</span><strong>300 × 250</strong></div>';
    };
    container.appendChild(script);
  }

  function openPdfModal() {
    PDF_CONFIG.modal = document.getElementById('pdfModal');
    PDF_CONFIG.countdownEl = document.getElementById('pdfCountdown');
    if (!PDF_CONFIG.modal) return;
    injectPdfAd();
    PDF_CONFIG.modal.classList.add('open');
  }

  function closePdfModal() {
    if (PDF_CONFIG.modal) PDF_CONFIG.modal.classList.remove('open');
  }

  /**
   * Run the countdown to completion. Returns a Promise that resolves
   * when the visible timer hits 0, so callers can chain work after it.
   */
  function runExportCountdown() {
    const total = PDF_CONFIG.COUNTDOWN;
    return new Promise(resolve => {
      let remaining = total;
      if (PDF_CONFIG.countdownEl) PDF_CONFIG.countdownEl.textContent = remaining;
      const timer = setInterval(() => {
        remaining -= 1;
        if (PDF_CONFIG.countdownEl) PDF_CONFIG.countdownEl.textContent = Math.max(remaining, 0);
        if (remaining <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  }

  function runPdfCountdownAndLoad() {
    const countdownDone = runExportCountdown();

    const libReady = loadJsPdf().catch(err => {
      console.error('[PDF] library error:', err);
      return null;
    });

    return Promise.all([countdownDone, libReady]).then(([, JsPDF]) => JsPDF);
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function colorNameOf(hex) {
    const idx = COLORS.indexOf(hex);
    return idx >= 0 ? COLOR_NAMES[idx] : 'Memo';
  }

  function buildMemoPdf(JsPDF, memo) {
    const doc = new JsPDF({ unit: 'pt', format: 'a4' });

    const pageW  = doc.internal.pageSize.getWidth();
    const pageH  = doc.internal.pageSize.getHeight();

    const margin     = 48;
    const colorStrip = 8;
    const contentX   = margin;
    const contentW   = pageW - margin * 2 - colorStrip;

    const [r, g, b] = hexToRgb(memo.color || '#fff9db');
    const inkRgb     = [44, 36, 22];
    const mutedRgb   = [158, 144, 128];

    const blend = (c, w = 0.72) => Math.round(c * (1 - w) + 255 * w);

    // Paper background
    doc.setFillColor(blend(r), blend(g), blend(b));
    doc.rect(0, 0, pageW, pageH, 'F');

    // Colour strip on left edge
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, colorStrip, pageH, 'F');

    // Header bar
    const headerH = 64;
    doc.setFillColor(blend(r, 0.55), blend(g, 0.55), blend(b, 0.55));
    doc.rect(colorStrip, 0, pageW - colorStrip, headerH, 'F');

    doc.setDrawColor(232, 223, 200);
    doc.setLineWidth(1);
    doc.line(colorStrip, headerH, pageW, headerH);

    // Brand line
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedRgb);
    doc.text('MEMO NOTEPAD  •  memonotepad.github.io', contentX, 24);

    // Colour chip
    doc.setFillColor(r, g, b);
    doc.setDrawColor(208, 196, 168);
    doc.roundedRect(pageW - margin - 74, 16, 74, 20, 10, 10, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(...inkRgb);
    doc.text(colorNameOf(memo.color), pageW - margin - 37, 30, { align: 'center' });

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...inkRgb);
    const titleLines = doc.splitTextToSize(memo.title || 'Untitled Memo', contentW);
    let y = headerH + 46;
    titleLines.slice(0, 3).forEach(line => {
      doc.text(line, contentX, y);
      y += 26;
    });

    // Meta line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedRgb);
    const created = new Date(memo.created || memo.updated || Date.now());
    const updated = new Date(memo.updated || Date.now());
    const fmt = d => d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    doc.text(`Created: ${fmt(created)}    Updated: ${fmt(updated)}`, contentX, y);
    y += 14;

    // Divider
    doc.setDrawColor(208, 196, 168);
    doc.line(contentX, y, pageW - margin, y);
    y += 26;

    // Body
    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...inkRgb);

    const lineHeight = 18;
    const bottomLimit = pageH - 60;

    const rawLines = (memo.content || '').replace(/\r\n/g, '\n').split('\n');
    for (const raw of rawLines) {
      const wrapped = doc.splitTextToSize(raw === '' ? ' ' : raw, contentW);
      for (const w of wrapped) {
        if (y > bottomLimit) {
          addPdfFooter(doc, pageW, pageH, margin, mutedRgb, memo);
          doc.addPage();
          doc.setFillColor(blend(r), blend(g), blend(b));
          doc.rect(0, 0, pageW, pageH, 'F');
          doc.setFillColor(r, g, b);
          doc.rect(0, 0, colorStrip, pageH, 'F');
          doc.setFont('courier', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...inkRgb);
          y = margin + 20;
        }
        doc.text(w, contentX, y);
        y += lineHeight;
      }
    }

    addPdfFooter(doc, pageW, pageH, margin, mutedRgb, memo);

    return doc;
  }

  function addPdfFooter(doc, pageW, pageH, margin, mutedRgb, memo) {
    doc.setDrawColor(208, 196, 168);
    doc.setLineWidth(0.8);
    doc.line(margin, pageH - 42, pageW - margin, pageH - 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedRgb);
    doc.text(
      `Memo Notepad Online  •  ${memo.title || 'Untitled Memo'}`,
      margin,
      pageH - 26
    );
    const pageNum = doc.internal.getNumberOfPages();
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 26, { align: 'right' });
  }

  function safeFilename(name) {
    return (name || 'memo').replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '_') || 'memo';
  }

  /* ─────────────── SAVE AS PDF (modal + countdown + ad) ─────────────── */
  async function saveActiveMemoAsPdf() {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) {
      showToast('❌ No memo open to export.');
      return;
    }

    openPdfModal();
    try {
      const JsPDF = await runPdfCountdownAndLoad();

      if (!JsPDF) {
        closePdfModal();
        showToast('❌ Could not load PDF library. Check your connection.');
        return;
      }

      const live = memos.find(m => m.id === activeMemoId);
      if (live) {
        live.title = titleInput.value.trim() || 'Untitled Memo';
        live.content = editor.value;
        live.updated = new Date().toISOString();
      }

      const doc = buildMemoPdf(JsPDF, live || memo);
      doc.save(safeFilename(live.title || memo.title) + '.pdf');

      closePdfModal();
      showToast('📄 PDF saved successfully!');
    } catch (err) {
      console.error('[PDF] failed:', err);
      closePdfModal();
      showToast('❌ PDF export failed.');
    }
  }

  /* ─────────────── SAVE AS .TXT (same modal + countdown + ad) ─────────────── */
  async function saveActiveMemoAsTxt() {
    const memo = memos.find(m => m.id === activeMemoId);
    if (!memo) {
      showToast('❌ No memo open to export.');
      return;
    }

    openPdfModal();
    try {
      // .txt needs no library — just wait for the countdown to finish.
      await runExportCountdown();

      const live = memos.find(m => m.id === activeMemoId);
      if (live) {
        live.title = titleInput.value.trim() || 'Untitled Memo';
        live.content = editor.value;
        live.updated = new Date().toISOString();
      }
      const target = live || memo;

      const blob = new Blob(
        [`${target.title}\n${'─'.repeat(40)}\n\n${target.content}`],
        { type: 'text/plain' }
      );
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = safeFilename(target.title) + '.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);

      closePdfModal();
      showToast('💾 Text file saved successfully!');
    } catch (err) {
      console.error('[TXT] failed:', err);
      closePdfModal();
      showToast('❌ Text export failed.');
    }
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
    if (e.key === 'Escape' && PDF_CONFIG.modal?.classList.contains('open')) {
      closePdfModal();
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

  // Save .txt — now routes through the shared modal (countdown + ad)
  if (exportBtn) exportBtn.addEventListener('click', saveActiveMemoAsTxt);

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

  // Save as PDF button
  const pdfBtnEl = document.getElementById('pdfBtn');
  if (pdfBtnEl) pdfBtnEl.addEventListener('click', saveActiveMemoAsPdf);

  // Close PDF modal on backdrop click
  document.getElementById('pdfModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'pdfModal') closePdfModal();
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

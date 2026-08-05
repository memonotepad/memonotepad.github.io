/**
 * Memo Notepad — sidebar.js
 * Injects a fixed dynamic sidebar for Memo Notepad tools
 * Theme: Editorial / Ink-on-paper aesthetic
 * Loads on demand: only when the trigger is clicked
 */

(function () {
  // State to track if the sidebar has been initialized
  let isInitialized = false;
  let sidebar = null;
  let trigger = null;
  let overlay = null;
  let closeBtn = null;
  let sidebarBody = null;

  // 1. Array of tools available on Memo Notepad (based on actual site structure)
  const toolsList = [
    { name: "Notepad", icon: "📝", url: "/notepad", desc: "Write, edit and auto-save notes instantly." },
    { name: "Diary", icon: "📖", url: "/diary", desc: "Keep a private daily journal with dated entries." },
    { name: "Dream Journal", icon: "🌙", url: "/dream-journal", desc: "Record and interpret your dreams." },
    { name: "List Maker", icon: "✅", url: "/list-maker", desc: "Create checklists and to-dos with ease." },
    { name: "Focus Timer", icon: "🎯", url: "/focus-timer", desc: "Minimalist writing mode with a zen focus." },
    { name: "Case Converter", icon: "🔤", url: "/case-converter", desc: "Transform text to uppercase, lowercase, etc." },
    { name: "Random Text", icon: "🎲", url: "/random-text", desc: "Generate placeholder paragraphs or words." },
    { name: "Word Shuffler", icon: "🔀", url: "/word-shuffler", desc: "Randomize word order in any text." },
    { name: "Decision Maker", icon: "⚖️", url: "/decision-maker", desc: "Spin a wheel or flip a coin to decide." },
    { name: "Password Generator", icon: "🔑", url: "/password-generator", desc: "Create strong, secure passwords instantly." },
    { name: "Blog", icon: "📰", url: "/blog", desc: "Read tips and articles about note-taking." },
    { name: "About", icon: "ℹ️", url: "/about", desc: "Learn more about Memo Notepad." },
    { name: "Contact", icon: "✉️", url: "/contact", desc: "Get in touch with the team." },
    { name: "Privacy Policy", icon: "🔒", url: "/privacy", desc: "How we protect your data and privacy." },
    { name: "Terms of Service", icon: "📋", url: "/terms", desc: "Read our terms and conditions." }
  ];

  // 2. Inject CSS Styles with Memo Notepad theme
  function injectStyles() {
    const cssStyles = `
      /* Floating Launch Trigger Button */
      .tools-floating-trigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        width: 52px;
        height: 52px;
        background: var(--ink, #2c3e50);
        color: var(--paper, #f8f4e9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        border: 1px solid var(--paper-edge, #e0d5c5);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, color 0.2s ease;
      }
      body.dark .tools-floating-trigger {
        background: #2A8F7F;
        color: #ffffff;
      }
      .tools-floating-trigger:hover {
        transform: scale(1.08) rotate(15deg);
        background: #e67e22;
        color: #ffffff;
      }
      .tools-floating-trigger.active {
        transform: scale(0.9) rotate(-90deg);
        background: #f0e8d8;
        color: #2c3e50;
      }

      /* Fixed Sidebar Layout Container */
      .tools-fixed-sidebar {
        position: fixed;
        top: 0;
        right: -340px;
        width: 320px;
        height: 100vh;
        background: var(--paper, #f8f4e9);
        border-left: 1px solid var(--paper-edge, #e0d5c5);
        box-shadow: -8px 0 24px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .tools-fixed-sidebar.open {
        right: 0;
      }

      /* Dimmed Background Backdrop Overlay */
      .tools-sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(26, 26, 46, 0.4);
        backdrop-filter: blur(4px);
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      body.dark .tools-sidebar-overlay {
        background: rgba(0, 0, 0, 0.6);
      }
      .tools-sidebar-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }

      /* Sidebar Header Details */
      .tools-sb-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--paper-edge, #e0d5c5);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--paper-warm, #f5efe6);
        flex-shrink: 0;
      }
      .tools-sb-header h2 {
        font-family: 'Georgia', serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ink, #2c3e50);
        margin: 0;
      }
      .tools-sb-header h2 em {
        font-style: italic;
        color: #e67e22;
      }
      .tools-sb-close {
        width: 32px;
        height: 32px;
        font-size: 1rem;
        color: #7f8c8d;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: none;
        border: none;
      }
      .tools-sb-close:hover {
        color: #2c3e50;
        background: #e0d5c5;
      }

      /* Scrollable items menu wrapper */
      .tools-sb-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      /* Single Tool Items Card Styling & Animation */
      .tools-sb-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        transition: all 0.2s ease;
        opacity: 0;
        transform: translateX(20px);
        text-decoration: none;
        cursor: pointer;
      }
      .tools-fixed-sidebar.open .tools-sb-item {
        animation: slideInItem 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      .tools-sb-item:hover {
        background: var(--paper-warm, #f5efe6);
        border-color: var(--paper-edge, #e0d5c5);
        transform: translateY(-2px);
      }
      .tools-sb-item-icon {
        font-size: 1.3rem;
        width: 38px;
        height: 38px;
        background: var(--paper-warm, #f5efe6);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--paper-edge, #e0d5c5);
        transition: background 0.2s ease;
        flex-shrink: 0;
      }
      .tools-sb-item:hover .tools-sb-item-icon {
        background: #fdebd0;
      }
      body.dark .tools-sb-item:hover .tools-sb-item-icon {
        background: rgba(230, 126, 34, 0.15);
      }
      .tools-sb-item-details {
        flex: 1;
        min-width: 0;
      }
      .tools-sb-item-name {
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--ink, #2c3e50);
        margin-bottom: 2px;
      }
      .tools-sb-item-desc {
        font-size: 0.78rem;
        color: #7f8c8d;
        line-height: 1.4;
      }

      /* Keyframe Animations */
      @keyframes slideInItem {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Scrollbar styling */
      .tools-sb-body::-webkit-scrollbar {
        width: 4px;
      }
      .tools-sb-body::-webkit-scrollbar-track {
        background: var(--paper-warm, #f5efe6);
      }
      .tools-sb-body::-webkit-scrollbar-thumb {
        background: #d5c8b8;
        border-radius: 4px;
      }
      .tools-sb-body::-webkit-scrollbar-thumb:hover {
        background: #bfae98;
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = cssStyles;
    document.head.appendChild(styleEl);
  }

  // 3. Initialize the sidebar DOM
  function initializeSidebar() {
    if (isInitialized) return;
    
    // Inject styles first
    injectStyles();

    // Create root container if it doesn't exist
    let rootContainer = document.getElementById("tools-sidebar-root");
    if (!rootContainer) {
      rootContainer = document.createElement("div");
      rootContainer.id = "tools-sidebar-root";
      document.body.appendChild(rootContainer);
    }

    // Generate the complete DOM structural markup dynamically
    rootContainer.innerHTML = `
      <div class="tools-sidebar-overlay" id="toolsSidebarOverlay"></div>
      <div class="tools-floating-trigger" id="toolsSidebarTrigger" title="Explore Toolkit" aria-label="Toggle Memo Notepad toolkit">📝</div>
      <aside class="tools-fixed-sidebar" id="toolsFixedSidebar" aria-label="Memo Notepad Toolkit Sidebar">
        <div class="tools-sb-header">
          <h2>Memo <em>Notepad</em></h2>
          <button class="tools-sb-close" id="toolsSidebarClose" aria-label="Close toolkit">✕</button>
        </div>
        <div class="tools-sb-body" id="toolsSidebarBody"></div>
      </aside>
    `;

    // Get references to all elements
    sidebarBody = document.getElementById("toolsSidebarBody");
    sidebar = document.getElementById("toolsFixedSidebar");
    trigger = document.getElementById("toolsSidebarTrigger");
    overlay = document.getElementById("toolsSidebarOverlay");
    closeBtn = document.getElementById("toolsSidebarClose");

    // Populate list items with structural offsets for sequence animation cascading
    toolsList.forEach((tool, idx) => {
      const itemA = document.createElement("a");
      itemA.href = tool.url;
      itemA.className = "tools-sb-item";
      itemA.style.animationDelay = `${idx * 0.03}s`;

      itemA.innerHTML = `
        <div class="tools-sb-item-icon">${tool.icon}</div>
        <div class="tools-sb-item-details">
          <div class="tools-sb-item-name">${tool.name}</div>
          <div class="tools-sb-item-desc">${tool.desc}</div>
        </div>
      `;
      sidebarBody.appendChild(itemA);
    });

    // Bind event listeners
    trigger.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeSidebar);
    closeBtn.addEventListener("click", closeSidebar);

    // Close interface gracefully via the Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    isInitialized = true;
  }

  // 4. Toggle and Close functions
  function toggleSidebar() {
    if (!isInitialized) {
      initializeSidebar();
      // Small delay to allow DOM to render before toggling
      setTimeout(() => {
        const isOpen = sidebar.classList.toggle("open");
        trigger.classList.toggle("active", isOpen);
        overlay.classList.toggle("visible", isOpen);
        trigger.innerHTML = isOpen ? "✕" : "📝";
      }, 10);
      return;
    }
    
    const isOpen = sidebar.classList.toggle("open");
    trigger.classList.toggle("active", isOpen);
    overlay.classList.toggle("visible", isOpen);
    trigger.innerHTML = isOpen ? "✕" : "📝";
  }

  function closeSidebar() {
    if (!isInitialized) return;
    
    sidebar.classList.remove("open");
    trigger.classList.remove("active");
    overlay.classList.remove("visible");
    trigger.innerHTML = "📝";
  }

  // 5. Create just the trigger button initially
  function createTriggerOnly() {
    // Create minimal trigger button
    const rootContainer = document.getElementById("tools-sidebar-root");
    if (!rootContainer) {
      const container = document.createElement("div");
      container.id = "tools-sidebar-root";
      document.body.appendChild(container);
    }
    
    const triggerButton = document.createElement("div");
    triggerButton.className = "tools-floating-trigger";
    triggerButton.id = "toolsSidebarTrigger";
    triggerButton.title = "Explore Toolkit";
    triggerButton.setAttribute("aria-label", "Toggle Memo Notepad toolkit");
    triggerButton.textContent = "📝";
    
    document.getElementById("tools-sidebar-root").appendChild(triggerButton);
    
    // Add click listener that initializes and toggles
    triggerButton.addEventListener("click", function() {
      if (!isInitialized) {
        initializeSidebar();
        // Re-bind the trigger click to use the new trigger element
        const newTrigger = document.getElementById("toolsSidebarTrigger");
        const newSidebar = document.getElementById("toolsFixedSidebar");
        const newOverlay = document.getElementById("toolsSidebarOverlay");
        const newCloseBtn = document.getElementById("toolsSidebarClose");
        
        // Remove old listeners and add new ones
        newTrigger.removeEventListener("click", initializeAndToggle);
        newTrigger.addEventListener("click", toggleSidebar);
        newOverlay.addEventListener("click", closeSidebar);
        newCloseBtn.addEventListener("click", closeSidebar);
        
        // Open the sidebar after initialization
        setTimeout(() => {
          toggleSidebar();
        }, 10);
      } else {
        toggleSidebar();
      }
    });
  }

  // Helper for the initial click
  function initializeAndToggle() {
    initializeSidebar();
    const newTrigger = document.getElementById("toolsSidebarTrigger");
    newTrigger.click();
  }

  // 6. Initialize with just the trigger
  // Check if we should initialize immediately or wait for click
  const shouldLoadOnDemand = true; // Set to false if you want to load immediately

  if (shouldLoadOnDemand) {
    // Load just the trigger, sidebar loads on click
    // First, inject styles so the trigger looks right
    injectStyles();
    createTriggerOnly();
  } else {
    // Legacy behavior - load everything immediately
    initializeSidebar();
  }

})();

/**
 * Memo Notepad — Sidebar Loader
 * Loads the sidebar only when the trigger is clicked
 */

(function() {
  let isSidebarLoaded = false;
  
  // Function to load the sidebar script
  function loadSidebar() {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.getElementById('memo-sidebar-script')) {
        resolve();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.id = 'memo-sidebar-script';
      script.src = '/path/to/sidebar.js'; // Update this path
      script.onload = resolve;
      script.onerror = reject;
      
      // Add to head
      document.head.appendChild(script);
    });
  }
  
  // Function to create the trigger button (if not already present)
  function createTrigger() {
    // Check if trigger already exists
    if (document.getElementById('sidebar-loader-trigger')) {
      return;
    }
    
    // Create container for sidebar
    const container = document.createElement('div');
    container.id = 'tools-sidebar-root';
    document.body.appendChild(container);
    
    // Create the trigger button
    const trigger = document.createElement('button');
    trigger.id = 'sidebar-loader-trigger';
    trigger.className = 'tools-floating-trigger';
    trigger.innerHTML = '📝';
    trigger.setAttribute('aria-label', 'Open Memo Notepad toolkit');
    trigger.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      width: 52px;
      height: 52px;
      background: #2c3e50;
      color: #f8f4e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      border: 1px solid #e0d5c5;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, color 0.2s ease;
    `;
    
    document.body.appendChild(trigger);
    
    // Click handler
    trigger.addEventListener('click', async function() {
      if (!isSidebarLoaded) {
        try {
          // Show loading state
          this.innerHTML = '⏳';
          this.style.background = '#e67e22';
          
          await loadSidebar();
          isSidebarLoaded = true;
          
          // After loading, trigger the sidebar toggle
          this.innerHTML = '📝';
          this.style.background = '#2c3e50';
          
          // Find and trigger the sidebar toggle
          const sidebarToggle = document.getElementById('toolsSidebarTrigger');
          if (sidebarToggle) {
            sidebarToggle.click();
          }
        } catch (error) {
          console.error('Failed to load sidebar:', error);
          this.innerHTML = '❌';
          this.style.background = '#e74c3c';
          
          // Reset after error
          setTimeout(() => {
            this.innerHTML = '📝';
            this.style.background = '#2c3e50';
          }, 2000);
        }
      } else {
        // If already loaded, just toggle the sidebar
        const sidebarToggle = document.getElementById('toolsSidebarTrigger');
        if (sidebarToggle) {
          sidebarToggle.click();
        }
      }
    });
  }
  
  // Initialize loader
  function init() {
    // Only create trigger if sidebar-root doesn't exist
    if (!document.getElementById('tools-sidebar-root')) {
      createTrigger();
    }
  }
  
  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Latest Blog Posts Component for Homepage
 * Format: Vanilla JS Dynamic Component
 * Shows the 4 most recent post cards with Title, Description, and Article link.
 */

(function() {
  // 1. Data Source (Top 4 most recent articles from the blog dataset)
  const latestArticles = [
    {
      id: 1,
      title: "How Memo Notepad Keeps Your Notes 100% Private (No Servers, No Tracking)",
      description: "Discover why local-first storage matters: your memos never leave your browser. No accounts, no cloud vulnerabilities — complete privacy by design.",
      url: "/how-memo-notepad-keeps-notes-private"
    },
    {
      id: 2,
      title: "10 Creative Ways to Use Memo Notepad for Everyday Productivity",
      description: "From lightning-fast daily logs to project brainstorming, habit trackers and recipe vaults — unlock the full potential of your online memo pads.",
      url: "/10-creative-ways-to-use-memo-notepad"
    },
    {
      id: 3,
      title: "Mastering Color-Coded Memos: Build a Visual Organization System",
      description: "Transform your memo list into a vibrant dashboard: use color labels for urgency, context, and priority. Level up your visual workflow.",
      url: "/mastering-color-coded-memos"
    },
    {
      id: 4,
      title: "Why Browser-Based Note-Taking Apps Are the Future (And How Memo Notepad Leads)",
      description: "Cross-platform, zero-install, always up-to-date. Explore the rise of PWA-style notepads and why Memo Notepad sets the standard.",
      url: "/browser-based-note-taking-future"
    }
  ];

  // 2. Helper to safely escape strings from any HTML injection
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // 3. Inject and render the component structure into the designated DOM container
  function initLatestBlogComponent() {
    const targetContainer = document.getElementById('latestBlogSection');
    if (!targetContainer) {
      console.warn("Target element #latestBlogSection not found on this page.");
      return;
    }

    // Generate HTML structure leveraging global CSS tokens from the blog page
    let htmlContent = `
      <section class="latest-posts-section" style="padding: 80px 24px; max-width: 1280px; margin: 0 auto;">
        <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;">
          <div>
            <span style="font-family: var(--font-ui); color: var(--teal); font-weight: 600; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 8px;">From the Desk</span>
            <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; color: var(--ink);">Latest Blog Posts</h2>
          </div>
          <a href="/blog" class="view-all-link" style="font-family: var(--font-ui); font-weight: 600; color: var(--teal); text-decoration: none; border-bottom: 2px solid var(--border-dark); padding-bottom: 4px; transition: color var(--transition);">
            Explore all articles &rarr;
          </a>
        </div>

        <div class="articles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
    `;

    // Map content items onto markup grid
    latestArticles.forEach((article, idx) => {
      const articleNumber = (idx + 1).toString().padStart(2, '0');
      htmlContent += `
        <article class="article-card" data-id="${article.id}">
          <div class="card-content">
            <span class="article-number">📄 Article ${articleNumber}</span>
            <h3 class="article-title" style="font-size: 1.3rem;">${escapeHtml(article.title)}</h3>
            <p class="article-description">${escapeHtml(article.description)}</p>
            <a href="${article.url}" class="read-link">Read article</a>
          </div>
        </article>
      `;
    });

    htmlContent += `
        </div>
      </section>
    `;

    targetContainer.innerHTML = htmlContent;
  }

  // Execute construction safely on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLatestBlogComponent);
  } else {
    initLatestBlogComponent();
  }
})();

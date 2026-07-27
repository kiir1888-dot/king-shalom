// Get article ID from URL parameter
const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');

// Format date for display
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function getSafeArticleImage(article) {
  const imageUrl = getArticleImage(article);
  return /^(https:\/\/|data:image\/(?:png|jpeg|jpg|webp|gif);base64,)/i.test(imageUrl) ? imageUrl : getArticleImage({});
}

function getArticleImage(article) {
  return article.imageUrl || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80';
}

// Load and display article
async function loadArticle() {
  try {
    const response = await fetch(`/api/news?fresh=${Date.now()}`, { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON. Ensure backend is running.');
    }

    const data = await response.json();

    if (!data.success || data.data.length === 0) {
      document.getElementById('articleContent').innerHTML = '<p class="text-center text-muted">No articles found.</p>';
      return;
    }

    const allArticles = data.data;
    
    // If no ID specified, show first article
    const article = articleId 
      ? allArticles.find(a => a.id == articleId) 
      : allArticles[0];

    if (!article) {
      document.getElementById('articleContent').innerHTML = '<p class="text-center text-muted">Article not found.</p>';
      return;
    }

    // Render main article
    renderArticle(article);

    // Show related articles
    const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);
    renderRelatedArticles(relatedArticles);
  } catch (error) {
    console.error('Error loading article:', error);
    document.getElementById('articleContent').innerHTML = '<p class="text-center text-danger">Error loading article.</p>';
  }
}

function renderArticle(article) {
  const container = document.getElementById('articleContent');
  const articleUrl = new URL('/article.html', window.location.origin);
  articleUrl.searchParams.set('id', article.id);
  const facebookShareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  facebookShareUrl.searchParams.set('u', articleUrl.toString());
  
  container.innerHTML = `
    <div class="article-hero mb-4">
      <img src="${escapeHtml(getSafeArticleImage(article))}" alt="${escapeHtml(article.title)}" />
    </div>

    <div class="d-flex flex-wrap gap-2 mb-3">
      <span class="news-tag">${escapeHtml(article.category)}</span>
    </div>

    <h1 class="display-5 fw-semibold mb-3">${escapeHtml(article.title)}</h1>
    <p class="lead text-muted">${escapeHtml(article.description)}</p>

    <div class="article-meta d-flex flex-wrap align-items-center gap-3 mb-4">
      <span><i class="fa-solid fa-user me-2"></i>By ${escapeHtml(article.author)}</span>
      <span><i class="fa-solid fa-calendar me-2"></i>${escapeHtml(formatDate(article.date))}</span>
      <span><i class="fa-solid fa-clock me-2"></i>5 min read</span>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-5">
      <a href="${escapeHtml(facebookShareUrl.toString())}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark btn-sm"><i class="fa-brands fa-facebook-f me-2"></i>Share</a>
      <a href="#" class="btn btn-outline-dark btn-sm"><i class="fa-brands fa-twitter me-2"></i>Tweet</a>
      <a href="#" class="btn btn-outline-dark btn-sm"><i class="fa-solid fa-link me-2"></i>Copy link</a>
    </div>

    <div class="article-body">
      <p>${escapeHtml(article.description)}</p>
      <p>This article has been published from your admin dashboard and displays dynamically across your website.</p>
    </div>

    <hr class="my-5" />

    <section class="related-stories">
      <h2 class="h4 fw-semibold mb-3">Related stories</h2>
      <div class="row g-4" id="relatedArticles"></div>
    </section>
  `;
}

function renderRelatedArticles(articles) {
  const container = document.getElementById('relatedArticles');
  container.innerHTML = '';

  articles.forEach(article => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    const safeId = encodeURIComponent(String(article.id ?? ''));
    col.innerHTML = `
      <a href="article.html?id=${safeId}" style="text-decoration: none; color: inherit;">
        <article class="news-card p-4">
          <span class="news-tag">${escapeHtml(article.category)}</span>
          <h3 class="h6 fw-semibold mt-2">${escapeHtml(article.title)}</h3>
          <p class="text-muted small">${escapeHtml(article.description.substring(0, 80))}...</p>
        </article>
      </a>
    `;
    container.appendChild(col);
  });

  if (articles.length === 0) {
    container.innerHTML = '<p class="text-muted">No related articles found.</p>';
  }
}

// Load article when page loads
document.addEventListener('DOMContentLoaded', loadArticle);

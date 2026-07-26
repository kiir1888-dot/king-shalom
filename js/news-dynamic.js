// Fetch news from backend API
async function fetchNewsData() {
  try {
    const response = await fetch(`/api/news?fresh=${Date.now()}`, { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error('Server returned HTML instead of JSON. Ensure backend is running.');
      return [];
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Error fetching news:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

function formatNewsDate(dateStr) {
  if (!dateStr) {
    return '';
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getNewsImage(news, index) {
  if (news.imageUrl) {
    return news.imageUrl;
  }

  const categoryImages = {
    'Company News': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    'Regulatory Update': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80',
    Milestone: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
  };

  if (categoryImages[news.category]) {
    return categoryImages[news.category];
  }

  const fallbackImages = [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80',
  ];

  return fallbackImages[index % fallbackImages.length];
}

function createNewsCard(news, index) {
  const article = document.createElement('article');
  article.className = 'news-card reveal visible';
  article.innerHTML = `
    <div class="news-img-wrap">
      <img src="${getNewsImage(news, index)}" alt="${news.title || 'News update'}" />
      <span class="news-category">${news.category || 'News'}</span>
    </div>
    <div class="news-body">
      <time class="news-date" datetime="${news.date || ''}">${formatNewsDate(news.date)}</time>
      <h3>${news.title || ''}</h3>
      <p>${news.description || ''}</p>
      <a href="article.html?id=${news.id}" class="news-read-more">Read more</a>
    </div>
  `;

  return article;
}

// Render featured article (first item)
function renderFeaturedNews(news) {
  const container = document.getElementById('featuredNewsContainer');
  if (!container) {
    return;
  }

  const article = createNewsCard(news, 0);
  article.classList.add('news-card-lg', 'mb-4');

  const readMoreLink = article.querySelector('.news-read-more');
  if (readMoreLink) {
    readMoreLink.textContent = 'Read more';
  }

  container.innerHTML = '';
  container.appendChild(article);
}

// Render grid news items (2 columns)
function renderNewsGrid(newsList) {
  const container = document.getElementById('newsGridContainer');
  if (!container) {
    return;
  }

  container.innerHTML = ''; // Clear existing

  newsList.forEach((news, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.appendChild(createNewsCard(news, index + 1));
    container.appendChild(col);
  });
}

function renderHomepageNews(newsList) {
  const container = document.getElementById('homeNewsGrid');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  newsList.slice(0, 3).forEach((news, index) => {
    container.appendChild(createNewsCard(news, index));
  });
}

// Main initialization
async function initializeNews() {
  const newsData = await fetchNewsData();
  
  if (newsData.length === 0) {
    const homeContainer = document.getElementById('homeNewsGrid');
    if (homeContainer) {
      homeContainer.innerHTML = '<p class="text-muted mb-0">No news has been published yet.</p>';
    }
    return;
  }

  if (document.getElementById('homeNewsGrid')) {
    renderHomepageNews(newsData);
    return;
  }

  if (document.getElementById('featuredNewsContainer')) {
    renderFeaturedNews(newsData[0]);
  }

  // Remaining items in grid
  if (document.getElementById('newsGridContainer') && newsData.length > 1) {
    renderNewsGrid(newsData.slice(1));
  }
}

// Load when DOM is ready
document.addEventListener('DOMContentLoaded', initializeNews);

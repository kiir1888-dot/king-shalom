// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin-login.html';
    return;
  }

  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();

  // Load all news
  loadNews();

  imageFileInput?.addEventListener('change', () => {
    setSelectedImage(imageFileInput.files && imageFileInput.files[0] ? imageFileInput.files[0] : null);
  });

  imageDropzone?.addEventListener('dragover', (event) => {
    event.preventDefault();
    imageDropzone.classList.add('is-dragover');
  });

  imageDropzone?.addEventListener('dragleave', () => {
    imageDropzone.classList.remove('is-dragover');
  });

  imageDropzone?.addEventListener('drop', (event) => {
    event.preventDefault();
    imageDropzone.classList.remove('is-dragover');

    const droppedFile = event.dataTransfer?.files && event.dataTransfer.files[0] ? event.dataTransfer.files[0] : null;
    if (!droppedFile || !droppedFile.type.startsWith('image/')) {
      showAlert('Please drop an image file.', 'error');
      return;
    }

    if (imageFileInput) {
      imageFileInput.value = '';
    }

    setSelectedImage(droppedFile);
  });

  // Form submission
  document.getElementById('newsForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('newsList').addEventListener('click', handleNewsListClick);
});

let editingId = null;
let allNews = [];
let currentImageUrl = '';
let selectedImageFile = null;
const API_BASE = '/api';

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Server returned HTML instead of JSON. Ensure the backend server is running and reachable.');
  }

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login.html';
    return null;
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

const imageFileInput = document.getElementById('imageFile');
const imageDropzone = document.getElementById('imageDropzone');
const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const imagePreview = document.getElementById('imagePreview');

function getDefaultNewsImage() {
  return 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80';
}

function updateImagePreview(src) {
  if (!imagePreviewWrap || !imagePreview) {
    return;
  }

  if (src) {
    imagePreview.src = src;
    imagePreviewWrap.style.display = 'block';
  } else {
    imagePreview.removeAttribute('src');
    imagePreviewWrap.style.display = 'none';
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function setSelectedImage(file) {
  selectedImageFile = file || null;

  if (selectedImageFile) {
    const previewUrl = URL.createObjectURL(selectedImageFile);
    updateImagePreview(previewUrl);
    return;
  }

  updateImagePreview(currentImageUrl || '');
}

// Format date for display
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Show alert messages
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Load all news from backend
async function loadNews() {
  try {
    const data = await requestJson(`${API_BASE}/news`);
    if (!data) {
      return;
    }

    allNews = data.data;
    renderNewsList();
  } catch (error) {
    showAlert('Connection error: ' + error.message, 'error');
  }
}

// Render news list
function renderNewsList() {
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '';

  if (allNews.length === 0) {
    newsList.innerHTML = '<p style="text-align: center; color: #999;">No articles published yet</p>';
    return;
  }

  allNews.forEach(news => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
      <div class="news-item-content" style="flex: 1; display: flex; gap: 1rem; align-items: flex-start;">
        <div style="width: 96px; flex: 0 0 96px;">
          <img
            src="${news.imageUrl || getDefaultNewsImage()}"
            alt="${news.title}"
            style="width: 96px; height: 72px; object-fit: cover; border-radius: 8px; background: #f2f2f2;"
          />
        </div>
        <div style="flex: 1;">
        <h3>${news.title}</h3>
        <div class="news-item-meta">
          <strong>Category:</strong> ${news.category} | 
          <strong>Author:</strong> ${news.author} | 
          <strong>Date:</strong> ${formatDate(news.date)}
        </div>
        <p style="margin: 0.5rem 0 0 0; color: #555;">${news.description.substring(0, 100)}...</p>
        </div>
      </div>
      <div class="news-item-actions">
        <button type="button" class="btn-edit" data-action="edit" data-news-id="${news.id}">Edit</button>
        <button type="button" class="btn-delete" data-action="delete" data-news-id="${news.id}">Delete</button>
      </div>
    `;
    newsList.appendChild(newsItem);
  });
}

function handleNewsListClick(event) {
  const actionButton = event.target.closest('[data-action][data-news-id]');
  if (!actionButton) {
    return;
  }

  const id = Number(actionButton.dataset.newsId);
  if (actionButton.dataset.action === 'edit') {
    editNews(id);
  } else if (actionButton.dataset.action === 'delete') {
    deleteNews(id);
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem('adminToken');
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const author = document.getElementById('author').value;
  const date = document.getElementById('date').value;

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId 
    ? `${API_BASE}/news/${editingId}` 
    : `${API_BASE}/news`;
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const idleLabel = editingId ? 'Update Article' : 'Publish Article';

  try {
    submitBtn.disabled = true;
    submitBtnText.textContent = editingId ? 'Updating...' : 'Publishing...';

    let imageUrl = currentImageUrl;
    if (selectedImageFile) {
      imageUrl = await readFileAsDataUrl(selectedImageFile);
    }

    const data = await requestJson(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        category,
        author,
        date,
        imageUrl
      })
    });

    if (!data) {
      return;
    }

    showAlert(editingId ? 'Article updated successfully' : 'Article published successfully', 'success');
    resetForm();
    loadNews();
  } catch (error) {
    showAlert('Connection error: ' + error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtnText.textContent = idleLabel;
  }
}

// Edit news
function editNews(id) {
  const news = allNews.find(n => n.id === id);
  if (!news) return;

  editingId = id;
  document.getElementById('formTitle').textContent = 'Edit Article';
  document.getElementById('submitBtnText').textContent = 'Update Article';
  document.getElementById('title').value = news.title;
  document.getElementById('description').value = news.description;
  document.getElementById('category').value = news.category;
  document.getElementById('author').value = news.author;
  document.getElementById('date').value = news.date;
  currentImageUrl = news.imageUrl || '';
  selectedImageFile = null;

  if (imageFileInput) {
    imageFileInput.value = '';
  }

  updateImagePreview(currentImageUrl || '');

  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete news
async function deleteNews(id) {
  if (!confirm('Are you sure you want to delete this article?')) return;

  const token = localStorage.getItem('adminToken');

  try {
    const data = await requestJson(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!data) {
      return;
    }

    showAlert('Article deleted successfully', 'success');
    loadNews();
  } catch (error) {
    showAlert('Connection error: ' + error.message, 'error');
  }
}

// Reset form
function resetForm() {
  document.getElementById('newsForm').reset();
  editingId = null;
  currentImageUrl = '';
  selectedImageFile = null;
  document.getElementById('formTitle').textContent = 'Add New Article';
  document.getElementById('submitBtnText').textContent = 'Publish Article';
  document.getElementById('date').valueAsDate = new Date();

  if (imageFileInput) {
    imageFileInput.value = '';
  }

  imageDropzone?.classList.remove('is-dragover');

  updateImagePreview('');
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    window.location.replace('/admin-login.html');
  }
}

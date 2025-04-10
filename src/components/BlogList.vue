<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const posts = ref([]);
const loading = ref(true);
const initialLoading = ref(true);
const loadingMore = ref(false);
const error = ref(null);
const currentPage = ref(1);
const hasMorePages = ref(true);
const postsPerPage = 6;

const router = useRouter();

const viewBlogDetail = (id) => {
  console.log('Navigating to blog with ID:', id);
  router.push(`/blogs/${id}`); // Sử dụng path trực tiếp
};

const handleImageError = (e) => {
  e.target.src = 'https://www.safetyandhealthmagazine.com/ext/resources/images/fsh-micro/2021/spring21/fshspring21springCleaning.jpg?t=1612280600&width=768';
};

const fetchBlogPosts = async (page = 1, append = false) => {
  if (page === 1) initialLoading.value = true;
  else loadingMore.value = true;
  
  error.value = null;
  
  try {
    const response = await axios.get(`/api/posts?page=${page}`);
    const data = response.data;

    const paginatedPosts = data.posts.map(post => ({
      id: post.BlogID,
      title: post.Title,
      thumbnail: post.Thumbnail || 'https://www.safetyandhealthmagazine.com/ext/resources/images/fsh-micro/2021/spring21/fshspring21springCleaning.jpg?t=1612280600&width=768',
      excerpt: post.Excerpt,
      rating: post.rating || 4
    }));

    hasMorePages.value = page < data.pagination.totalPages;
    
    if (append) posts.value = [...posts.value, ...paginatedPosts];
    else posts.value = paginatedPosts;
    
    currentPage.value = page;
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    error.value = 'Failed to load blog posts. Please try again later.';
  } finally {
    initialLoading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (loadingMore.value || !hasMorePages.value) return;
  await fetchBlogPosts(currentPage.value + 1, true);
};

onMounted(() => {
  fetchBlogPosts(1, false);
});

// onMounted(() => {
//   console.log('Route params ID:', route.params.id); // Kiểm tra id
//   fetchBlogPosts(route.params.id);
// });
</script>

<template>
  <div class="blog-container">
    <header class="blog-header">
      <h1>Tin tức</h1>
      <p>Khám phá những bài viết mới nhất</p>
    </header>

    <!-- Loading state -->
    <div v-if="initialLoading" class="loading-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-text">
          <div class="skeleton-title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <div>
        <strong>Lỗi!</strong>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Blog posts -->
    <div v-else>
      <div class="blog-grid">
        <div 
          v-for="post in posts" 
          :key="post.id" 
          class="blog-card"
          @click="viewBlogDetail(post.id)"
        >
          <div class="card-image">
            <img 
              :src="post.thumbnail" 
              :alt="post.title"
              @error="handleImageError"
            />
            <div class="rating">
              <span v-for="i in 5" :key="i" :class="{ 'filled': i <= post.rating }">★</span>
            </div>
          </div>
          <div class="card-content">
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
            <button @click.stop="viewBlogDetail(post.id)">Đọc thêm →</button>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div class="load-more-section">
        <button 
          v-if="hasMorePages"
          @click="loadMore" 
          :disabled="loadingMore"
          class="load-more-btn"
        >
          <span v-if="loadingMore" class="spinner"></span>
          {{ loadingMore ? 'Đang tải...' : 'Tải thêm' }}
        </button>
        <p v-else>Đã hiển thị tất cả bài viết</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.blog-header {
  text-align: center;
  margin-bottom: 40px;
}

.blog-header h1 {
  font-size: 2.5rem;
  color: #181818;
  margin-bottom: 10px;
  background: linear-gradient(to right, #4d7ada, #2c5fd7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.blog-header p {
  color: #666;
  font-size: 1.1rem;
}

/* Loading Skeleton */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.skeleton-card {
  animation: pulse 1.5s infinite;
}

.skeleton-image {
  height: 200px;
  background: #e5e7eb;
  border-radius: 8px;
}

.skeleton-text {
  padding: 20px;
}

.skeleton-title {
  height: 20px;
  background: #e5e7eb;
  width: 70%;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-line {
  height: 14px;
  background: #e5e7eb;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 80%;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Error */
.error-message {
  background: #fef2f2;
  border-left: 4px solid #dc2626;
  padding: 15px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #dc2626;
}

.error-message strong {
  display: block;
  font-weight: 600;
}

/* Blog Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.blog-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.blog-card:hover .card-image img {
  transform: scale(1.05);
}

.rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 1rem;
}

.rating span {
  color: #d1d5db;
}

.rating span.filled {
  color: #fbbf24;
}

.card-content {
  padding: 20px;
}

.card-content h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content button {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.card-content button:hover {
  color: #1e40af;
}

/* Load More */
.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background: linear-gradient(to right, #2563eb, #7c3aed);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #1e40af, #6d28d9);
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-more-section p {
  color: #666;
  font-size: 1rem;
}
</style>
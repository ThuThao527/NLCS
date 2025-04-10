<template>
  <div class="body">
    <header>
      <Navigate></Navigate>
      <div class="heroimage">
        <HeroSection
          image="https://www.contemporaryrugs.eu/wp-content/uploads/2023/08/5-Charming-Contemporary-Rugs-To-Create-a-Striking-Living-Room-Design-4-scaled.jpg"
          p1="Mẹo vặt cuộc sống"
          p2="Giúp việc dọn dẹp của bạn dễ dàng hơn"
        ></HeroSection>
      </div>
    </header>
    <main>
      <div class="post-container" v-if="loading">
        <div class="skeleton-hero"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-line" v-for="n in 5" :key="n"></div>
        </div>
      </div>
      <div class="post-container" v-else-if="error">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
        </div>
      </div>
      <div class="post-container" v-else>
        <article class="post-content">
          <h1>{{ post.Title }}</h1>
          <div class="post-meta">
            <span>Tác giả: {{ post.Author }}</span>
            <span>Ngày đăng: {{ formatDate(post.CreatedAt) }}</span>
            <span>Lượt xem: {{ post.ViewCount }}</span>
          </div>
          <div class="post-excerpt">
            <p>{{ post.Excerpt }}</p>
          </div>
          <div class="post-thumbnail">
            <img
              :src="post.Thumbnail"
              :alt="post.Title"
              @error="handleImageError"
            />
          </div>
          <div class="post-body" v-html="post.Content"></div>
        </article>
      </div>
      <Footer></Footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Navigate from './Navigate.vue';
import Footer from './Footer.vue';
import HeroSection from '@/components/HeroSection.vue';

// Khai báo biến trạng thái
const route = useRoute();
const post = ref({});
const loading = ref(true);
const error = ref(null);

const handleImageError = (e) => {
  console.log('Called handleImageError');
  e.target.src = 'https://www.safetyandhealthmagazine.com/ext/resources/images/fsh-micro/2021/spring21/fshspring21springCleaning.jpg?t=1612280600&width=768'; // Ảnh thay thế gán cứng
};

// Hàm lấy dữ liệu bài post từ API
const fetchPost = async (id) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
    post.value = {
      ...response.data,
      CategoryName: response.data.Name // Từ API: categories.Name được gán vào đây
    };
  } catch (err) {
    console.error('Error fetching post:', err);
    error.value = err.response?.data?.message || 'Không thể tải bài viết. Vui lòng thử lại sau.';
  } finally {
    loading.value = false;
  }
};

// Format ngày tháng
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Gọi API khi component được mount hoặc khi route thay đổi
onMounted(() => {
  fetchPost(route.params.id);
});

// Theo dõi thay đổi route (nếu cần)
import { onBeforeRouteUpdate } from 'vue-router';
onBeforeRouteUpdate((to) => {
  fetchPost(to.params.id);
});
</script>

<style scoped>
.body {
  background-color: #d2ccc4;
  color: #000;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.heroimage {
  height: 450px;
  overflow: hidden;
}

/* Post Container */
.post-container {
  max-width: 1300px;
  margin: 60px auto; /* Tăng margin để thoáng hơn */
  padding: 0 30px; /* Tăng padding cho cân đối */
}

/* Skeleton Loading */
.skeleton-hero {
  height: 400px; /* Tăng chiều cao để phù hợp container lớn hơn */
  background: #e5e7eb;
  border-radius: 12px; /* Bo góc lớn hơn */
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  margin-top: 30px; /* Tăng khoảng cách */
}

.skeleton-title {
  height: 40px; /* Tăng kích thước */
  background: #e5e7eb;
  width: 60%;
  margin-bottom: 25px;
  border-radius: 6px;
}

.skeleton-meta {
  height: 25px;
  background: #e5e7eb;
  width: 40%;
  margin-bottom: 25px;
  border-radius: 6px;
}

.skeleton-line {
  height: 20px; /* Tăng chiều cao chữ giả lập */
  background: #e5e7eb;
  margin-bottom: 15px;
  border-radius: 6px;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Error Message */
.error-message {
  background: #fef2f2;
  border-left: 6px solid #dc2626; /* Tăng độ dày border */
  padding: 20px 25px; /* Tăng padding */
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #dc2626;
  font-size: 1.2rem; /* Tăng kích thước chữ */
}

/* Post Content */
.post-content {
  background: #fff;
  padding: 40px; /* Tăng padding cho thoáng */
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* Shadow lớn hơn */
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 30px; /* Tăng khoảng cách giữa các phần tử */
  color: #666;
  font-size: 1.1rem; /* Tăng kích thước chữ */
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.post-excerpt {
  background: #f9fafb;
  padding: 20px; /* Tăng padding */
  border-radius: 10px;
  margin-bottom: 40px; /* Tăng khoảng cách dưới */
}

.post-excerpt p {
  font-style: italic;
  color: #4a4848;
  margin: 0;
  font-size: 1.25rem; /* Tăng kích thước chữ */
}

.post-thumbnail {
  margin-bottom: 40px; /* Tăng khoảng cách dưới */
}

.post-thumbnail img {
  width: 100%;
  height: auto;
  max-height: 600px; /* Tăng chiều cao tối đa cho ảnh */
  object-fit: cover;
  border-radius: 12px; /* Bo góc lớn hơn */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Shadow rõ hơn */
  display: block; /* Đảm bảo ảnh không bị lệch */
}

.post-body {
  font-size: 1.25rem; /* Tăng kích thước chữ chính */
  color: #333;
}

/* Style cho nội dung HTML từ API */
.post-body :deep(h2) {
  font-size: 1.75rem; /* Tăng kích thước h2 */
  color: #2563eb;
  margin: 25px 0 15px;
}

.post-body :deep(h1) {
  display: none; /* Ẩn h1 nếu có trong Content */
}

.post-body :deep(p) {
  margin-bottom: 20px; /* Tăng khoảng cách giữa các đoạn */
  font-size: 1.25rem; /* Đồng bộ kích thước chữ */
  color: #000;
}

.post-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 25px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Thêm shadow cho ảnh trong content */
}

.post-body :deep(ul),
.post-body :deep(ol) {
  margin-left: 30px; /* Tăng lề trái */
  margin-bottom: 20px;
}

.post-body :deep(li) {
  margin-bottom: 8px; /* Tăng khoảng cách giữa các item */
  font-size: 1.25rem; /* Tăng kích thước chữ */
}
</style>
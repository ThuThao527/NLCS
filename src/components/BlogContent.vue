<template>
  <div v-if="blog" class="container my-3 blog-content">
    <!-- Header Section -->
    <div class="text-center my-4">
      <!-- <p class="text-muted">
        {{ blog.created_at || 'N/A' }} • {{ blog.readTime || 'N/A' }} read
      </p> -->
      <h1>{{ blog.Title || 'No Title Available' }}</h1>
      <p class="lead">{{ blog.Subtitle || 'No Subtitle' }}</p>
    </div>

    <!-- Image Section -->
    <div class="text-center mb-4">
      <img
        v-if="blog.ImageUrl"
        :src="blog.ImageUrl"
        alt="Blog Image"
        class="img-fluid rounded"
      />
      <img
        v-else
        src="https://via.placeholder.com/800x400?text=No+Image+Available"
        alt="Default Blog Image"
        class="img-fluid rounded"
      />
    </div>

    <!-- Main Content -->
    <div class="mb-4">
      <p>{{ blog.ContentIntro || 'No introduction available.' }}</p>
      <blockquote v-if="blog.Quote" class="blockquote fst-italic px-3">
        <p>{{ blog.Quote }}</p>
      </blockquote>
      <p>{{ blog.ContentBody || 'No content available.' }}</p>
    </div>

    <!-- Share and Interaction Section -->
    <div class="d-flex justify-content-between align-items-center">
      <!-- Share Buttons -->
      <div>
        <button
          class="btn btn-link"
          @click="share('facebook')"
          title="Share on Facebook"
        >
          <i class="fa-brands fa-facebook"></i>
        </button>
        <button
          class="btn btn-link"
          @click="share('twitter')"
          title="Share on twitter"
        >
          <i class="fa-brands fa-x-twitter"></i>
        </button>
        <button
          class="btn btn-link"
          @click="share('linkedin')"
          title="Share on LinkedIn"
        >
          <i class="fa-brands fa-linkedin"></i>
        </button>
      </div>

      <!-- Views -->
      <div>
        <span class="text-muted mb-0">
          {{ blog.Views !== undefined ? blog.Views : 0 }}
          <i class="fa-regular fa-eye"></i>
        </span>

        <span class="text-muted mb-0 mx-2">
          {{ state.comments }} <i class="fa-regular fa-comment-dots"></i>
        </span>

        <span class="text-muted mb-0">
          {{ state.likes }}
        </span>
        <button
          class="btn btn-link p-0"
          @click="likePost"
          title="Like this post"
        >
          <i
            :class="[
              'fa-heart',
              'fa-solid',
              state.isLiked ? 'text-danger' : 'text-secondary',
            ]"
          ></i>
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <p class="text-muted">Loading blog content...</p>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, reactive } from 'vue';
import axios from 'axios';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';

const route = useRoute();
const user = ref({});

const props = defineProps({
  blog: {
    type: Object,
  },
});

// Trạng thái like

const state = reactive({
  likes: 0, // Số lượt thích ban đầu
  comments: 0, // Số lượt bình luận ban đầu
  isLiked: false, // Trạng thái thích hay không
});

// Hàm chia sẻ bài viết
const share = (platform) => {
  const url = encodeURIComponent(window.location.href);
  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/shareArticle?url=${url}`;
      break;
    default:
      console.error('Unsupported platform:', platform);
      return;
  }
  window.open(shareUrl, '_blank');
};

// Hàm tăng số lượt thích

const likePost = async () => {
  if (!user.value.UserID) {
    alert('Vui long dang nhap');
    return;
  }
  try {
    const postId = route.params.id;
    // Xác định hành động 'like' hoặc 'unlike'
    const action = state.isLiked ? 'unlike' : 'like';

    // Gửi yêu cầu tới API
    const response = await axios.post(`/api/posts/${postId}/like`, {
      action: action,
      userId: user.value.UserID,
    });

    // Cập nhật trạng thái nếu API thành công
    if (response.status === 200) {
      state.isLiked = !state.isLiked; // Đảo ngược trạng thái thích
      is_Liked_post(postId);
      state.likes += state.isLiked ? 1 : -1; // Cập nhật số lượt thích
    } else {
      console.error('Có lỗi xảy ra khi gọi API:', response.data.message);
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error.message);
  }
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    user.value = userData;
  } else {
    console.log('Chua dang nhap');
  }
};

const fetchCountLikes = async (postId) => {
  try {
    const response = await axios.get(`/api/user_likes/${postId}`);
    state.likes = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchCountComments = async (postId) => {
  try {
    const response = await axios.get(`/api/comments/${postId}`);
    state.comments = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const is_Liked_post = async (postId) => {
  try {
    const userId = user.value.UserID;
    const response = await axios.get(`/api/posts/${userId}/is-liked/${postId}`);
    state.isLiked = response.data.isLiked === true;
  } catch (error) {
    console.error('Error fetching blog:', error);
  }
};

onMounted(() => {
  const postId = route.params.id;
  fetchUser();
  fetchCountLikes(postId);
  fetchCountComments(postId);
  is_Liked_post(postId);
});

// Xử lý khi route thay đổi
onBeforeRouteUpdate((to, from, next) => {
  const postId = to.params.id; // Lấy ID mới từ route
  fetchUser();
  fetchCountLikes(postId);
  fetchCountComments(postId);
  is_Liked_post(postId);
  next(); // Cho phép điều hướng
});
</script>

<style scoped>
.blog-content {
  border: 1px solid grey;
  border-radius: 5px;
  resize: both;
  overflow: auto;
}
.blog-content img {
  max-height: 400px;
  object-fit: cover;
}

.blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1.5rem 0;
}

button.btn-link {
  font-size: 1.2rem;
  color: #007bff;
}

button.btn-link:hover {
  color: #0056b3;
}
</style>

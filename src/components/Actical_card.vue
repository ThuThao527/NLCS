<template>
  <router-link
    :to="id ? `/blogs/${id}` : ''"
    class="card shadow-sm mb-3 blog-card"
    style="height: 400px"
  >
    <!-- Ảnh -->
    <img :src="image" class="card-img-top" alt="Volunteer Image" />

    <!-- Nội dung -->
    <div class="card-body">
      <h5 class="card-title text-danger">{{ title }}</h5>
      <p class="card-text text-secondary">{{ truncatedDescription }}</p>
    </div>
    <div class="date mx-2">{{ timeAgo }}</div>

    <!-- Footer -->
    <div class="card-footer d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <img
          :src="authorAvatar"
          alt="Author Avatar"
          class="rounded-circle me-2"
          style="width: 32px; height: 32px"
        />
        <span class="">{{ author }}</span>
      </div>
      <div class="d-flex align-items-center">
        <span class="me-3"><i class="fa-regular fa-eye"></i> {{ views }}</span>
        <span class="me-3"
          ><i class="fa-regular fa-comment-dots"></i> {{ comments }}</span
        >
        <span><i class="fa-solid fa-heart"></i> {{ likes }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const route = useRouter();
const likes = ref(0);
const comments = ref(0);
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  authorAvatar: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    required: true,
  },
  create_at: {
    type: String,
    default: 'a few seconds ago',
  },
});

const timeAgo = computed(() => {
  const currentTime = new Date();
  const createdTime = new Date(props.create_at);
  const diffInSeconds = Math.floor((currentTime - createdTime) / 1000); // Chênh lệch tính bằng giây

  // Tính toán sự khác biệt và trả về chuỗi tương ứng
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    // Hiển thị ngày, tháng, năm khi thời gian chênh lệch từ một tháng trở lên
    const month = createdTime.toLocaleString('default', { month: 'long' }); // Lấy tên tháng
    const day = createdTime.getDate(); // Lấy ngày trong tháng
    const year = createdTime.getFullYear(); // Lấy năm
    return `${month} ${day}, ${year}`;
  } else {
    const year = createdTime.getFullYear(); // Lấy năm
    return `${year}`;
  }
});

const fetchCountLikes = async (postId) => {
  try {
    const response = await axios.get(`/api/user_likes/${postId}`);
    likes.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchCountComments = async (postId) => {
  try {
    const response = await axios.get(`/api/comments/${postId}`);
    comments.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const truncatedDescription = computed(() => {
  const maxLength = 250; // Số lượng ký tự tối đa
  return props.description.length > maxLength
    ? props.description.substring(0, maxLength) + '...'
    : props.description;
});

onMounted(() => {
  fetchCountComments(props.id);
  fetchCountLikes(props.id);
});
</script>

<style scoped>
.card-title {
  font-weight: bold;
}
.card-footer span {
  font-size: 12px;
}

.card-img-top {
  max-height: 150px;
  object-fit: cover;
}

/* Hover */
.blog-card:hover {
  transform: scale(1.025);
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Hover nội dung */
.blog-card:hover .card-title {
  color: darkred;
}

.blog-card:hover .card-text {
  color: #6c757d;
}

/* Hover footer */
.blog-card:hover .card-footer {
  background-color: rgba(31, 68, 95, 0.7);
  color: #fff;
}

/* Trạng thái active */
.router-link-active {
  border: 2px solid rgba(31, 68, 95, 0.7);
  background-color: rgba(31, 68, 95, 0.1);
}

.date {
  font-style: italic;
  color: gray;
  font-size: small;
  text-align: end;
}
</style>

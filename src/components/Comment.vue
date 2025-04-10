<template>
  <div class="comment-item d-flex mb-3">
    <!-- Avatar -->
    <div class="avatar-wrapper me-3">
      <img
        :src="computedAvatar"
        alt="User Avatar"
        class="rounded-circle"
        style="width: 40px; height: 40px"
      />
    </div>

    <!-- Nội dung bình luận -->
    <div class="comment-content">
      <h6 class="author-name mb-1">
        {{ comment.FullName || 'Unknown member' }}
      </h6>
      <small class="text-muted">{{ timeAgo || 'a few seconds ago' }}</small>
      <p class="comment-text mb-0">{{ comment.Content }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from 'vue';
import axios from 'axios';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
const route = useRoute();

// Props nhận dữ liệu từ bên ngoài
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});

// Tính toán thời gian
const timeAgo = computed(() => {
  const currentTime = new Date();
  const createdTime = new Date(props.comment.CreatedAt);
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
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
});

// Avatar mặc định nếu không có avatar
const computedAvatar = computed(() => {
  return props.comment.AvatarUrl || 'https://via.placeholder.com/40';
});
</script>

<style scoped>
.comment-item {
  display: flex;
  align-items: flex-start;
}

.avatar-wrapper img {
  object-fit: cover;
}

.author-name {
  font-weight: bold;
  color: #333;
}

.comment-text {
  font-size: 0.95rem;
  color: #555;
}

.text-muted {
  font-size: 0.85rem;
  color: #888;
}
</style>

<template>
  <div class="welcome-container">
    <div class="welcome-grid">
      <!-- Image Section -->
      <div class="image-section">
        <img
          v-if="imageLoaded"
          :src="imageUrl"
          alt="Dịch vụ dọn dẹp chuyên nghiệp"
          class="welcome-image"
          @error="handleImageError"
        />
        <div v-if="!imageLoaded" class="image-placeholder">
          <div class="placeholder-content">
            <ImageIcon class="placeholder-icon" />
            <p>{{ imageError || 'Đang tải hình ảnh...' }}</p>
          </div>
        </div>
      </div>

      <!-- Welcome Text Section -->
      <div class="text-section">
        <div class="text-content">
          <h1 class="welcome-title">Chào mừng đến với TidyFlex</h1>
          <p class="welcome-greeting">
            Xin chào, {{ cleanerName || 'Nhân viên dọn dẹp' }}!
          </p>
          <div class="welcome-description">
            <p>
              Cảm ơn bạn đã tham gia đội ngũ dọn dẹp của chúng tôi. Bảng điều khiển này giúp bạn quản lý lịch làm việc, theo dõi các nhiệm vụ được giao và mang đến dịch vụ xuất sắc cho khách hàng.
            </p>
            <p>
              Sự tận tâm của bạn trong việc dọn dẹp chất lượng cao góp phần tạo nên sự khác biệt trong cuộc sống của khách hàng mỗi ngày.
            </p>
          </div>
          <div class="welcome-buttons">
            <button class="btn btn-primary">
              <CalendarIcon class="btn-icon" />
              Xem lịch làm việc
            </button>
            <button class="btn btn-secondary">
              <ClipboardListIcon class="btn-icon" />
              Nhiệm vụ của tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Calendar as CalendarIcon, ClipboardList as ClipboardListIcon, Image as ImageIcon } from 'lucide-vue-next';

const props = defineProps({
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  cleanerName: {
    type: String,
    default: ''
  }
});

const imageLoaded = ref(false);
const imageError = ref('');

function handleImageError() {
  imageError.value = 'Failed to load image';
  imageLoaded.value = false;
}

onMounted(() => {
  const img = new Image();
  img.onload = () => {
    imageLoaded.value = true;
  };
  img.onerror = handleImageError;
  img.src = props.imageUrl;
});
</script>

<style scoped>
.welcome-container {
  background-color: #fff;
}

/* Grid Layout */
.welcome-grid {
  display: grid;
  grid-template-columns: 1fr;
}

/* Image Section */
.image-section {
  height: 256px; /* 64 * 4 = 256px */
}

.welcome-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6; /* Màu xám nhạt giống bg-gray-100 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #9ca3af; /* Màu xám giống text-gray-400 */
}

.placeholder-icon {
  width: 48px; /* 12 * 4 = 48px */
  height: 48px;
  margin: 0 auto 8px;
}

/* Text Section */
.text-section {
  padding: 24px; /* 6 * 4 = 24px */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-content {
  max-width: 448px; /* Giống max-w-md */
}

.welcome-title {
  font-size: 30px; /* 3xl tương đương khoảng 30px */
  font-weight: 700;
  color: #1e40af; /* Màu xanh đậm giống blue-900 */
  margin-bottom: 8px;
}

.welcome-greeting {
  font-size: 18px; /* lg tương đương 18px */
  color: #1e40af; /* Màu xanh đậm giống blue-900 */
  margin-bottom: 16px;
}

.welcome-description {
  margin-bottom: 24px;
}

.welcome-description p {
  font-size: 16px; /* base tương đương 16px */
  color: #111827; /* Màu đen giống gray-900 */
  margin-bottom: 12px;
  line-height: 1.5;
}

/* Buttons */
.welcome-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #1e40af; /* Màu xanh đậm giống blue-900 */
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background-color: #1e3a8a; /* Màu xanh đậm hơn giống blue-800 */
}

.btn-secondary {
  border: 1px solid #9ca3af; /* Viền xám giống gray-400 */
  color: #111827; /* Màu đen giống gray-900 */
  background-color: transparent;
}

.btn-secondary:hover {
  background-color: #f3f4f6; /* Nền xám nhạt giống gray-100 */
}

.btn-icon {
  width: 16px; /* 4 * 4 = 16px */
  height: 16px;
  margin-right: 8px;
}

/* Responsive */
@media (min-width: 768px) {
  .welcome-grid {
    grid-template-columns: 1fr 1fr;
  }

  .image-section {
    height: 384px; /* 96 * 4 = 384px */
  }

  .text-section {
    padding: 32px; /* 8 * 4 = 32px */
  }

  .welcome-buttons {
    flex-direction: row;
  }
}
</style>
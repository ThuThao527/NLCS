<template>
  <div class="card shadow-sm">
    <img
      :src="file.ImageUrl"
      class="card-img-top"
      alt="Thumbnail"
      style="height: 150px; object-fit: cover"
    />
    <div class="card-body">
      <h5 class="card-title text-truncate" title="Click to view">
        {{ file.Title }}
      </h5>
      <p class="card-text text-muted">
        <small>Update: {{ timeAgo(file.CreatedAt) }}</small>
      </p>
      <button class="btn btn-primary btn-sm w-100" @click="openFile(file)">
        Open
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
});

const timeAgo = (time) => {
  const currentTime = new Date();
  const createdTime = new Date(time);
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
};
</script>

<style scoped>
.card-title {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-text {
  font-size: 14px;
}
</style>

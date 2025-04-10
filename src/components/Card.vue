<template>
  <div class="card custom-card">
    <!-- Phần hình ảnh -->
    <img :src="image" class="card-img-top" alt="Card image" />
    <!-- Phần nội dung -->
    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-text" id="discription">{{ description }}</p>
      <!-- <a :href="buttonLink" class="btn btn-primary">{{ buttonText }}</a> -->
      <router-link :to="buttonLink" class="btn btn-primary">{{
        buttonText
      }}</router-link>
    </div>
  </div>
</template>

<script setup>
// Định nghĩa các props cho component Card
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  buttonLink: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.card {
  width: 23rem;
  height: 550px;
  padding: 10px;
  border-radius: 10px;
  margin: 20px;
}
img {
  height: 300px;
  width: 100%;
  border-radius: 10px 10px 0 0;
  object-fit: cover;
}

/* Hiệu ứng hover */
.custom-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.custom-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); /* Đổ bóng */
}

.btn {
  font-weight: bold;
  background-color: #1f445f;
}
</style>

<script setup>
import Review from './Review.vue';
</script>

<template>
  <div>
    <div
      class="feedback d-flex flex-column align-items-center justify-content-center"
    >
      <h1>Đánh giá của khách hàng</h1>
      <div class="stars row justify-content-center">
        <i class="fa-solid fa-star col-1"></i>
        <i class="fa-solid fa-star col-1"></i>
        <i class="fa-solid fa-star col-1"></i>
        <i class="fa-solid fa-star col-1"></i>
        <i class="fa-solid fa-star col-1"></i>
      </div>
      <a href="https://www.facebook.com/NgoThao2733/">Xem thên trên Facebook</a>
    </div>
    <div class="container-fluid">
      <!-- <h2>Recent feedback</h2> -->
      <Review></Review>
    </div>
  </div>
</template>

<style scoped>
.feedback {
  padding: 50px 0;
  background: linear-gradient(180deg,  rgb(187, 179, 162),  rgb(228, 219, 196));
  color: #fff;
}

.stars {
  margin: 20px 0;
}
i {
  font-size: 40px;
  color: #fcc737;
  margin-right: 30px;
}

a {
  text-decoration: underline; /* Xóa gạch chân */
  color: #3d3bf3; /* Dùng màu của phần tử cha */
  font-size: 20px;
  font-weight: bold;
}

/* Nếu bạn muốn thay đổi màu sắc của liên kết khi hover */
a:hover {
  color: inherit; /* Dùng màu của phần tử cha khi hover */
  text-decoration: none; /* Xóa gạch chân khi hover */
  background-color: transparent;
}

.container-fluid {
  background-color:  rgb(228, 219, 196);
  padding: 20px 0;
}

.container-fluid h2 {
  padding: 20px 0;
}
</style>

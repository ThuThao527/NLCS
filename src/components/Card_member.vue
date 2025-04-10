<template>
  <div
    class="card custom-card d-flex justify-content-center align-items-center"
  >
    <!-- Phần hình ảnh -->
    <img :src="image" class="card-img-top" alt="Card image" />
    <!-- Phần nội dung -->
    <div class="card-body text-center">
      <h5 class="card-title">{{ position }}</h5>
      <div style="font-size: 18px">{{ name }}</div>
      <p class="card-text" id="discription">{{ description }}</p>
      <div class="social row justify-content-center align-items-center">
        <a :href="facebook" class="col-1">
          <i class="fa-brands fa-facebook"></i
        ></a>
        <a :href="telegram" class="col-1"
          ><i class="fa-brands fa-telegram"></i
        ></a>
        <a :href="linked" class="col-1"
          ><i class="fa-brands fa-linkedin"></i
        ></a>
      </div>
    </div>
  </div>
</template>

<script setup>
// Định nghĩa các props cho component Card
defineProps({
  facebook: {
    type: String,
    default: '#',
  },
  telegram: {
    type: String,
    default: '#',
  },
  linked: {
    type: String,
    default: '#',
  },
  position: {
    type: String,
    required: true,
  },
  name: {
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
});
</script>

<style scoped>
.card {
  width: 23rem;
  height: 500px;
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
.card-img-top {
  height: 250px;
  width: 250px;
  border-radius: 50%;
  border: 3px solid black;
}

a {
  color: black;
  font-size: 18px;
}

a:hover,
a i:hover {
  background: none;
}

a .fa-facebook:hover {
  color: #1877f2;
}

a .fa-telegram:hover {
  color: #0088cc;
}

a .fa-linkedin:hover {
  color: #0077b5;
}
</style>

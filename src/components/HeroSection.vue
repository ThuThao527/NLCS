<template>
  <section
    class="d-flex align-items-center justify-content-center"
    :style="{
      backgroundImage: `url(${image})`,
      backgroundRepeat: 'no-repeat',
    }"
  >
    <div class="nameandslogan d-flex flex-column align-items-center fs-1">
      <p>{{ p1 }}</p>
      <p>{{ p2 }}</p>
    </div>
  </section>
</template>

<style>
section {
  height: 750px;
  min-width: 100%;
  /* background-image: url({{image}}); */
  /* background-repeat: no-repeat; */
  /* background-size: cover; */
  /* background-position: 50% 50%; */
  /* background-attachment: fixed; */
}

.nameandslogan p {
  color: #fff;
  font-size: 50px;
  font-weight: bold;
  /* background-color: rgba(242, 183, 5, 0.5); */
  background-color: rgb(
    79,
    146,
    191,
    0.9
  ); /* Màu xanh nước biển nhẹ với độ mờ */
  border-radius: 10px;
  text-align: center;
  width: max-content;
  padding: 0px 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

@media (max-width: 1200px) {
  section {
    height: 600px;
    background-position: -130px -90px;
  }
  p {
    font-size: 18px;
  }
}

/* Khi màn hình có độ rộng từ 768px trở lên (md) */
@media (min-width: 1200px) {
  section {
    height: 600px;
    min-width: 100%;
    /* background-image: url({{image}}); */
    /* background-repeat: no-repeat; */
    /* background-size: cover; */
    /* background-position: 50% 50%; */
    /* background-attachment: fixed; */
  }
  .nameandslogan {
    position: absolute;
    top: 200px;
  }
}
</style>

<script setup>
defineProps({
  image: {
    type: String,
    required: true,
  },
  p1: {
    type: String,
    required: true,
  },
  p2: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="card-tour card">
    <img :src="Tour.Img_Tour" alt="" class="card-img-top" />
    <div class="card-body">
      <h4 class="card-title">| {{ Tour.Duration }} Days</h4>
      <h4 class="card-title">{{ Tour.TourName }}</h4>
      <h6 class="card-text text-primary">From ${{ Tour.Price }} USD</h6>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  Tour: {},
});
</script>

<style scoped>
.card-img-top {
  height: 300px;
  object-fit: cover;
  border-radius: 10px 10px 20px 20px;
}
.card-tour {
  border-radius: 20px 20px 5px 5px;
  transition: 0.25s;
  background-color: #f5f7f8;
}

.card-tour:hover {
  transform: scale(1.06);
}
h6 {
  font-style: italic;
}
</style>

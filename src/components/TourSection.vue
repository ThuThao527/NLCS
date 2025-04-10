<template>
  <div class="container">
    <div class="row">
      <div
        class="col-xl-3 col-md-6 col-lg-4"
        v-for="(item, index) in tours"
        :key="index"
      >
        <router-link :to="`/TourDetail/${item.TourID}`">
          <Card_Tour :Tour="item"></Card_Tour>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import Card_Tour from './Card_Tour.vue';
import axios from 'axios';

const tours = ref([]);
const props = defineProps({});

const fetchTours = async () => {
  try {
    const response = await axios.get(`/api/tour`);
    console.log(response.data);
    tours.value = response.data.filter((tour) => tour.IsDeleted == 0).reverse();
    console.log(tours.value);
  } catch (error) {
    console.error('Error fetching tour:', error);
  }
};

onMounted(() => {
  fetchTours();
});
</script>

<style scoped>
a {
  background: none;
}
</style>

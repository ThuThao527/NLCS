<template>
  <div v-if="user.Role == 'Admin' || user.Role == 'Helper'" class="row">
    <HelperView class="col-1"></HelperView>
    <router-view class="col"></router-view>
  </div>
  <div v-else>
    <Sign_In_And_Out></Sign_In_And_Out>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
// import AdminNavigate from './components/AdminNavigate.vue';
import HelperView from './views/HelperView.vue';
import Sign_In_And_Out from './views/Sign_In_And_Out.vue';
const user = ref({});
// require('dotenv').config();
const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    console.log(userData);
    user.value = userData;
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<style scoped>
.row {
  overflow: hidden;
  max-width: 99vw;
}
</style>

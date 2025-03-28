<template>
  <div v-if="isAuthenticated && (user.Role === 'Admin' || user.Role === 'Helper')" class="row">
    <HelperView class="col-1"></HelperView>
    <!-- <router-view class="col"></router-view> -->
  </div>
  <div v-else>
    <Sign_In_And_Out></Sign_In_And_Out>
  </div>
</template>

<!-- <template>
  <router-view></router-view>
</template> -->

<script setup>
import { onMounted, ref } from 'vue';
import HelperView from './views/HelperView.vue';
import Sign_In_And_Out from './views/Sign_In_And_Out.vue';
import { RouterView } from 'vue-router';

// Khai báo user và trạng thái đăng nhập
const user = ref({});
const isAuthenticated = ref(false);

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    console.log(userData);
    user.value = userData;
    isAuthenticated.value = true; // Đánh dấu đã đăng nhập
  } else {
    user.value = {}; // Reset user nếu không có dữ liệu
    isAuthenticated.value = false; // Chưa đăng nhập
  }
};

onMounted(() => {
  fetchUser();
  // localStorage.removeItem('user');
});
</script>

<style scoped>
.row {
  overflow: hidden;
  max-width: 99vw;
}
</style>
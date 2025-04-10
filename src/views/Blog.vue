<template>
  <div class="body">
    <header>
      <Navigate></Navigate>
      <div class="heroimage">
        <HeroSection
          image="https://www.contemporaryrugs.eu/wp-content/uploads/2023/08/5-Charming-Contemporary-Rugs-To-Create-a-Striking-Living-Room-Design-4-scaled.jpg"
          p1="Mẹo vặt cuộc sống"
          p2="Giúp việc dọn dẹp của bạn dễ dàng hơn"
        ></HeroSection>
      </div>
      
    </header>
    <main>
      <BlogList></BlogList>
      <!-- <PdfViewer></PdfViewer> -->
      <Footer></Footer>
    </main>
  </div>
</template>

<style scoped>
.heroimage {
  height: 450px;
  overflow: hidden;
}
.body{
  background-color: rgb(210, 204, 196) !important;
  color: black;
}

header .content {
  background-color: rgba(31, 68, 95);
  font-size: 1.5rem;
  color: #fff;
  padding: 20px;
}
</style>

<script setup>
import Navigate from '@/components/Navigate.vue';
import Footer from '@/components/Footer.vue';
import HeroSection from '@/components/HeroSection.vue';
import BlogList from '@/components/BlogList.vue';
// import PdfViewer from '@/components/PdfViewer.vue';
// import BlogForm from '@/components/BlogForm.vue';
import { onMounted, ref, reactive } from 'vue';
import axios from 'axios';

const formData = reactive({
  admin: false,
});

// const isAdmin = async () => {
//   // Lấy thông tin người dùng từ localStorage
//   const userData = JSON.parse(localStorage.getItem('user'));

//   if (userData) {
//     // Lấy mảng admins từ một hàm bất đồng bộ fetchAdmin
//     const admins = await fetchAdmin();

//     // Kiểm tra xem có id nào trong admins bằng với userData.id không
//     formData.admin = admins.some((admin) => admin.id === userData.id);

//     if (formData.admin) {
//       console.log('User is an admin');
//     } else {
//       console.log('User is not an admin');
//     }
//   } else {
//     console.log('No user data found');
//   }
// };

// const fetchAdmin = async () => {
//   try {
//     const response = await axios.get(`/api/users/admin`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching comments:', error);
//   }
// };

// onMounted(() => {
//   isAdmin();
// });
</script>

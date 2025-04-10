<template>
  <div class="container mt-4">
    <!-- Title -->
    <h2 class="mb-4">Reportages</h2>

    <!-- Danh sách các tệp -->
    <div class="row">
      <div
        class="col-xl-3 col-md-6 col-lg-4 blog-card"
        v-for="(file, index) in paginatedFiles"
        :key="index"
        style="margin-bottom: 20px"
      >
        <div class="roportage">
          <router-link :to="`/view-file/${file.PostID}`">
            <pdfCard :file="file"></pdfCard>
          </router-link>
          <button
            v-if="formData.admin"
            class="btn btn-link text-danger p-0 mt-2"
            @click="deleteBlog(file.PostID, file.post_content_id)"
          >
            <i class="fa-solid fa-rectangle-xmark fs-5"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage - 1)"
            >Previous</a
          >
        </li>
        <li
          class="page-item"
          :class="{ active: currentPage === page }"
          v-for="page in totalPages"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="goToPage(page)">{{
            page
          }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a
            class="page-link"
            href="#"
            @click.prevent="goToPage(currentPage + 1)"
            >Next</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import pdfCard from './pdfCard.vue';

const formData = reactive({
  admin: true,
  reportages: [],
});
// Dữ liệu về các tệp
const currentPage = ref(1);
const itemsPerPage = 4; // Số lượng item trên mỗi trang

// Fetch dữ liệu từ API
const fetchReportage = () => {
  axios
    .get('/api/posts', {
      params: { category_name: 'reportage' },
    })
    .then((response) => {
      formData.reportages = response.data; // Gán dữ liệu vào reportages
    })
    .catch((error) => {
      console.error('Error fetching reports:', error);
    });
};

// Tính toán trang hiển thị
const totalPages = computed(() => {
  return Math.ceil(formData.reportages.length / itemsPerPage);
});

// Lọc các tệp sẽ hiển thị trên trang hiện tại
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return formData.reportages.slice(start, end);
});

// Chuyển trang
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

async function deleteBlog(postId, postContentId) {
  try {
    // Hiển thị thông báo xác nhận trước khi xóa
    const isConfirmed = confirm(
      'Are you sure you want to delete this blog post and its content?'
    );
    if (!isConfirmed) {
      console.log('Deletion canceled by user.');
      return;
    }

    // Gửi yêu cầu DELETE đến API
    const response = await axios.delete(
      `/api/posts/${postId}/contents/${postContentId}`
    );

    // Kiểm tra phản hồi từ API
    if (response.status === 200) {
      console.log(response.data.message);
      // Thực hiện cập nhật giao diện (ví dụ: xóa bài đăng khỏi danh sách hiện tại)
      fetchReportage(); // Hàm cập nhật danh sách bài đăng
    }
  } catch (error) {
    // Xử lý lỗi
    if (error.response) {
      // Lỗi từ phía server
      console.error(error.response.data.message);
      alert(error.response.data.message); // Hiển thị thông báo lỗi
    } else {
      // Lỗi không xác định (kết nối hoặc vấn đề khác)
      console.error('Error deleting blog:', error.message);
      alert('Something went wrong. Please try again later.');
    }
  }
}
const isAdmin = async () => {
  // Lấy thông tin người dùng từ localStorage
  const userData = JSON.parse(localStorage.getItem('user'));

  if (userData) {
    // Lấy mảng admins từ một hàm bất đồng bộ fetchAdmin
    const admins = await fetchAdmin();

    // Kiểm tra xem có id nào trong admins bằng với userData.id không
    // formData.admin = admins.some((admin) => admin.id === userData.id);

    if (formData.admin) {
      console.log('User is an admin');
    } else {
      console.log('User is not an admin');
    }
  } else {
    console.log('No user data found');
  }
};

const fetchAdmin = async () => {
  try {
    const response = await axios.get(`/api/users/admin`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

onMounted(() => {
  fetchReportage();
  isAdmin();
});
</script>

<style scoped>
a {
  background: none;
}

/* Hover */
.blog-card:hover {
  transform: scale(1.025);
  background-color: transparent;
}

.blog-card:hover .card-title {
  color: darkred;
}

.blog-card:hover .card-text {
  color: #6c757d;
}

.roportage {
  position: relative;
}

.roportage button {
  position: absolute;
  top: 25px;
  right: 10px;
  background-color: #fff;
  text-align: center;
}
.roportage button i {
  padding: 2px;
}
</style>

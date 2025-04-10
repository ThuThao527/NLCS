<template>
  <div class="body">
    <div class="container">
      <!-- Title -->
      <h1 class="mb-4">Reportages</h1>

      <!-- Danh sách các tệp -->
      <div class="row">
        <div
          class="col-xl-3 col-md-6 col-lg-4 blog-card"
          v-for="(file, index) in paginatedFiles"
          :key="index"
        >
          <div class="roportage">
            <router-link :to="`/view-file/${file.PostID}`">
              <pdf-card :file="file"></pdf-card>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center mb-0 pb-3">
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
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import pdfCard from './pdfCard.vue';

const formData = reactive({
  admin: false,
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

const isAdmin = async () => {
  // Lấy thông tin người dùng từ localStorage
  const userData = JSON.parse(localStorage.getItem('user'));

  if (userData) {
    // Lấy mảng admins từ một hàm bất đồng bộ fetchAdmin
    const admins = await fetchAdmin();

    // Kiểm tra xem có id nào trong admins bằng với userData.id không
    formData.admin = admins.some((admin) => admin.id === userData.id);

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
.body {
  background: linear-gradient(to bottom, #4f92bf, #b3d5ed);
}
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

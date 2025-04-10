<template>
  <div class="blog_list">
    <div class="container">
      <h1 class="mx-3">Our Blogs</h1>
      <div class="row">
        <div
          v-for="blog in pagedBlogs"
          :key="blog.PostID"
          class="col-xl-3 col-md-6 col-lg-4"
        >
          <div class="blog_card">
            <Actical_card
              :image="blog.ImageUrl"
              :title="blog.Title"
              :description="blog.ContentIntro.slice(0, 100) + '...'"
              :author="blog.Author"
              :authorAvatar="blog.AuthorAvatar"
              :views="blog.Views"
              :id="blog.PostID"
              :create_at="blog.CreatedAt"
            ></Actical_card>
            <button
              v-if="formData.admin"
              class="btn btn-link text-danger p-0 mt-2"
              @click="deleteBlog(blog.PostID, blog.PostContentID)"
            >
              <i class="fa-solid fa-rectangle-xmark fs-5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav>
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click="changePage(currentPage - 1, $event)"
              >Previous</a
            >
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click="changePage(page, $event)">{{
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
              @click="changePage(currentPage + 1, $event)"
              >Next</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';
import axios from 'axios';
import Actical_card from './Actical_card.vue';

const blogs = ref([]); // Tất cả bài viết
const currentPage = ref(1); // Trang hiện tại
const formData = reactive({
  admin: true,
  itemsPerPage: 8,
});

// Khai báo biến itemsPerPage

// Hàm cập nhật giá trị itemsPerPage theo kích thước màn hình
function updateItemsPerPage() {
  const screenWidth = window.innerWidth;

  if (screenWidth > 1200) {
    formData.itemsPerPage = 8; // Màn hình lớn
  } else if (screenWidth > 768) {
    formData.itemsPerPage = 4; // Màn hình trung bình
  } else {
    formData.itemsPerPage = 3; // Màn hình nhỏ
  }
}

// Loại bỏ sự kiện khi component bị hủy
onUnmounted(() => {
  window.removeEventListener('resize', updateItemsPerPage);
});
// Lấy danh sách blog từ API khi component được mounted
onMounted(() => {
  fetchBlog();
  isAdmin();
  updateItemsPerPage(); // Gọi hàm lần đầu khi component được mount
  window.addEventListener('resize', updateItemsPerPage);
});

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

// Tính toán số trang
const totalPages = computed(() => {
  return Math.ceil(blogs.value.length / formData.itemsPerPage);
});

// Lọc các bài blog hiển thị trên trang hiện tại
const pagedBlogs = computed(() => {
  const startIndex = (currentPage.value - 1) * formData.itemsPerPage;
  const endIndex = startIndex + formData.itemsPerPage;
  return blogs.value.slice(startIndex, endIndex);
});

// Thay đổi trang
const changePage = (page, event) => {
  event.preventDefault(); // Ngừng cuộn lên đầu trang
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const fetchBlog = async () => {
  try {
    await axios
      .get('/api/posts', {
        params: { category_name: 'blog' },
      })
      .then((response) => {
        blogs.value = response.data; // Gán dữ liệu vào blogs
      })
      .catch((error) => {
        console.error('Error fetching blogs:', error);
      });
  } catch (error) {
    console.error('Error fetching blog:', error);
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
    fetchBlog();

    // Kiểm tra phản hồi từ API
    if (response.status === 200) {
      alert('Delete successful!');
      console.log(response.data.message);
      // Thực hiện cập nhật giao diện (ví dụ: xóa bài đăng khỏi danh sách hiện tại)
      // Hàm cập nhật danh sách bài đăng
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
</script>

<style scoped>
.blog_list {
  background-color: #b3d5ed;
  padding: 20px 0;
  margin-left: auto;
  margin-right: auto;
}

.blog_card {
  position: relative;
}

.blog_card button {
  position: absolute;
  top: 0;
  right: 8px;
  background-color: #fff;
}

.blog_card button i {
  padding: 2px;
}
</style>

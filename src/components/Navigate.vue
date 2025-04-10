<template>
  <div class="navigate">
    <div class="navbar navbar-expand-xl bg-light" id="navbar">
      <div class="navbar-brand mx-0 col-2 d-flex justify-content-center">
        <router-link to="/" class="image-container">
          <img src="../assets/logo.png" alt="Logo" class="logo-img" />
        </router-link>
      </div>
      <button
        class="navbar-toggler"
        data-bs-toggle="collapse"
        data-bs-target="#nav"
        aria-controls="nav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse row row-cols-2" id="nav">
        <div class="navbar-nav col-8">
          <ul class="navbar-nav nav-pills nav-left">
            <li class="nav-item">
              <router-link
                to="/"
                class="nav-link text-center"
                active-class="active"
                >Home</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                to="/About"
                class="nav-link text-center"
                active-class="active"
                >About Us</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                to="/Blog"
                class="nav-link text-center"
                active-class="active"
                >Blogs</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                to="/Ebook"
                class="nav-link text-center"
                active-class="active"
                >Ebooks</router-link
              >
            </li>
            <li class="nav-item text-center">
              <router-link
                to="/Booking"
                class="store mx-4 text-center text-primary"
              >
                <i class="bx bx-card bx-tada bx-flip-horizontal fs-1" @click="handleClick"></i>
              </router-link>
            </li>

            <li class="nav-item text-center">
              <router-link
                to="/Profile"
                class="store mx-4 text-center text-primary"
              >
                <i class="bx bxs-store bx-tada bx-flip-horizontal fs-1" @click="handleClick"></i>
              </router-link>
            </li>
          </ul>
        </div>
        <div
          class="account col-4 order-0 d-flex justify-content-end align-items-center"
        >
          <div class="text-center mx-2">
            <div>
              <img
                class="avatar router-link-hover"
                :src="
                  user.image_avatar 
                "
                alt="Avatar"
                style="width: 55px; height: 55px"
                @click="handleClick"
              />
            </div>
            <div v-if="isCardVisible">
              <div class="card" style="width: 18rem">
                <img
                  :src="
                    user.image_avatar 
                  "
                  class="card-img-top rounded-circle"
                  alt="User Avatar"
                />
                <div class="card-body text-center">
                  <h5 class="card-title">{{ user.name }}</h5>
                  <p class="card-text">{{ user.email }}</p>
                  <button @click="logout" class="btn btn-danger">
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { ref } from 'vue';
import { useRouter, onBeforeRouteUpdate } from 'vue-router';
const router = useRouter();

// Dữ liệu người dùng từ localStorage (hoặc Vuex nếu bạn sử dụng Vuex)
const user = reactive({
  email: '',
  name: '',
  image_avatar: '',
});

const isLoggedIn = ref(false); // Kiểm tra trạng thái đăng nhập
const isCardVisible = ref(false); // Kiểm soát hiển thị card thông tin
// Hàm xử lý khi click vào avatar
const handleClick = () => {
  if (isLoggedIn.value) {
    // Nếu đã đăng nhập, hiển thị card
    isCardVisible.value = !isCardVisible.value;
  } else {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    window.location.href = '/sign_in_and_out';
  }
};

const logout = () => {
  const confirmDelete = confirm('Are you sure you want to log out?');
  if (!confirmDelete) {
    return; // Hủy xóa nếu người dùng chọn "Cancel"
  }
  // Xử lý đăng xuất, ví dụ: Xóa thông tin người dùng và điều hướng lại
  console.log('Đăng xuất');
  localStorage.removeItem('user'); // Nếu thông tin người dùng được lưu trong localStorage với key là 'user'
  localStorage.removeItem('authToken'); // Nếu có token lưu trong localStorage, bạn cũng cần xóa nó

  // Có thể xóa session, token, hoặc điều hướng đến trang đăng nhập
  isCardVisible.value = false; // Ẩn card sau khi đăng xuất
  // Nếu cần, có thể điều hướng người dùng đến trang đăng nhập
  alert('log out successfull');
  fetchUser();
  router.push('/');
  // window.location.reload();
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    isLoggedIn.value = true;
    user.email = userData.Email;
    user.name = userData.FullName;
    user.image_avatar = userData.AvatarUrl;
  } else {
    isLoggedIn.value = false;
    user.email = '';
    user.name = '';
    user.image_avatar = '';
  }
};
onMounted(() => {
  const button = document.querySelector('.navbar-toggler');
  const navbar = document.querySelector('#navbar');

  button.addEventListener('click', () => {
    navbar.classList.toggle('active'); // Toggle class 'active' để thay đổi màu
  });

  fetchUser();
});

onBeforeRouteUpdate((to, from, next) => {
  fetchUser();
  next(); // Cho phép điều hướng
});
</script>

<style scoped>
.card {
  position: absolute;
  margin-top: 10px;
  right: 0;
}
.card-img-top {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin: 20px auto;
  border: 2px solid #ddd;
}
a:hover {
  background: none;
}
.navigate {
  position: absolute;
  top: 5%;
  width: 100%;
  height: auto;
}

.image-container {
  width: 75px; /* Tăng kích thước vòng tròn */
  border-radius: 50%; /* Tạo vòng tròn */
  overflow: hidden; /* Ẩn phần ảnh ngoài vòng tròn */
  display: flex;
  justify-content: center; /* Căn giữa ảnh theo chiều ngang */
  align-items: center; /* Căn giữa ảnh theo chiều dọc */
  /* border: 2px solid white;  */
}

.logo-img {
  width: 100%; /* Đảm bảo ảnh phủ đầy vòng tròn */
  height: auto; /* Giữ tỷ lệ ảnh */
  transform: scale(2) translateY(4px);
}

ul {
  font-size: 1.15em;
  color: blue;
}
.nav-link.active {
  background-color: #1f445f; /* Màu nền xanh */
  color: white; /* Màu chữ trắng */
}

.nav-item {
  padding: 10px 10px;
  height: 100%;
}

/* Tùy chỉnh cho trạng thái disabled */
.nav-link {
  background-color: transparent; /* Nền trong suốt */
  color: #1f445f; /* Màu chữ xanh */
  font-weight: bold;
  padding: 10px 20px;
  /* border: 2px solid white; */
  border-radius: 50px;
}

.nav-link:active {
  transform: scale(0.95); /* Thu nhỏ phần tử khi click */
  transition: transform 0.2s ease-in-out;
}

/* Tùy chỉnh trạng thái hover */
.nav-link:not(.disabled):hover {
  background-color: #1f445f; /* Màu nền khi hover */
  color: white; /* Màu chữ trắng khi hover */
}

.navbar {
  color: white;
  transition: opacity 0.5s ease, transform 0.5s ease;
  z-index: 999;
}

.navbar.hidden {
  opacity: 0; /* Mờ dần */
  transform: translateY(-100%); /* Di chuyển lên trên */
}

.navbar-toggler {
  margin-right: 20px;
}

#navbar {
  /* background-color: transparent !important; */
  background-color: rgba(255, 255, 255, 0.2) !important;
  transition: background-color 0.3s ease;
  border-width: 2px;
  /* border: 2px solid white; */
  border-radius: 50px;
  width: 95%;
  padding: 0;
  margin: auto;
}

#navbar.active {
  background-color: rgba(255, 255, 255, 1) !important;
}

/* Đổi màu nền nút toggler */
.navbar-toggler {
  border: none; /* Đường viền trắng */
  font-size: 30px;
}

/* Đổi màu của các icon gạch ngang */
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23000' viewBox='0 0 30 30'%3E%3Cpath stroke='%234f92bf' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.navbar-toggler:focus,
.navbar-toggler:active {
  outline: none;
  box-shadow: none;
}

a:focus,
a:active,
button:focus,
button:active {
  outline: none;
  box-shadow: none;
}

.avatar {
  max-width: 60px;
  border-radius: 50%;
  /* margin-right: 40px; */
}

/* Khi màn hình có độ rộng từ 576px trở xuống (sm) */
@media (max-width: 1200px) {
  .nav-link {
    width: 100%; /* Chiếm toàn bộ chiều rộng */
  }
  .avatar {
    margin-bottom: 40px;
  }
  .account {
    justify-content: center !important;
    align-items: center !important;
  }
  .nav-left {
    border-right: 0.25px solid grey;
    margin-bottom: 30px;
  }
}

/* Khi màn hình có độ rộng từ 768px trở lên (md) */
@media (min-width: 1200px) {
  .nav-link {
    width: 150px;
  }
}
</style>

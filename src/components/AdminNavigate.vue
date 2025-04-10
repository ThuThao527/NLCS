<template>
  <div :class="['adminNavigate ', isMenuOpen ? 'open' : 'closed']">
    <div class="d-flex justify-content-between">
      <div
        v-if="isMenuOpen"
        class="account col-4 order-0 d-flex flex-column justify-content-center align-items-end"
      >
        <div class="text-center mx-2">
          <div>
            <img
              class="avatar router-link-hover"
              :src="
                user.avatarurl
                  ? user.avatarurl
                  : 'https://i.pinimg.com/736x/f6/d5/fe/f6d5fe0a4ce89d111b60cf8f7a552502.jpg'
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
                  user.avatarurl
                    ? user.avatarurl
                    : 'https://i.pinimg.com/736x/f6/d5/fe/f6d5fe0a4ce89d111b60cf8f7a552502.jpg'
                "
                class="card-img-top rounded-circle"
                alt="User Avatar"
              />
              <div class="card-body text-center">
                <h5 class="card-title">{{ user.fullname }}</h5>
                <p class="card-text">{{ user.email }}</p>
                <button @click="logout" class="btn btn-danger">
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-end pt-3 menu-icon" @click="toggleMenu">
        <i class="bx bx-menu fs-1"></i>
      </div>
    </div>

    <div>
      <hr />
      <div class="d-flex flex-column text-center" v-if="isMenuOpen">
        <router-link
          to="/booking"
          class="btn my-2 border"
          active-class="active"
          type="button"
        >
          Booking
        </router-link>

        <router-link
          to="/service"
          class="btn border"
          active-class="active"
          type="button"
        >
          Service
        </router-link>

        <router-link
          to="/tour"
          class="btn border my-2"
          active-class="active"
          type="button"
        >
          Tour
        </router-link>

        <router-link
          to="/adminBlog"
          class="btn border"
          active-class="active"
          type="button"
        >
          Blog
        </router-link>

        <router-link
          to="/user"
          class="btn border my-2"
          active-class="active"
          type="button"
        >
          User
        </router-link>
        <router-link
          to="/statistics"
          class="btn border"
          active-class="active"
          type="button"
        >
          Statistics
        </router-link>
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
  fullname: '',
  avatarurl:
    'https://i.pinimg.com/736x/f6/d5/fe/f6d5fe0a4ce89d111b60cf8f7a552502.jpg',
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
  fetchUser();
  router.push('/');
  location.reload();
  // window.location.reload();
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    isLoggedIn.value = true;
    user.email = userData.Email;
    user.fullname = userData.FullName;
    user.avatarurl = userData.AvatarUrl;
    console.log(user.avatarurl);
  } else {
    isLoggedIn.value = false;
  }
};

const isMenuOpen = ref(true);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

onMounted(() => {
  fetchUser();
});

onBeforeRouteUpdate((to, from, next) => {
  fetchUser();
  next(); // Cho phép điều hướng
});
</script>

<style scoped>
.adminNavigate {
  background-color: aliceblue;
  position: relative;
  left: 0;
  top: 0;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  min-height: 100vh;
}

.adminNavigate.open {
  width: 250px;
}

.adminNavigate.closed {
  width: 60px;
}

.adminNavigate .btn {
  background-color: #37afe1;
  color: white;
}

.adminNavigate .btn.active {
  background-color: blue;
}

.menu-icon {
  cursor: pointer;
  padding-right: 10px;
}

.btn {
  font-size: large;
  margin: 0 10px;
  transition: all 0.3s ease-in-out;
}

/* .adminNavigate.closed .btn {
  opacity: 0;
  pointer-events: none;
} */
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

.avatar {
  max-width: 60px;
  border-radius: 50%;
  /* margin-right: 40px; */
}
.account {
  margin: 10px 10px 0 10px;
  transition: all 0.3s ease-in-out;
}
@media (max-width: 1200px) {
  .avatar {
    margin-bottom: 40px;
  }
  .account {
    justify-content: center !important;
    align-items: center !important;
  }
}
</style>

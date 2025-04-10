<template>
  <div
    class="container-fluid vh-100 d-flex align-items-center justify-content-center"
  >
    <div
      class="row shadow-lg rounded-3 overflow-hidden"
      style="width: 70%; max-width: 900px"
    >
      <!-- Left Section -->
      <div
        class="col-md-6 bg-primary text-white p-5 d-flex flex-column align-items-center justify-content-center left-section"
      >
        <h1 class="fw-bold mb-4 text-center">
        Tham Gia Ngay Hôm Nay <br />
          Tìm Việc Làm Dễ Dàng <br />
          Thu Nhập Ổn Định! 🏠
                </h1>
        <img
          src="../assets/signin_image_admin2.jpg"
          alt="Study Online"
          class="img-fluid"
          style="max-height: 400px"
        />
      </div>

      <!-- Right Section -->
      <div class="col-md-6 bg-white p-5 right-section">
        <h3 class="fw-bold mb-4">
          {{ isLogin ? 'Đăng nhập' : 'Tạo tài khoản' }}
        </h3>
        <form @submit.prevent="handleSubmit">
          <!-- Full Name -->
          <div class="mb-3" v-if="!isLogin">
            <input
              v-model="FullName"
              type="text"
              class="form-control"
              placeholder="Họ và tên"
              required
            />
          </div>

          <!-- Email -->
          <div class="mb-3">
            <input
              v-model="Email"
              type="email"
              class="form-control"
              placeholder="Email "
              required
            />
          </div>

          <!-- Phone Number -->
          <div class="mb-3" v-if="!isLogin">
            <input
              v-model="PhoneNumber"
              type="text"
              class="form-control"
              placeholder="Số điện thoại"
              required
            />
          </div>

          <!-- Address -->
          <div class="mb-3" v-if="!isLogin">
            <input
              v-model="Address"
              type="text"
              class="form-control"
              placeholder="Địa chỉ"
              required
            />
          </div>

          <!-- Role -->
          <div class="mb-3" v-if="!isLogin">
            <!-- <label for="role" class="form-label">Role</label> -->
            <select
              v-model="Role"
              class="form-control"
              id="role"
              required
            >
              <option value="" disabled>Chọn vai trò</option>
              <!-- <option value="Admin">Admin</option> -->
              <option value="Customer">Khách hàng</option>
              <option value="Helper">Cộng tác viên</option>
            </select>
          </div>

          <!-- Password -->
          <div class="mb-3 position-relative">
            <input
              v-model="Password"
              type="password"
              class="form-control"
              placeholder="Mật khẩu"
              required
            />
          </div>

          <!-- Confirm Password -->
          <div class="mb-3" v-if="!isLogin">
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <!-- Terms & Conditions -->
          <div class="form-check mb-3" v-if="!isLogin">
            <input
              type="checkbox"
              class="form-check-input"
              id="terms"
              required
            />
            <label class="form-check-label" for="terms">
              Tôi đồng ý với 
              <a href="#" class="text-decoration-none"> các điều khoản của dịch vụ</a> và
              <a href="#" class="text-decoration-none">các chính sách</a>.
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary w-100 mb-3">
            {{ isLogin ? 'Đăng nhập' : 'Đăng ký' }}
          </button>

          <!-- Google Sign In -->
          <div id="buttonDiv"></div>

          <!-- Toggle Form -->
          <p class="text-center">
            {{
              isLogin ? "Bạn chưa có tài khoản?" : 'Bạn đã có tài khoản?'
            }}
            <a href="#" class="text-decoration-none color-button" @click="toggleForm">
              {{ isLogin ? 'Đăng ký' : 'Đăng nhập' }}
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      isLogin: true, // Mặc định là form Sign Up
      Email: '',
      Password: '',
      FullName: '',
      PhoneNumber: '',
      Address: '', // Thêm trường Address
      Role: '', // Trường Role
      confirmPassword: '',
      AvatarUrl:
        'https://i.pinimg.com/474x/93/75/ae/9375aef3b0ea35e0cf4ca12862bb5fef.jpg',
      clientId:
        '670067480853-d1603i5t2felgj6kdgh3bagbrsgca5i3.apps.googleusercontent.com',
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    toggleForm() {
      this.isLogin = !this.isLogin; // Chuyển đổi form
      this.clearForm();
    },
    clearForm() {
      this.Email = '';
      this.Password = '';
      this.FullName = '';
      this.PhoneNumber = '';
      this.Address = ''; // Xóa trường Address
      this.Role = ''; // Xóa trường Role
      this.confirmPassword = '';
    },
    async handleSubmit() {
      try {
        console.log('Role:', this.Role);
        
        if (!this.isLogin && this.Password !== this.confirmPassword) {
          alert('Passwords do not match.');
          return;
        }
        const endpoint = this.isLogin ? '/api/login' : '/api/register';
        const payload = {
          Email: this.Email,
          Password: this.Password,
          ...(this.isLogin ? {} : { FullName: this.FullName }),
          ...(this.isLogin ? {} : { PhoneNumber: this.PhoneNumber }),
          ...(this.isLogin ? {} : { Address: this.Address }), // Thêm Address vào payload
          ...(this.isLogin ? {} : { Role: this.Role }), // Thêm Role vào payload
          AvatarUrl: this.AvatarUrl,
        };
        console.log(payload);
        const response = await axios.post(endpoint, payload);
        alert(response.data.message);

        if (!this.isLogin && response.status === 201) {
          alert("Let's Sign In");
          this.isLogin = true; // Chuyển sang form Sign In
        }

        console.log('API Response:', response.data);
        console.log('Current route:', this.$route.path); // Log route hiện tại
        console.log('API Response:', response.data);

        if (response.data.user) {
          localStorage.setItem('token', response.data.token);
          console.log('Saving user to localStorage:', response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('User saved to localStorage');
          console.log('Redirecting to /home');
          //alert(response.data.message);
          if (response.data.user.Role === 'Helper') {
            this.$router.push('/').then(() => {
              window.location.reload(); // Tải lại trang sau khi điều hướng
              });
            }
          else if (response.data.user.Role === 'Admin') {
            console.log('Redirecting to /admin for Admin');
            this.$router.push('/admin').then(() => {
              window.location.reload(); // Tải lại trang sau khi điều hướng
              });
          }
        } else {
          console.log('User not found in response');
          alert('Error: User data not found in response');
        }
      } catch (error) {
        console.error('Error:', error.response); // In toàn bộ phản hồi lỗi
        if (error.response && error.response.data && error.response.data.message) {
          alert('Error: ' + error.response.data.message);
        } else {
          alert('Error: Something went wrong. Please try again.');
        }
      }
    },

    async handleCredentialResponse(response) {
      const data = this.parseJwt(response.credential);

      try {
        const response = await axios.post(
          '/api/google-login',
          {
            FullName: data.name,
            Email: data.email,
            PhoneNumber: 'N/A', // Giá trị mặc định cho Google Sign-In
            Address: 'N/A', // Giá trị mặc định cho Google Sign-In
            AvatarUrl: data.picture,
            Role: 'Customer', // Gán mặc định Role cho Google Sign-In
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);

        this.router.push('/');
        //alert('Sign in successful!');
      } catch (error) {
        console.error('Error during the request:', error);
      }
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    },
  },
  // mounted() {
  //   const script = document.createElement('script');
  //   script.src = 'https://accounts.google.com/gsi/client';
  //   script.async = true;
  //   document.body.appendChild(script);

  //   script.onload = () => {
  //     google.accounts.id.initialize({
  //       client_id: this.clientId,
  //       callback: this.handleCredentialResponse,
  //     });

  //     google.accounts.id.renderButton(document.getElementById('buttonDiv'), {
  //       theme: 'outline',
  //       size: 'large',
  //     });
  //   };
  // },
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
}

.btn-outline-danger i {
  margin-right: 5px;
}

form {
  font-size: 0.9rem;
}

.btn-outline-secondary {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fw-bold,
.mb-4,
.mb-3,
.form-label {
  color: #000 !important; /* Màu đen cho tất cả các phần tử */
  transition: none !important; /* Loại bỏ hiệu ứng chuyển màu */
}

.left-section {
  background-color: #ffffff !important; /* Màu nền xanh lá nhạt */
  color: #000 !important; /* Màu chữ đen */
}

.right-section {
  background-color: #c7e1e4 !important; /* Màu nền xám nhạt */
}
.btn-primary {
  background-color: #88c7ce !important; /* Màu nền xanh lá cây */
  color: #fff !important; /* Màu chữ trắng */
  border: none; /* Bỏ viền (nếu có) */
}

.btn-primary:hover {
  background-color: #5a8b90 !important; /* Màu nền khi hover */
  color: #fff !important; /* Màu chữ khi hover */
}

.text-center{
  color: #000000 !important;
}
.left-section h1 {
  font-size: 1.8rem; /* Tăng kích thước chữ */
  font-weight: 700; /* Chữ đậm hơn */
}
</style>
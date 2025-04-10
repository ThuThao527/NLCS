<template>
  <div class="profile-container">
    <h1>Thông tin cá nhân</h1>
    
    <div class="profile-grid">
      <!-- Profile Picture Section -->
      <div class="profile-picture-section">
        <div class="profile-picture-wrapper">
          <div class="profile-picture">
            <img 
              v-if="profileData.profilePicture" 
              :src="profileData.profilePicture" 
              alt="Profile picture"
            />
            <div v-else class="profile-placeholder">
              <User class="user-icon" />
            </div>
          </div>
          
          <div v-if="isEditing" class="upload-button">
            <label for="profile-picture-upload">
              <Camera class="camera-icon" />
            </label>
            <input 
              id="profile-picture-upload" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleImageUpload"
            />
          </div>
        </div>
        
        <h2>{{ profileData.fullName || 'Your Name' }}</h2>
        <p>{{ profileData.email || 'email@example.com' }}</p>
        
        <div class="action-buttons">
          <button 
            v-if="!isEditing" 
            @click="startEditing"
          >
            <Edit class="button-icon" />
            Chỉnh sửa
          </button>
          <div v-else class="edit-actions">
            <button @click="cancelEditing">
              Hủy
            </button>
            <button @click="saveProfile">
              <Save class="button-icon" />
              Lưu
            </button>
          </div>
        </div>
      </div>
      
      <!-- Profile Information Section -->
      <div class="info-section">
        <div class="info-card">
          <h3>Thông tin cá nhân</h3>
          
          <div class="info-list">
            <!-- Full Name -->
            <div class="info-item">
              <div class="info-label">Họ tên</div>
              <div class="info-content">
                <template v-if="!isEditing">
                  <div>{{ profileData.fullName || 'Not provided' }}</div>
                </template>
                <template v-else>
                  <input 
                    v-model="editedProfile.fullName" 
                    type="text" 
                    placeholder="Nhập họ và tên"
                  />
                  <div v-if="validationErrors.fullName" class="error-message">
                    {{ validationErrors.fullName }}
                  </div>
                </template>
              </div>
            </div>
            
            <!-- Email Address -->
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-content">
                <template v-if="!isEditing">
                  <div>{{ profileData.email || 'Not provided' }}</div>
                </template>
                <template v-else>
                  <input 
                    v-model="editedProfile.email" 
                    type="email" 
                    placeholder="Nhập địa chỉ email"
                  />
                  <div v-if="validationErrors.email" class="error-message">
                    {{ validationErrors.email }}
                  </div>
                </template>
              </div>
            </div>
            
            <!-- Phone Number -->
            <div class="info-item">
              <div class="info-label">Số điện thoại</div>
              <div class="info-content">
                <template v-if="!isEditing">
                  <div>{{ profileData.phoneNumber || 'Not provided' }}</div>
                </template>
                <template v-else>
                  <input 
                    v-model="editedProfile.phoneNumber" 
                    type="tel" 
                    placeholder="Nhập số điện thoại"
                  />
                  <div v-if="validationErrors.phoneNumber" class="error-message">
                    {{ validationErrors.phoneNumber }}
                  </div>
                </template>
              </div>
            </div>
            
            <!-- Address -->
            <div class="info-item">
              <div class="info-label">Địa chỉ</div>
              <div class="info-content">
                <template v-if="!isEditing">
                  <div class="address-text">{{ profileData.address || 'Not provided' }}</div>
                </template>
                <template v-else>
                  <textarea 
                    v-model="editedProfile.address" 
                    rows="3" 
                    placeholder="Nhập địa chỉ"
                  ></textarea>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Additional Information Section -->
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted , watch} from 'vue';
import axios from 'axios';
import { User, Edit, Save, Camera, Star } from 'lucide-vue-next';
import { useRoute } from 'vue-router'; // Để lấy helperId từ route

// State
const profileData = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
  address: '',
  profilePicture: null,
  averageRating: 0,
  totalWorkingHours: 0, // Đổi từ averageWorkingHours thành totalWorkingHours để khớp với API
});

watch(() => profileData.value.averageRating, (newValue, oldValue) => {
  console.log(`averageRating changed from ${oldValue} to ${newValue}`);
});

const isEditing = ref(false);
const editedProfile = ref({});
const validationErrors = ref({});

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Lấy helperId từ route (hoặc từ props, tùy vào cách bạn truyền)
const route = useRoute();
const helperId = route.params.id || 1; // Lấy từ route hoặc mặc định là 1

// Hàm lấy dữ liệu Helper từ API
async function fetchHelperData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // Lấy thông tin Helper
    const response = await axios.get(`${API_BASE_URL}/helpers/${helperId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    profileData.value = {
      fullName: response.data.helper.HelperName || '',
      email: response.data.helper.Email || '',
      phoneNumber: response.data.helper.Phone || '',
      address: response.data.helper.Address || 'Not provided',
      profilePicture: response.data.helper.IMG_Helper ? `${response.data.helper.IMG_Helper}` : null,
      averageRating: 0, // Sẽ cập nhật sau khi gọi API rating
      totalWorkingHours: 0, // Sẽ cập nhật sau khi gọi API total-hours
    };

    // Lấy tổng giờ làm
    const totalHoursResponse = await axios.get(`${API_BASE_URL}/helpers/${helperId}/total-hours`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    profileData.value.totalWorkingHours = totalHoursResponse.data.totalHours || 0;


    console.log('Calling /api/helpers/:helperId/rating-stats');
    const ratingResponse = await axios.get(`${API_BASE_URL}/helpers/${helperId}/rating-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Rating response:', ratingResponse.data);
    profileData.value.averageRating = Number(ratingResponse.data.averageRating) || 0;
    console.log('Updated averageRating:', profileData.value.averageRating); // Thêm log để kiểm tra
  } catch (error) {
    console.error('Error fetching helper data:', error);
    // alert('Không thể tải dữ liệu hồ sơ: ' + (error.response?.data?.message || error.message));
  }
}

// Bắt đầu chỉnh sửa
function startEditing() {
  editedProfile.value = { ...profileData.value };
  isEditing.value = true;
  validationErrors.value = {};
}

// Hủy chỉnh sửa
function cancelEditing() {
  isEditing.value = false;
  validationErrors.value = {};
  editedProfile.value = {};
}

// Validate form trước khi lưu
function validateForm() {
  const errors = {};

  // Validate Full Name
  if (!editedProfile.value.fullName || editedProfile.value.fullName.trim() === '') {
    errors.fullName = 'Họ tên không được để trống';
  }

  // Validate Email
  if (!editedProfile.value.email) {
    errors.email = 'Email không được để trống';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedProfile.value.email)) {
      errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }
  }

  // Validate Phone Number
  if (!editedProfile.value.phoneNumber) {
    errors.phoneNumber = 'Số điện thoại không được để trống';
  } else {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(editedProfile.value.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (VD: +84888211527)';
    }
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Lưu thay đổi hồ sơ
async function saveProfile() {
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append('HelperName', editedProfile.value.fullName);
  formData.append('Email', editedProfile.value.email);
  formData.append('Phone', editedProfile.value.phoneNumber);
  formData.append('Address', editedProfile.value.address || ''); // Đảm bảo gửi Address

  // Xử lý upload ảnh nếu có
  if (editedProfile.value.profilePicture && editedProfile.value.profilePicture.startsWith('data:')) {
    const blob = await (await fetch(editedProfile.value.profilePicture)).blob();
    formData.append('avatar', blob, 'avatar.jpg');
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/helpersUpdate/${helperId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    // Cập nhật lại profileData với dữ liệu mới
    profileData.value = {
      ...profileData.value,
      fullName: editedProfile.value.fullName,
      email: editedProfile.value.email,
      phoneNumber: editedProfile.value.phoneNumber,
      address: editedProfile.value.address,
      profilePicture: response.data.avatarUrl || profileData.value.profilePicture,
    };

    isEditing.value = false;
    alert('Cập nhật thông tin thành công!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Cập nhật thông tin thất bại: ' + (error.response?.data?.message || error.message));
  }
}

// Xử lý upload ảnh
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match('image.*')) {
    alert('Vui lòng chọn một tệp ảnh');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Kích thước ảnh không được vượt quá 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    editedProfile.value.profilePicture = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Load dữ liệu khi component được mount
onMounted(() => {
  fetchHelperData();
});
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS của bạn */
.profile-container {
  padding: 2rem;
  max-width: 64rem;
  margin: 2rem auto;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.profile-container h1 {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr 2fr;
  }
}

.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.profile-picture-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.profile-picture {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.profile-picture:hover {
  transform: scale(1.05);
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.user-icon {
  width: 5rem;
  height: 5rem;
  color: #9ca3af;
}

.upload-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

.upload-button label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, transform 0.2s ease;
}

.upload-button label:hover {
  background: #4338ca;
  transform: scale(1.1);
}

.camera-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.profile-picture-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.profile-picture-section p {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-buttons {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-buttons button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.3s ease, transform 0.2s ease;
}

.action-buttons button:hover {
  background: linear-gradient(90deg, #4338ca 0%, #3730a3 100%);
  transform: translateY(-2px);
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.edit-actions button:first-child {
  flex: 1;
  background: #e5e7eb;
  color: #4b5563;
  transition: background 0.3s ease, transform 0.2s ease;
}

.edit-actions button:first-child:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.edit-actions button:last-child {
  flex: 1;
}

.button-icon {
  width: 1rem;
  height: 1rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 768px) {
  .info-item {
    grid-template-columns: 1fr 2fr;
  }
}

.info-label {
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
}

.info-content div {
  font-size: 1rem;
  color: #111827;
}

.info-content input,
.info-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #111827;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.info-content input:focus,
.info-content textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.info-content textarea {
  resize: vertical;
}

.address-text {
  white-space: pre-line;
}

.error-message {
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.star {
  display: inline-block;
}

.star svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #d1d5db;
  transition: color 0.3s ease;
}

.star .filled {
  color: #f59e0b;
}

.rating-text {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}
</style>
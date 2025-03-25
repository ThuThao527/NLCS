<template>
  <div class="profile-container">
    <h1>Thông tin các nhân</h1>
    
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
        <div class="info-card">
            <h3>Đánh gia công việc</h3>
            
            <div class="info-list">
                <!-- Average Rating -->
                <div class="info-item">
                <div class="info-label">Sao trung bình</div>
                <div class="info-content">
                    <div class="rating-wrapper">
                    <span v-for="n in 5" :key="n" class="star">
                        <Star :class="{ 'filled': n <= Math.round(profileData.averageRating) }" />
                    </span>
                    <span class="rating-text">{{ profileData.averageRating.toFixed(1) }} / 5</span>
                    </div>
                </div>
                </div>
                
                <!-- Average Working Hours -->
                <div class="info-item">
                <div class="info-label">Số giờ làm trung bình</div>
                <div class="info-content">
                    <div>{{ profileData.averageWorkingHours.toFixed(1) }} hours/week</div>
                </div>
                </div>
            </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { User, Edit, Save, Camera, Star } from 'lucide-vue-next';

// Mock data - in a real app, this would come from an API
const defaultProfile = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phoneNumber: '(555) 123-4567',
  address: '123 Main Street\nApt 4B\nNew York, NY 10001',
  profilePicture: null,
  memberSince: new Date('2022-03-15'),
  lastUpdated: new Date('2023-11-20'),
  averageRating: 4.5, // Thêm số sao trung bình (từ 0 đến 5)
  averageWorkingHours: 35.5
};

// State
const profileData = ref({...defaultProfile});
const isEditing = ref(false);
const editedProfile = ref({});
const validationErrors = ref({});

// Start editing mode
function startEditing() {
  editedProfile.value = {...profileData.value};
  isEditing.value = true;
  validationErrors.value = {};
}

// Cancel editing and revert changes
function cancelEditing() {
  isEditing.value = false;
  validationErrors.value = {};
}

// Validate the form
function validateForm() {
  const errors = {};
  
  // Email validation
  if (editedProfile.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedProfile.value.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Save profile changes
function saveProfile() {
  if (!validateForm()) {
    return;
  }
  
  profileData.value = {
    ...editedProfile.value,
    lastUpdated: new Date()
  };
  
  isEditing.value = false;
  
  // In a real app, you would send the updated profile to your API here
  console.log('Profile saved:', profileData.value);
  
  // Show success message (in a real app)
  alert('Profile updated successfully!');
}

// Handle profile picture upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file type
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should not exceed 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    editedProfile.value.profilePicture = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Format date for display
function formatDate(date) {
  if (!date) return 'N/A';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load profile data
onMounted(() => {
  // In a real app, you would fetch the profile data from your API here
  // For this example, we're using the mock data
  
  // Simulate API delay
  setTimeout(() => {
    profileData.value = {...defaultProfile};
  }, 300);
});
</script>

<style scoped>
/* Container chính */
.profile-container {
  padding: 2rem;
  max-width: 64rem;
  margin: 2rem auto;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

/* Tiêu đề */
.profile-container h1 {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Grid chính */
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

/* Phần ảnh đại diện (bên trái) */
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

/* Nút hành động */
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

/* Phần thông tin (bên phải) */
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
  color: #d1d5db; /* Màu sao trống */
  transition: color 0.3s ease;
}

.star .filled {
  color: #f59e0b; /* Màu sao đầy */
}

.rating-text {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

</style>
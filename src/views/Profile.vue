<template>
  <header>
    <Navigate class="navigate"></Navigate>
    <div class="padding-container"></div>
  </header>
  <div class="profile-container">
    <div class="profile-header">
      <div class="container">
        <div class="user-info">
          <div class="avatar-container">
            <img :src="user.avatar" alt="Profile picture" class="avatar" />
            <div class="status-indicator"></div>
          </div>
          <div class="user-details">
            <h1 class="user-name">{{ user.name }}</h1>
            <p class="user-email">{{ user.email }}</p>
            <p class="user-email">{{ user.phone }}</p>
            <p class="user-email">{{ user.address }}</p>
          </div>
          <div class="edit-profile">
            <button class="edit-button" @click="openEditModal">Chỉnh sửa hồ sơ</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Stats -->
    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Các dịch vụ đã đặt</p>
          <p class="stat-value">{{ bookings.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Hoàn thành</p>
          <p class="stat-value completed">{{ completedBookings.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Đang thực hiện</p>
          <p class="stat-value pending">{{ pendingBookings.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Đã hủy</p>
          <p class="stat-value canceled">{{ canceledBookings.length }}</p>
        </div>
      </div>
    </div>

    <!-- Booking History -->
    <div class="container">
      <div class="booking-history">
        <div class="tab-navigation">
          <div class="tabs">
            <button @click="activeTab = 'all'" :class="['tab', activeTab === 'all' ? 'active' : '']">
              Tất cả
            </button>
            <button @click="activeTab = 'completed'" :class="['tab', activeTab === 'completed' ? 'active' : '']">
              Hoàn thành
            </button>
            <button @click="activeTab = 'Pending'" :class="['tab', activeTab === 'Pending' ? 'active' : '']">
              Đang thực hiện
            </button>
            <button @click="activeTab = 'canceled'" :class="['tab', activeTab === 'canceled' ? 'active' : '']">
              Đã hủy
            </button>
          </div>
        </div>

        <div class="booking-content">
          <div class="booking-header">
            <h2 class="section-title">Lịch sử đặt dịch vụ</h2>
            <div class="search-container">
              <input type="text" v-model="searchQuery" placeholder="Search bookings..." class="search-input" />
              <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table class="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ngày</th>
                  <th>Ca làm</th>
                  <th>Tên cộng tác viên</th>
                  <th>Tổng tiền</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Điều chỉnh</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in filteredBookings" :key="booking.BookingID" class="booking-row">
                  <td class="booking-id">{{ booking.BookingID }}</td>
                  <td>{{ formatDate(booking.DateBooking) }}</td>
                  <td>{{ booking.Sessions }}</td>
                  <td>
                    <span @click="showHelperPopup(booking)" class="helper-name clickable">
                      {{ booking.HelperName }}
                    </span>
                  </td>
                  <td>{{ booking.TotalCost.toLocaleString() }} VNĐ</td>
                  <td>{{ formatDate(booking.CreatedDate) }}</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(booking)]">
                      {{ getStatusText(booking) }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="action-button view">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button v-if="booking.Status === 'Pending' && !booking.IsDeleted" class="action-button cancel" @click="openDeletePopup(booking)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredBookings.length === 0">
                  <td colspan="7" class="no-results">
                    Không tìm thấy dịch vụ đã đặt
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <div class="results-count">
              Hiển thị {{ filteredBookings.length }} of {{ bookings.length }} dịch vụ
            </div>
            <div class="pagination-controls">
              <button class="pagination-button" :disabled="currentPage === 1">
                Trước 
              </button>
              <button class="pagination-button" :disabled="true">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Helper Info Popup -->
    <div v-if="showPopup" class="modal-overlay" @click="closeHelperPopup">
      <div class="modal-container helper-popup" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Thông tin Helper</h2>
          <button class="modal-close" @click="closeHelperPopup">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p><strong>Tên:</strong> {{ selectedHelper.HelperName }}</p>
          <p><strong>Số điện thoại:</strong> {{ selectedHelper.Phone }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Edit Profile</h2>
          <button class="modal-close" @click="closeEditModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="name" class="form-label">Name</label>
            <input type="text" id="name" v-model="editedUser.name" class="form-input" />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="editedUser.email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Profile Picture</label>
            <div class="avatar-edit">
              <img :src="editedUser.avatar" alt="Profile picture" class="avatar-preview" />
              <button class="avatar-change-button">Change Picture</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button secondary" @click="closeEditModal">Cancel</button>
          <button class="button primary" @click="saveProfile">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Delete Booking Popup -->
    <div v-if="showDeletePopup" class="modal-overlay" @click="closeDeletePopup">
      <div class="modal-container delete-popup" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Hủy Booking</h2>
          <button class="modal-close" @click="closeDeletePopup">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc muốn hủy booking này không?</p>
          <p v-if="!canDeleteBooking" class="error-text">Chỉ có thể hủy booking khi đang ở trạng thái Pending.</p>
        </div>
        <div class="modal-footer">
          <button class="button secondary" @click="closeDeletePopup">Hủy</button>
          <button class="button primary" @click="deleteBooking" :disabled="!canDeleteBooking">Xác nhận</button>
        </div>
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script setup>
import Navigate from '@/components/Navigate.vue';
import Footer from '@/components/Footer.vue';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// User data
const user = ref({
  name: '',
  email: '',
  avatar: '',
  phone: '',
  address: '',
});

// Booking data
const bookings = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Helper popup state
const showPopup = ref(false);
const selectedHelper = ref({});

// Axios instance với header Authorization
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Fetch user data
const fetchUserData = async () => {
  try {
    isLoading.value = true;
    const userId = JSON.parse(localStorage.getItem('user')).UserID;
    const response = await apiClient.get(`/api/user/${userId}`);
    user.value = {
      name: response.data.User.FullName || response.data.User.Username,
      email: response.data.User.Email,
      avatar: response.data.User.AvatarUrl || user.value.avatar,
      phone: response.data.User.PhoneNumber,
      address: response.data.User.Address,
    };
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch user data';
    if (err.response?.status === 403 || err.response?.status === 401) {
      router.push('/login');
    }
  }
};

// Fetch booking data
const fetchBookings = async () => {
  try {
    console.log('Fetching bookings with token:', localStorage.getItem('token'));
    const response = await apiClient.get('/api/bookings');
    console.log('Bookings API response:', response.data);
    if (response.data.success) {
      const bookingData = response.data.data;
      console.log('Booking data:', bookingData);
      if (Array.isArray(bookingData)) {
        bookings.value = bookingData.map(booking => {
          console.log('Processing booking:', booking);
          const createdDate = booking.CreatedDate && !isNaN(new Date(booking.CreatedDate).getTime())
            ? new Date(booking.CreatedDate)
            : null;
            const dateBooking = booking.DateBooking && !isNaN(new Date(booking.DateBooking).getTime())
            ? new Date(booking.DateBooking)
            : null;
          const isDeleted = booking.IsDeleted === null || booking.IsDeleted === 0 ? false : !!booking.IsDeleted;
          return {
            ...booking,
            CreatedDate: createdDate,
            DateBooking: dateBooking,
            IsDeleted: isDeleted,
          };
        });
        console.log('Final bookings.value:', bookings.value);
      } else {
        console.warn('Booking data is not an array:', bookingData);
        bookings.value = [];
      }
    } else {
      console.warn('API returned success: false', response.data);
      bookings.value = [];
    }
  } catch (err) {
    console.error('Error fetching bookings:', err.response?.data || err.message);
    error.value = err.response?.data?.message || 'Failed to fetch bookings';
    if (err.response?.status === 401) {
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
    console.log('isLoading set to false, current bookings:', bookings.value);
  }
};

// UI state
const activeTab = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);

// Modal functions
const showHelperPopup = (booking) => {
  selectedHelper.value = {
    HelperName: booking.HelperName,
    Phone: booking.Phone
  };
  showPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeHelperPopup = () => {
  showPopup.value = false;
  document.body.style.overflow = '';
};

// Computed properties
const completedBookings = computed(() => {
  return bookings.value.filter(booking => booking.Status === 'completed' && !booking.IsDeleted);
});

const pendingBookings = computed(() => {
  return bookings.value.filter(booking => booking.Status === 'Pending' && !booking.IsDeleted);
});

const canceledBookings = computed(() => {
  return bookings.value.filter(booking => booking.IsDeleted);
});

const filteredBookings = computed(() => {
  let filtered = bookings.value;
  if (activeTab.value === 'completed') {
    filtered = completedBookings.value;
  } else if (activeTab.value === 'Pending') {
    filtered = pendingBookings.value;
  } else if (activeTab.value === 'canceled') {
    filtered = canceledBookings.value;
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(booking =>
      booking.BookingID.toString().includes(query) ||
      booking.HelperName.toLowerCase().includes(query) ||
      booking.Sessions.toLowerCase().includes(query)
    );
  }
  return filtered;
});

// Helper functions
const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

const getStatusClass = (booking) => {
  if (booking.IsDeleted) return 'canceled';
  return booking.Status.toLowerCase();
};

const getStatusText = (booking) => {
  if (booking.IsDeleted) return 'Canceled';
  return booking.Status;
};

// Delete popup state
const showDeletePopup = ref(false);
const selectedBooking = ref(null);

// Chỉ cho phép hủy khi Status là Pending và chưa bị hủy
const canDeleteBooking = computed(() => {
  if (!selectedBooking.value) return false;

  const statusCondition = selectedBooking.value.Status === 'Pending';
  const isDeletedCondition = !selectedBooking.value.IsDeleted;

  // Lấy ngày hiện tại
  const currentDate = new Date();
  // Đặt giờ về 0 để so sánh chính xác theo ngày
  currentDate.setHours(0, 0, 0, 0);

  // Lấy DateBooking từ selectedBooking và chuyển thành Date object
  const dateBooking = selectedBooking.value.DateBooking
    ? new Date(selectedBooking.value.DateBooking)
    : null;

  // Kiểm tra nếu DateBooking không hợp lệ
  if (!dateBooking || isNaN(dateBooking.getTime())) {
    console.warn('Invalid DateBooking:', selectedBooking.value.DateBooking);
    return false;
  }

  // Đặt giờ về 0 cho DateBooking để so sánh theo ngày
  dateBooking.setHours(0, 0, 0, 0);

  // Tính ngày trước DateBooking 1 ngày
  const oneDayBeforeBooking = new Date(dateBooking);
  oneDayBeforeBooking.setDate(dateBooking.getDate() - 1);

  // Điều kiện thời gian: currentDate phải nhỏ hơn hoặc bằng oneDayBeforeBooking
  const timeCondition = currentDate <= oneDayBeforeBooking;

  console.log('Checking canDeleteBooking:', {
    Status: selectedBooking.value.Status,
    IsDeleted: selectedBooking.value.IsDeleted,
    CurrentDate: currentDate.toISOString().split('T')[0],
    DateBooking: dateBooking.toISOString().split('T')[0],
    OneDayBeforeBooking: oneDayBeforeBooking.toISOString().split('T')[0],
    TimeCondition: timeCondition
  });

  return statusCondition && isDeletedCondition && timeCondition;
});

const openDeletePopup = (booking) => {
  selectedBooking.value = booking;
  showDeletePopup.value = true;
  console.log('Selected booking:', selectedBooking.value); // Debug giá trị booking
  console.log('canDeleteBooking:', canDeleteBooking.value);
  document.body.style.overflow = 'hidden';
};

const closeDeletePopup = () => {
  showDeletePopup.value = false;
  selectedBooking.value = null;
  document.body.style.overflow = '';
};

const deleteBooking = async () => {
  if (!canDeleteBooking.value) return;
  try {
    const response = await apiClient.delete(`/api/bookings/${selectedBooking.value.BookingID}`);
    console.log('Delete response:', response.data);
    if (response.data.success) {
      const bookingIndex = bookings.value.findIndex(b => b.BookingID === selectedBooking.value.BookingID);
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex].IsDeleted = true;
      }
      closeDeletePopup();
    }
    console.log('Delete response:', response.data);
  } catch (error) {
    console.error('Error deleting booking:', error.response?.data || error.message);
    error.value = 'Failed to cancel booking';
  }
};

// Fetch data on mount
onMounted(() => {
  console.log('Token on mount:', localStorage.getItem('token'));
  if (!localStorage.getItem('token')) {
    router.push('/login');
    return;
  }
  fetchUserData();
  fetchBookings();
});
</script>

<style scoped>
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: #333;
}

.profile-container {
  background-color: #f9fafb;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Profile Header */
.profile-header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .user-info {
    flex-direction: row;
    align-items: center;
  }
}
.padding-container{
  width: 100%;
  height: 150px;
  background-color: #f3f4f6;
}
.avatar-container {
  position: relative;
}

.avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .avatar {
    width: 8rem;
    height: 8rem;
  }
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #22c55e;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid white;
}

@media (min-width: 768px) {
  .status-indicator {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.user-details {
  text-align: center;
}

@media (min-width: 768px) {
  .user-details {
    text-align: left;
  }
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

@media (min-width: 768px) {
  .user-name {
    font-size: 1.875rem;
  }
}

.user-email {
  color: #6b7280;
}

.user-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .user-meta {
    justify-content: flex-start;
  }
}
.delete-popup {
  min-width: 300px;
  max-width: 400px;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 10px;
}

.membership-badge {
  background-color: #dbeafe;
  color: #1e40af;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.join-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.edit-profile {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .edit-profile {
    margin-top: 0;
    margin-left: auto;
  }
}

.edit-button {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #1d4ed8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-value.completed {
  color: #16a34a;
}

.stat-value.pending {
  color: #d97706;
}

.stat-value.rewards {
  color: #7c3aed;
}

/* Booking History */
.booking-history {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-navigation {
  border-bottom: 1px solid #e5e7eb;
}

.tabs {
  display: flex;
}

.tab {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

.booking-content {
  padding: 1rem;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .booking-header {
    flex-direction: row;
  }
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 0.625rem;
  color: #9ca3af;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: #6b7280;
  background-color: #f9fafb;
}

.booking-row {
  transition: background-color 0.15s;
}

.booking-row:hover {
  background-color: #f9fafb;
}

.bookings-table td {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}

.booking-id {
  font-weight: 500;
  color: #1f2937;
}

.actions {
  white-space: nowrap;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.75rem;
}

.action-button.view {
  color: #2563eb;
}

.action-button.view:hover {
  color: #1d4ed8;
}

.action-button.cancel {
  color: #dc2626;
}

.action-button.cancel:hover {
  color: #b91c1c;
}

.no-results {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
}

.action-button.edit {
  color: #2563eb;
  transition: transform 0.2s ease, color 0.2s ease;
}

.action-button.edit:hover {
  color: #1d4ed8;
  transform: scale(1.1); /* Hiệu ứng phóng to khi hover */
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .pagination {
    flex-direction: row;
  }
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.avatar-edit {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-change-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-change-button:hover {
  background-color: #e5e7eb;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button.primary {
  background-color: #2563eb;
  color: white;
  border: none;
}

.button.primary:hover {
  background-color: #1d4ed8;
}

.button.secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.button.secondary:hover {
  background-color: #f3f4f6;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.helper-name.clickable {
  color: #2c3e50;
  cursor: pointer;
  text-decoration: underline;
}

.helper-name.clickable:hover {
  color: #3498db;
}

.helper-popup {
  min-width: 300px;
  max-width: 400px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 10px 0;
}

.modal-body p {
  margin: 10px 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.status-badge.completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.canceled {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Stat Value */
.stat-value.canceled {
  color: #dc2626;
}
</style>
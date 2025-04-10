<template>
  <div class="body">
    <header>
      <Navigate class="navigate"></Navigate>
      <div class="herosection">
        <HeroSection
          image="https://i.shgcdn.com/0e29c7d3-6a44-4275-a523-d97d5a3d519a/-/format/auto/-/preview/3000x3000/-/quality/lighter/"
          p1="Hãy bắt đầu" 
          p2="Tìm người giúp việc phù hợp với nhu cầu của bạn"
        ></HeroSection>
      </div>
    </header>

    <div class="booking-page">
      <!-- Filters section -->
      <div class="filters-container">
        <h1>Tìm Người Giúp Việc</h1>
        <div class="filters">
          <div class="filter-group">
            <label>Tìm theo tên</label>
            <input v-model="filters.search" placeholder="Tìm kiếm tên người giúp việc" />
          </div>

          <div class="filter-group">
            <label>Ngày bắt đầu</label>
            <input
              v-model="filters.startDate"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
            />
          </div>

          <div class="filter-group">
            <label>Số ngày</label>
            <input
              v-model.number="filters.numberOfDays"
              type="number"
              min="1"
              placeholder="Nhập số ngày"
            />
          </div>

          <div class="filter-group">
            <label>Ca làm việc (Chọn tối đa 2)</label>
            <div class="session-checkboxes">
              <label>
                <input
                  type="checkbox"
                  value="shift 1"
                  v-model="filters.selectedSessions"
                  @change="limitSessionSelection"
                />
                Ca Sáng (07:00 - 11:00)
              </label>
              <label>
                <input
                  type="checkbox"
                  value="shift 2"
                  v-model="filters.selectedSessions"
                  @change="limitSessionSelection"
                />
                Ca Chiều (13:00 - 17:00)
              </label>
              <label>
                <input
                  type="checkbox"
                  value="shift 3"
                  v-model="filters.selectedSessions"
                  @change="limitSessionSelection"
                />
                Ca Tối (18:00 - 22:00)
              </label>
            </div>
          </div>

          <div class="filter-group price-range">
            <label>Khoảng giá</label>
            <div class="price-inputs">
              <input
                v-model.number="filters.minPrice"
                type="number"
                placeholder="Tối thiểu"
                min="0"
              />
              <span>-</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                placeholder="Tối đa"
                min="0"
              />
            </div>
          </div>

          <button @click="fetchData" class="search-button" :disabled="!canSearch">
            Tìm Người Giúp Việc
          </button>
        </div>
      </div>

      <!-- Results section -->
      <div class="results-container" v-if="showResults">
        <p v-if="isLoading">Đang tải danh sách...</p>
        <p v-else-if="error">{{ error }}</p>
        <p v-else class="results-count">{{ filteredHelpers.length }} ngày sẵn sàng</p>

        <div class="helpers-grid">
          <div v-for="day in filteredHelpers" :key="day.date" class="helper-card">
            <div class="helper-info">
              <h3>{{ day.name }} - {{ formatDateVN(day.date) }}</h3>

              <div class="shifts-container">
                <h4>Các ca sẵn sàng:</h4>
                <div class="shifts-list">
                  <div
                    v-for="session in day.sessions"
                    :key="session.Session"
                    class="shift-badge"
                  >
                    {{ translateSession(session.Session) }} - {{ formatRate(session.Rate) }}
                  </div>
                  <div v-if="day.sessions.length === 0" class="shift-badge unavailable">
                    Không có ca nào sẵn sàng
                  </div>
                </div>
              </div>

              <div class="price-container">
                <span>Tổng cộng: {{ formatRate(calculateDayTotalPrice(day)) }}</span>
              </div>
            </div>

            <button
              class="book-button"
              @click="openBookingModal(day)"
              :disabled="day.sessions.length === 0"
            >
              Đặt Ngay
            </button>
          </div>
        </div>
      </div>

      <!-- Booking Modal -->
      <div v-if="bookingModal.show" class="modal-overlay">
        <div class="modal-content">
          <h2>Xác Nhận Đặt Lịch</h2>

          <div class="booking-details">
            <div class="detail-row">
              <span>Người giúp việc:</span>
              <span>{{ bookingModal.day.name }}</span>
            </div>

            <div class="detail-row">
              <span>Ngày:</span>
              <span>{{ formatDateVN(bookingModal.day.date) }}</span>
            </div>

            <div class="detail-row">
              <span>Các ca đã chọn:</span>
              <div>
                <label v-for="session in bookingModal.day.sessions" :key="session.Session">
                  <input
                    type="checkbox"
                    :value="session"
                    v-model="bookingModal.selectedSessions"
                    @change="updateSelectedSessions"
                  />
                  {{ translateSession(session.Session) }} - {{ formatRate(session.Rate) }}
                </label>
              </div>
            </div>

            <div class="detail-row">
              <span>Tổng giá:</span>
              <span>{{ formatRate(calculateModalTotalPrice()) }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeBookingModal">Hủy</button>
            <button @click="createBooking">Xác nhận</button>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <div v-if="notification.show" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import Footer from '@/components/Footer.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200';
};

const helpers = ref([]);
const isLoading = ref(false);
const error = ref(null);
const showResults = ref(false);

const filters = ref({
  search: '',
  startDate: null,
  numberOfDays: null,
  selectedSessions: [],
  minPrice: null,
  maxPrice: null,
});

const bookingModal = ref({
  show: false,
  day: null,
  selectedSessions: [],
});

const notification = ref({
  show: false,
  message: '',
  type: 'success',
});

// Kiểm tra token khi component được mount
onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
});

// Điều kiện để nút Search hoạt động
const canSearch = computed(() => {
  return (
    filters.value.search ||
    filters.value.startDate ||
    (filters.value.startDate && filters.value.numberOfDays) ||
    (filters.value.startDate && filters.value.minPrice) ||
    (filters.value.startDate && filters.value.selectedSessions.length > 0) ||
    (filters.value.startDate && filters.value.minPrice && filters.value.maxPrice) ||
    (filters.value.startDate && filters.value.maxPrice)
  );
});

// Hàm định dạng
const formatDateVN = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7); // Sửa lệch múi giờ UTC -> GMT+7
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatRate = (rate) => {
  if (!rate) return 'N/A';
  const number = parseFloat(rate);
  return number.toLocaleString('vi-VN') + ' VNĐ';
};

const translateSession = (session) => {
  if (!session) return 'N/A';
  const sessionMap = {
    "shift 1": "Ca 1",
    "shift 2": "Ca 2",
    "shift 3": "Ca 3",
    "fullday": "Cả ngày"
  };
  return sessionMap[session.toLowerCase()] || session;
};

const fetchData = async () => {
  if (!canSearch.value) return;

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Vui lòng đăng nhập để tìm kiếm', 'error');
    router.push('/login');
    return;
  }

  showResults.value = true;
  isLoading.value = true;
  error.value = null;

  try {
    let response;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: {},
    };
    if (filters.value.search) config.params.search = filters.value.search;
    if (filters.value.startDate) config.params.date = filters.value.startDate;
    if (filters.value.selectedSessions.length > 0) config.params.sessions = filters.value.selectedSessions.join(',');
    if (filters.value.minPrice) config.params.minPrice = filters.value.minPrice;
    if (filters.value.maxPrice) config.params.maxPrice = filters.value.maxPrice;

    if (filters.value.startDate && filters.value.numberOfDays && filters.value.selectedSessions.length === 0) {
      response = await axios.get('http://localhost:3000/api/availability-by-days', {
        ...config,
        params: {
          ...config.params,
          helperId: 1,
          numberOfDays: filters.value.numberOfDays,
        },
      });
    } else {
      response = await axios.get('http://localhost:3000/api/availability-by-session', config);
    }

    // Nhóm dữ liệu theo ngày
    const groupedByDate = {};
    response.data.forEach(item => {
      const dateKey = formatDateVN(item.Date); // Dùng định dạng ngày làm key
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: item.Date,
          name: item.HelperName,
          phone: item.Phone,
          helperId: item.HelperID,
          sessions: [],
        };
      }
      groupedByDate[dateKey].sessions.push({
        Session: item.Session,
        Rate: item.Rate,
      });
    });

    helpers.value = Object.values(groupedByDate);
    console.log('Raw API response:', response.data);
    console.log('Processed helpers by date:', helpers.value);
  } catch (err) {
    console.error('API Error:', err);
    if (err.response?.status === 401) {
      showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      router.push('/login');
    } else {
      error.value = err.response?.data?.error || 'Không thể tải danh sách người giúp việc';
    }
  } finally {
    isLoading.value = false;
  }
};

const createBooking = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) throw new Error('Người dùng chưa đăng nhập');

    const sessions = bookingModal.value.selectedSessions;
    const day = bookingModal.value.day;

    if (!sessions.length) {
      showNotification('Vui lòng chọn ít nhất một ca', 'error');
      return;
    }

    // Tạo chuỗi Sessions từ danh sách các ca đã chọn
    const sessionNames = sessions.map(session => 
      session.Session.charAt(0).toUpperCase() + session.Session.slice(1) // Viết hoa chữ cái đầu
    ).join(', '); // Ghép các ca bằng dấu ", "

    // Tính tổng chi phí từ tất cả các ca đã chọn
    const totalCost = sessions.reduce((sum, session) => sum + (session.Rate || 0), 0);

    // Kiểm tra và chuẩn hóa DateBooking
    const dateBooking = day.date && !isNaN(new Date(day.date).getTime())
      ? new Date(day.date).toISOString().split('T')[0]
      : null;

    if (!dateBooking) {
      showNotification('Ngày đặt lịch không hợp lệ', 'error');
      console.error('Invalid day.date:', day.date);
      return;
    }

    if (!user.UserID || !day.helperId || !totalCost || !sessionNames) {
      showNotification('Dữ liệu không đầy đủ', 'error');
      return;
    }
    // Tạo object booking cho một ngày với tất cả các ca

    const booking = {
      UserID: user.UserID,
      HelperID: day.helperId,
      TotalCost: totalCost,
      Sessions: sessionNames, // Chuỗi như "Shift 1, Shift 2"
      Status: 'Pending', // Giá trị mặc định
      IsDeleted: false,
      DateBooking: dateBooking,
    };

    console.log('Booking data gửi đi:', booking); // Debug dữ liệu trước khi gửi

    // Gửi request POST tới API
    const response = await axios.post('http://localhost:3000/api/bookings', booking, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showNotification('Đặt lịch thành công!', 'success');
    closeBookingModal();
    fetchData();
  } catch (err) {
    console.error('Error creating booking:', err);
    if (err.response?.status === 401) {
      showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      router.push('/login');
    } else {
      showNotification(err.response?.data?.error || 'Không thể tạo đặt lịch', 'error');
    }
  }
};

const calculateDayTotalPrice = (day) => {
  return day.sessions.reduce((total, session) => total + parseFloat(session.Rate), 0);
};

const calculateModalTotalPrice = () => {
  return bookingModal.value.selectedSessions.reduce(
    (total, session) => total + parseFloat(session.Rate),
    0
  );
};

const limitSessionSelection = () => {
  if (filters.value.selectedSessions.length > 2) {
    filters.value.selectedSessions = filters.value.selectedSessions.slice(0, 2);
  }
};

const updateSelectedSessions = () => {
  if (bookingModal.value.selectedSessions.length > 2) {
    bookingModal.value.selectedSessions = bookingModal.value.selectedSessions.slice(0, 2);
  }
};

const showNotification = (message, type) => {
  notification.value = { show: true, message, type };
  setTimeout(() => (notification.value.show = false), 5000);
};

const openBookingModal = (day) => {
  bookingModal.value = {
    show: true,
    day,
    selectedSessions: day.sessions.slice(0, 2),
  };
  console.log('Opening modal with day:', day); // Debug
};

const closeBookingModal = () => {
  bookingModal.value.show = false;
};

const filteredHelpers = computed(() => helpers.value);
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.body {
    background-color: #dbd3aa;
}
.booking-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #2c3e50;
}

/* Filters section */
.filters-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

input[type="text"],
input[type="date"],
input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.price-range {
  flex: 2;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  position: relative;
  flex: 1;
}

.currency {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #4a5568;
}

.price-input input {
  padding-left: 24px;
}

.price-separator {
  color: #9ca3af;
  font-weight: 500;
}

/* Results section */
.results-count {
  margin-bottom: 20px;
  font-size: 16px;
  color: #4a5568;
}

.helpers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.helper-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.helper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.helper-info {
  padding: 20px;
  flex: 1;
}

.helper-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.helper-date {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 15px;
}

.shifts-container {
  margin-bottom: 15px;
}

.shifts-container h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #4a5568;
}

.shifts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.shift-badge {
  background-color: #edf2f7;
  color: #4a5568;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
}

.price-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.price-label {
  font-size: 14px;
  color: #4a5568;
  margin-right: 5px;
}

.price-value {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.book-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.book-button:hover {
  background-color: #3a7bc8;
}

.no-results {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 10px;
  color: #64748b;
  gap: 15px;
}

.reset-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.reset-button:hover {
  background-color: #3a7bc8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.booking-details {
  margin-bottom: 25px;
}

.booking-detail {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.detail-label {
  width: 80px;
  font-weight: 500;
  color: #4a5568;
}

.detail-value {
  flex: 1;
}

.shift-select select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.confirm-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #cbd5e0;
}

.confirm-button:hover {
  background-color: #3a7bc8;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 300px;
  max-width: 400px;
}

.notification.success {
  background-color: #ebf7ed;
  border-left: 4px solid #34d399;
  color: #065f46;
}

.notification.error {
  background-color: #fef2f2;
  border-left: 4px solid #f87171;
  color: #991b1b;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.7;
}

.notification-close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .helpers-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }
}
.helper-avatar {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.helper-rating {
  color: #ffc107;
  margin: 8px 0;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px;
  border-radius: 5px;
  color: white;
  z-index: 1000;
}

.notification.success {
  background-color: #4CAF50;
}

.notification.error {
  background-color: #F44336;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.shift-badge {
  background-color: #edf2f7;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
}

.shift-badge.unavailable {
  background-color: #fee2e2;
  color: #991b1b;
}

.helper-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.helper-info {
  padding: 15px;
  flex-grow: 1;
}

.book-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.modal-content select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.session-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-checkboxes label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-button {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.search-button:hover:not(:disabled) {
  background-color: #3a7bc8;
}
</style>
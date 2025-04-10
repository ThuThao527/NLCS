<template>
  <div class="bookings-container">
    <div class="bookings-header">
      <div class="header-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          class="tab-button"
          :class="{ active: activeTab === tab.value }"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <SearchIcon class="search-icon" />
          <input type="text" placeholder="Search bookings..." v-model="searchQuery" />
        </div>
        <button class="filter-button">
          <FilterIcon class="button-icon" />
          Tìm
        </button>
      </div>
    </div>
    
    <div class="bookings-list">
      <div v-for="booking in filteredBookings" :key="booking.BookingID" class="booking-card">
        <div class="booking-status" :class="booking.Status.toLowerCase()"></div>
        <div class="booking-info">
          <div class="booking-client">
            <div class="client-avatar">
              <img 
                v-if="booking.AvatarUrl"
                :src="booking.AvatarUrl" 
                alt="User Avatar" 
                @error="handleImageError"
              />
              <img 
                v-else
                src="https://i.pinimg.com/736x/f0/46/4e/f0464e45eb0126ac7c5a4f162a412be5.jpg" 
                alt="Default Avatar"
              />
            </div>
            <div class="client-details">
              <h4>{{ booking.HelperName }}</h4>
              <span>{{ booking.Phone }}</span>
            </div>
          </div>
          <div class="booking-service">
            <h5>ID: {{ booking.BookingID || 'N/A' }}</h5>
            <div class="service-details">
              <span>
                <CalendarIcon class="detail-icon" />
                {{ formatDate(booking.DateBooking) }}
              </span>
              <span>
                <MapPinIcon class="detail-icon" />
                {{ booking.Address }}
              </span>
              <span>
                <DollarSignIcon class="detail-icon" />
                ${{ booking.TotalCost }}
              </span>
              <span>
                <ClockIcon class="detail-icon" />
                {{ formatShift(booking.Sessions) }}
              </span>
            </div>
          </div>
        </div>
        <div class="booking-actions">
          <button 
            class="action-button" 
            :class="getActionButtonClass(booking.Status)"
            @click="handlePayment(booking)"
            :disabled="booking.Status.toLowerCase() === 'completed'"
          >
            {{ getActionButtonText(booking.Status) }}
          </button>
          <button class="icon-button">
            <MoreVerticalIcon class="button-icon" />
          </button>
        </div>
      </div>
      
      <div v-if="filteredBookings.length === 0" class="empty-state">
        <CalendarXIcon class="empty-icon" />
        <h4>Không tìm thấy phiếu đặt</h4>
        <p>Không có phiếu đặt nào phù hợp với tìm kiếm của bạn</p>
      </div>
    </div>
    
    <!-- Popup xác nhận thanh toán -->
    <div v-if="showPaymentPopup" class="popup-overlay">
      <div class="popup-content">
        <h3>Xác nhận thanh toán</h3>
        <p>Bạn có chắc chắn khách hàng đã thanh toán cho dịch vụ có ID #{{ selectedBooking.BookingID }} không?</p>
        <div class="popup-actions">
          <button @click="confirmPayment" class="confirm-button">Xác nhận</button>
          <button @click="showPaymentPopup = false" class="cancel-button">Hủy</button>
        </div>
      </div>
    </div>
    
    <div class="bookings-pagination">
      <button class="pagination-button" disabled>
        <ChevronLeftIcon class="button-icon" />
        Previous
      </button>
      <div class="pagination-info">
        Showing 1-{{ filteredBookings.length }} of {{ filteredBookings.length }}
      </div>
      <button class="pagination-button" disabled>
        Next
        <ChevronRightIcon class="button-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  SearchIcon, 
  FilterIcon, 
  CalendarIcon, 
  MapPinIcon,
  DollarSignIcon, 
  ClockIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarXIcon
} from 'lucide-vue-next'

const tabs = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa hoàn thành', value: 'upcoming' },
  { label: 'Đã hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' }
]

const activeTab = ref('all')
const searchQuery = ref('')
const bookings = ref([])
const showPaymentPopup = ref(false)
const selectedBooking = ref(null)

const fetchBookings = async () => {
  try {
    const response = await axios.get('/api/bookings-by-helper', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('API Response:', response.data);
    if (response.data.success) {
      bookings.value = response.data.data;
    } else {
      bookings.value = [];
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    bookings.value = [];
  }
}

const updateBookingStatus = async (bookingId) => {
  try {
    const response = await axios.put(`/api/bookings/${bookingId}/status`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.data.success) {
      const booking = bookings.value.find(b => b.BookingID === bookingId);
      if (booking) {
        booking.Status = 'completed';
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

onMounted(() => {
  fetchBookings()
})

const filteredBookings = computed(() => {
  return bookings.value.filter(booking => {
    const status = booking.Status.toLowerCase();
    let matchesTab;
    
    if (activeTab.value === 'all') {
      matchesTab = true; // Hiển thị tất cả
    } else if (activeTab.value === 'upcoming') {
      matchesTab = status === 'upcoming' || status === 'pending'; // Hiển thị upcoming và pending
    } else {
      matchesTab = status === activeTab.value; // Các tab khác (completed, cancelled)
    }

    const matchesSearch = booking.HelperName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         booking.BookingID.toString().includes(searchQuery.value);
    return matchesTab && matchesSearch;
  });
});

const getTabCount = (tabValue) => {
  if (tabValue === 'all') {
    return bookings.value.length;
  } else if (tabValue === 'upcoming') {
    return bookings.value.filter(booking => {
      const status = booking.Status.toLowerCase();
      return status === 'upcoming' || status === 'pending';
    }).length;
  } else {
    return bookings.value.filter(booking => 
      booking.Status.toLowerCase() === tabValue).length;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatShift = (sessions) => {
  if (!sessions) return 'N/A';
  return sessions.replace('Shift', 'Ca').trim();
}

const getActionButtonText = (status) => {
  return status.toLowerCase() === 'completed' ? 'Đã thanh toán' : 'Thanh toán';
}

const getActionButtonClass = (status) => {
  switch (status.toLowerCase()) {
    case 'upcoming': return 'primary';
    case 'pending': return 'primary';
    case 'completed': return 'secondary disabled';
    case 'cancelled': return 'outline';
    default: return 'primary';
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://i.pinimg.com/736x/f0/46/4e/f0464e45eb0126ac7c5a4f162a412be5.jpg';
}

const handlePayment = (booking) => {
  if (booking.Status.toLowerCase() !== 'completed') {
    selectedBooking.value = booking;
    showPaymentPopup.value = true;
  }
}

const confirmPayment = async () => {
  if (selectedBooking.value) {
    await updateBookingStatus(selectedBooking.value.BookingID);
    showPaymentPopup.value = false;
    selectedBooking.value = null;
  }
}
</script>

<style scoped>
/* Giữ nguyên style hiện tại và thêm style cho popup */
.service-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.service-details span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.popup-overlay {
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

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  text-align: center;
}

.popup-content h3 {
  margin: 0 0 10px;
}

.popup-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.client-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.service-details span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.service-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.service-details span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bookings-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.header-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #eee;
}

.tab-button {
  background: none;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  position: relative;
}

.tab-button.active {
  color: #333;
  font-weight: 500;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #333;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 5px;
  background-color: #f0f0f0;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 8px 10px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.button-icon {
  width: 16px;
  height: 16px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.booking-status {
  width: 5px;
}

.booking-status.upcoming {
  background-color: #4caf50;
}

.booking-status.completed {
  background-color: #2196f3;
}

.booking-status.cancelled {
  background-color: #f44336;
}

.booking-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.booking-client {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.client-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.client-details {
  display: flex;
  flex-direction: column;
}

.client-details h4 {
  margin: 0;
  font-size: 1rem;
}

.client-details span {
  font-size: 0.85rem;
  color: #666;
}

.booking-service h5 {
  margin: 0 0 5px 0;
  font-size: 0.95rem;
  color: #333;
}

.service-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.service-details span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
}

.detail-icon {
  width: 14px;
  height: 14px;
}

.booking-actions {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 10px;
}

.action-button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.action-button.primary {
  background-color: #4a4a4a;
  color: white;
}

.action-button.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.action-button.outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.icon-button:hover {
  background-color: #f0f0f0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #999;
  margin-bottom: 15px;
}

.empty-state h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.empty-state p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.bookings-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
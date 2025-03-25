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
          Filter
        </button>
      </div>
    </div>
    
    <div class="bookings-list">
      <div v-for="(booking, index) in filteredBookings" :key="index" class="booking-card">
        <div class="booking-status" :class="booking.status"></div>
        <div class="booking-info">
          <div class="booking-client">
            <div class="client-avatar">
              <img src="https://i.pinimg.com/736x/f0/46/4e/f0464e45eb0126ac7c5a4f162a412be5.jpg" alt="Client Avatar" />
            </div>
            <div class="client-details">
              <h4>{{ booking.client }}</h4>
              <span>{{ booking.email }}</span>
            </div>
          </div>
          <div class="booking-service">
            <h5>{{ booking.service }}</h5>
            <div class="service-details">
              <span>
                <CalendarIcon class="detail-icon" />
                {{ booking.date }}
              </span>
              <span>
                <ClockIcon class="detail-icon" />
                {{ booking.time }}
              </span>
              <span>
                <DollarSignIcon class="detail-icon" />
                {{ booking.price }}
              </span>
            </div>
          </div>
        </div>
        <div class="booking-actions">
          <button class="action-button" :class="getActionButtonClass(booking.status)">
            {{ getActionButtonText(booking.status) }}
          </button>
          <button class="icon-button">
            <MoreVerticalIcon class="button-icon" />
          </button>
        </div>
      </div>
      
      <div v-if="filteredBookings.length === 0" class="empty-state">
        <CalendarXIcon class="empty-icon" />
        <h4>No bookings found</h4>
        <p>There are no bookings matching your current filters.</p>
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
import { ref, computed } from 'vue'
import { 
  SearchIcon, 
  FilterIcon, 
  CalendarIcon, 
  ClockIcon, 
  DollarSignIcon, 
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarXIcon
} from 'lucide-vue-next'

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const activeTab = ref('all')
const searchQuery = ref('')

const bookings = [
  {
    client: 'Emma Thompson',
    email: 'emma.t@example.com',
    service: 'Haircut & Styling',
    date: 'Mar 22, 2024',
    time: '10:00 AM',
    price: '$45.00',
    status: 'upcoming'
  },
  {
    client: 'James Wilson',
    email: 'james.w@example.com',
    service: 'Massage Therapy',
    date: 'Mar 23, 2024',
    time: '2:30 PM',
    price: '$75.00',
    status: 'upcoming'
  },
  {
    client: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    service: 'Facial Treatment',
    date: 'Mar 20, 2024',
    time: '1:15 PM',
    price: '$60.00',
    status: 'completed'
  },
  {
    client: 'Daniel Johnson',
    email: 'daniel.j@example.com',
    service: 'Nail Care Package',
    date: 'Mar 18, 2024',
    time: '11:30 AM',
    price: '$35.00',
    status: 'completed'
  },
  {
    client: 'Olivia Brown',
    email: 'olivia.b@example.com',
    service: 'Haircut & Styling',
    date: 'Mar 19, 2024',
    time: '3:00 PM',
    price: '$45.00',
    status: 'cancelled'
  }
]

const filteredBookings = computed(() => {
  return bookings.filter(booking => {
    const matchesTab = activeTab.value === 'all' || booking.status === activeTab.value
    const matchesSearch = booking.client.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          booking.service.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

const getTabCount = (tabValue) => {
  if (tabValue === 'all') return bookings.length
  return bookings.filter(booking => booking.status === tabValue).length
}

const getActionButtonText = (status) => {
  switch (status) {
    case 'upcoming': return 'Check In'
    case 'completed': return 'Receipt'
    case 'cancelled': return 'Reschedule'
    default: return 'View'
  }
}

const getActionButtonClass = (status) => {
  switch (status) {
    case 'upcoming': return 'primary'
    case 'completed': return 'secondary'
    case 'cancelled': return 'outline'
    default: return ''
  }
}
</script>

<style scoped>
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
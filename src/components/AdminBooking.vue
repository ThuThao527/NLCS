<template>
  <div class="admin-container">
    <div class="controls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm kiếm phiếu đặt..." 
          @input="handleSearch"
        />
      </div>
    </div>
    
    <div class="table-container">
      <table class="bookings-table">
        <thead>
          <tr>
            <th>ID</th>
            <th @click="sortBy('UserID')">
              ID Người dùng
              <span v-if="sortColumn === 'UserID'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('HelperID')">
              ID Trợ lý
              <span v-if="sortColumn === 'HelperID'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('TotalCost')">
              Tổng chi phí
              <span v-if="sortColumn === 'TotalCost'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('status')">
              Trạng thái
              <span v-if="sortColumn === 'status'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in paginatedBookings" :key="booking.id">
            <td>{{ booking.id }}</td>
            <td>{{ booking.userId }}</td>
            <td>{{ booking.helperId }}</td>
            <td>{{ booking.totalCost }}</td>
            <td>
              <span class="status-indicator" :class="booking.status"></span>
              {{ booking.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động' }}
            </td>
            <td class="actions">
              <button class="action-btn view" @click="viewBooking(booking)">
                <span class="icon">👁️</span>
              </button>
              <button class="action-btn edit" @click="editBooking(booking)">
                <span class="icon">✏️</span>
              </button>
              <button class="action-btn delete" @click="confirmDelete(booking)">
                <span class="icon">🗑️</span>
              </button>
            </td>
          </tr>
          <tr v-if="paginatedBookings.length === 0">
            <td colspan="6" class="no-results">Không tìm thấy booking</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--; fetchBookings()"
        class="pagination-btn"
      >
        Trước
      </button>
      <span class="page-info">
        Trang {{ currentPage }} / {{ totalPages }}
      </span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++; fetchBookings()"
        class="pagination-btn"
      >
        Tiếp
      </button>
    </div>
    
    <!-- Cửa sổ xem thông tin booking -->
    <div v-if="showViewModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showViewModal = false">×</span>
        <h2>Chi tiết booking</h2>
        <div class="booking-details" v-if="selectedBooking">
          <div class="detail-row">
            <strong>ID:</strong> {{ selectedBooking.id }}
          </div>
          <div class="detail-row">
            <strong>ID Người dùng:</strong> {{ selectedBooking.userId }}
          </div>
          <div class="detail-row">
            <strong>ID Trợ lý:</strong> {{ selectedBooking.helperId }}
          </div>
          <div class="detail-row">
            <strong>Tổng chi phí:</strong> {{ selectedBooking.totalCost }}
          </div>
          <div class="detail-row">
            <strong>Số buổi:</strong> {{ selectedBooking.sessions }}
          </div>
          <div class="detail-row">
            <strong>Trạng thái:</strong> 
            <span class="status-indicator" :class="selectedBooking.status"></span>
            {{ selectedBooking.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động' }}
          </div>
          <div class="detail-row">
            <strong>Ngày tạo:</strong> {{ selectedBooking.createdDate }}
          </div>
          <div class="detail-row">
            <strong>Ngày đặt:</strong> {{ selectedBooking.dateBooking }}
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showViewModal = false" class="btn-secondary">Đóng</button>
        </div>
      </div>
    </div>
    
    <!-- Cửa sổ chỉnh sửa booking -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showEditModal = false">×</span>
        <h2>Chỉnh sửa booking</h2>
        <form @submit.prevent="saveBooking" v-if="selectedBooking">
          <div class="form-group">
            <label for="userId">ID Người dùng</label>
            <input type="text" id="userId" v-model="editForm.userId" required />
          </div>
          <div class="form-group">
            <label for="helperId">ID Trợ lý</label>
            <input type="text" id="helperId" v-model="editForm.helperId" required />
          </div>
          <div class="form-group">
            <label for="totalCost">Tổng chi phí</label>
            <input type="number" id="totalCost" v-model="editForm.totalCost" required />
          </div>
          <div class="form-group">
            <label for="sessions">Số buổi</label>
            <input type="number" id="sessions" v-model="editForm.sessions" required />
          </div>
          <div class="form-group">
            <label for="status">Trạng thái</label>
            <select id="status" v-model="editForm.status">
              <option value="active">Tồn tại</option>
              <option value="inactive">Đã lưu</option>
            </select>
          </div>
          <div class="form-group">
            <label for="dateBooking">Ngày đặt</label>
            <input type="date" id="dateBooking" v-model="editForm.dateBooking" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Hủy</button>
            <button type="submit" class="btn-primary">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Cửa sổ thêm booking -->
    <div v-if="showAddBookingModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddBookingModal = false">×</span>
        <h2>Thêm booking mới</h2>
        <form @submit.prevent="addBooking">
          <div class="form-group">
            <label for="new-userId">ID Khách hàng</label>
            <input type="text" id="new-userId" v-model="newBooking.userId" required />
          </div>
          <div class="form-group">
            <label for="new-helperId">ID CTV</label>
            <input type="text" id="new-helperId" v-model="newBooking.helperId" required />
          </div>
          <div class="form-group">
            <label for="new-totalCost">Tổng chi phí</label>
            <input type="number" id="new-totalCost" v-model="newBooking.totalCost" required />
          </div>
          <div class="form-group">
            <label for="new-sessions">Số buổi</label>
            <input type="number" id="new-sessions" v-model="newBooking.sessions" required />
          </div>
          <div class="form-group">
            <label for="new-status">Trạng thái</label>
            <select id="new-status" v-model="newBooking.status">
              <option value="active">Tồn tại</option>
              <option value="inactive">Đã xóa</option>
            </select>
          </div>
          <div class="form-group">
            <label for="new-dateBooking">Ngày đặt</label>
            <input type="date" id="new-dateBooking" v-model="newBooking.dateBooking" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddBookingModal = false" class="btn-secondary">Hủy</button>
            <button type="submit" class="btn-primary">Thêm booking</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Cửa sổ xác nhận xóa -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showDeleteModal = false">×</span>
        <h2>Xác nhận xóa</h2>
        <p v-if="selectedBooking">
          Bạn có chắc chắn muốn xóa booking <strong>ID {{ selectedBooking.id }}</strong> không?
          Hành động này không thể hoàn tác.
        </p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">Hủy</button>
          <button @click="deleteBooking" class="btn-danger">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import axios from 'axios';

// Cấu hình API client
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Điều chỉnh theo server của bạn
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

// Trạng thái
const bookings = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortColumn = ref('id');
const sortDirection = ref('asc');
const totalPages = ref(1);
const totalBookings = ref(0);

// Trạng thái cửa sổ
const showViewModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showAddBookingModal = ref(false);
const selectedBooking = ref(null);
const editForm = reactive({ userId: '', helperId: '', totalCost: '', sessions: '', status: '', dateBooking: '' });
const newBooking = reactive({ userId: '', helperId: '', totalCost: '', sessions: '', status: 'active', dateBooking: '' });

// Lấy danh sách booking từ API
const fetchBookings = async () => {
  try {
    const response = await apiClient.get('/api/BookingList', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined
      }
    });
    bookings.value = response.data.bookings.map(booking => ({
      id: booking.BookingID,
      userId: booking.UserID,
      helperId: booking.HelperID,
      totalCost: booking.TotalCost,
      sessions: booking.Sessions,
      status: booking.IsDeleted === null ? 'active' : 'inactive',
      createdDate: booking.CreatedDate ? new Date(booking.CreatedDate).toLocaleDateString() : 'Không có',
      dateBooking: booking.DateBooking ? new Date(booking.DateBooking).toLocaleDateString() : 'Không có'
    }));
    totalBookings.value = response.data.total;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách booking:', error);
  }
};

// Gọi API khi mounted và theo dõi thay đổi
onMounted(fetchBookings);
watch([currentPage, searchQuery], fetchBookings);

// Thuộc tính tính toán
const filteredBookings = computed(() => bookings.value);

const sortedBookings = computed(() => {
  return [...filteredBookings.value].sort((a, b) => {
    let aValue = a[sortColumn.value];
    let bValue = b[sortColumn.value];
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    return sortDirection.value === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });
});

const paginatedBookings = computed(() => sortedBookings.value);

const totalPagesComputed = computed(() => totalPages.value);

// Phương thức
const handleSearch = () => {
  currentPage.value = 1;
  fetchBookings();
};

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const viewBooking = (booking) => {
  selectedBooking.value = booking;
  showViewModal.value = true;
};

const editBooking = (booking) => {
  selectedBooking.value = booking;
  editForm.userId = booking.userId;
  editForm.helperId = booking.helperId;
  editForm.totalCost = booking.totalCost;
  editForm.sessions = booking.sessions;
  editForm.status = booking.status;
  editForm.dateBooking = booking.dateBooking ? new Date(booking.dateBooking).toISOString().split('T')[0] : '';
  showEditModal.value = true;
};

const saveBooking = async () => {
  if (selectedBooking.value) {
    try {
      const updatedData = {
        UserID: editForm.userId,
        HelperID: editForm.helperId,
        TotalCost: parseFloat(editForm.totalCost),
        Sessions: parseInt(editForm.sessions),
        IsDeleted: editForm.status === 'active' ? null : true,
        DateBooking: editForm.dateBooking
      };
      await apiClient.put(`/api/bookings/${selectedBooking.value.id}`, updatedData);
      const index = bookings.value.findIndex(b => b.id === selectedBooking.value.id);
      if (index !== -1) {
        bookings.value[index] = { ...bookings.value[index], ...editForm };
      }
      showEditModal.value = false;
      fetchBookings();
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error);
      alert('Không thể lưu thay đổi: ' + (error.response?.data?.message || error.message));
    }
  }
};

const confirmDelete = (booking) => {
  selectedBooking.value = booking;
  showDeleteModal.value = true;
};

const deleteBooking = async () => {
  if (selectedBooking.value) {
    try {
      await apiClient.delete(`/api/bookings/${selectedBooking.value.id}`);
      bookings.value = bookings.value.filter(b => b.id !== selectedBooking.value.id);
      showDeleteModal.value = false;
      if (paginatedBookings.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchBookings();
    } catch (error) {
      console.error('Lỗi khi xóa booking:', error);
      alert('Không thể xóa booking: ' + (error.response?.data?.message || error.message));
    }
  }
};

const addBooking = async () => {
  try {
    const newBookingData = {
      UserID: newBooking.userId,
      HelperID: newBooking.helperId,
      TotalCost: parseFloat(newBooking.totalCost),
      Sessions: parseInt(newBooking.sessions),
      IsDeleted: newBooking.status === 'active' ? null : true,
      DateBooking: newBooking.dateBooking
    };
    await apiClient.post('/api/bookings', newBookingData);
    fetchBookings();
    newBooking.userId = '';
    newBooking.helperId = '';
    newBooking.totalCost = '';
    newBooking.sessions = '';
    newBooking.status = 'active';
    newBooking.dateBooking = '';
    showAddBookingModal.value = false;
  } catch (error) {
    console.error('Lỗi khi thêm booking:', error);
    alert('Không thể thêm booking: ' + (error.response?.data?.message || error.message));
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  margin-right: 20px;
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-button:hover {
  background-color: #45a049;
}

.table-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.bookings-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  cursor: pointer;
}

.bookings-table th:hover {
  background-color: #e0e0e0;
}

.bookings-table td {
  vertical-align: middle;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-indicator.active {
  background-color: #4CAF50;
}

.status-indicator.inactive {
  background-color: #f44336;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
}

.action-btn.view:hover {
  color: #2196F3;
}

.action-btn.edit:hover {
  color: #FFC107;
}

.action-btn.delete:hover {
  color: #f44336;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #777;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.page-info {
  font-size: 14px;
  color: #555;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #777;
}

.close:hover {
  color: #333;
}

.booking-details {
  margin-top: 20px;
}

.detail-row {
  margin-bottom: 10px;
}

.detail-row strong {
  display: inline-block;
  width: 120px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  padding: 8px 16px;
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #bbb;
}

.btn-primary {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-danger {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #d32f2f;
}
</style>
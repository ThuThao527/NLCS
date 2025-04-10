<template>
  <div class="admin-container">
    <!-- <h1>Quản lý người dùng</h1> -->
    
    <div class="controls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm kiếm người dùng..." 
          @input="handleSearch"
        />
      </div>
      <button class="add-button" @click="showAddUserModal = true">Thêm người dùng</button>
    </div>
    
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh đại diện</th>
            <th @click="sortBy('name')">
              Tên
              <span v-if="sortColumn === 'name'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('email')">
              Email
              <span v-if="sortColumn === 'email'" class="sort-indicator">
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
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <img :src="user.avatar" :alt="user.name" class="avatar" />
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="status-indicator" :class="user.status"></span>
              {{ user.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động' }}
            </td>
            <td class="actions">
              <button class="action-btn view" @click="viewUser(user)">
                <span class="icon">👁️</span>
              </button>
              <button class="action-btn edit" @click="editUser(user)">
                <span class="icon">✏️</span>
              </button>
              <button class="action-btn delete" @click="confirmDelete(user)">
                <span class="icon">🗑️</span>
              </button>
            </td>
          </tr>
          <tr v-if="paginatedUsers.length === 0">
            <td colspan="6" class="no-results">Không tìm thấy người dùng</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--; fetchUsers()"
        class="pagination-btn"
      >
        Trước
      </button>
      <span class="page-info">
        Trang {{ currentPage }} / {{ totalPages }}
      </span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++; fetchUsers()"
        class="pagination-btn"
      >
        Tiếp
      </button>
    </div>
    
    <!-- Cửa sổ xem thông tin người dùng -->
    <div v-if="showViewModal" class="modal">
  <div class="modal-content">
    <span class="close" @click="showViewModal = false">×</span>
    <h2>Chi tiết người dùng</h2>
    <div class="user-details" v-if="selectedUser">
      <img :src="selectedUser.avatar" :alt="selectedUser.name" class="detail-avatar" />
      <div class="detail-row">
        <strong>ID:</strong> {{ selectedUser.id }}
      </div>
      <div class="detail-row">
        <strong>Tên:</strong> {{ selectedUser.name }}
      </div>
      <div class="detail-row">
        <strong>Email:</strong> {{ selectedUser.email }}
      </div>
      <div class="detail-row">
        <strong>Số điện thoại:</strong> {{ selectedUser.phone }} <!-- Hiển thị phone -->
      </div>
      <div class="detail-row">
        <strong>Trạng thái:</strong> <!-- Tách trạng thái ra riêng -->
        <span class="status-indicator" :class="selectedUser.status"></span>
        {{ selectedUser.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động' }}
      </div>
      <div class="detail-row">
        <strong>Địa chỉ:</strong> {{ selectedUser.address }} <!-- Sử dụng chữ thường -->
      </div>
    </div>
    <div class="modal-actions">
      <button @click="showViewModal = false" class="btn-secondary">Đóng</button>
    </div>
  </div>
</div>
    <!-- Cửa sổ chỉnh sửa người dùng -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showEditModal = false">×</span>
        <h2>Chỉnh sửa người dùng</h2>
        <form @submit.prevent="saveUser" v-if="selectedUser">
          <div class="form-group">
            <label for="name">Tên</label>
            <input type="text" id="name" v-model="editForm.name" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editForm.email" required />
          </div>
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input type="text" id="phone" v-model="editForm.phone" required />
          </div>
          <div class="form-group">
            <label for="status">Trạng thái</label>
            <select id="status" v-model="editForm.status">
              <option value="active">Hoạt động</option>
              <option value="inactive">Dừng hoạt động</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Hủy</button>
            <button type="submit" class="btn-primary">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Cửa sổ thêm người dùng -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddUserModal = false">×</span>
        <h2>Thêm người dùng mới</h2>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label for="new-name">Tên</label>
            <input type="text" id="new-name" v-model="newUser.name" required />
          </div>
          <div class="form-group">
            <label for="new-email">Email</label>
            <input type="email" id="new-email" v-model="newUser.email" required />
          </div>
          <div class="form-group">
            <label for="new-status">Trạng thái</label>
            <select id="new-status" v-model="newUser.status">
              <option value="active">Hoạt động</option>
              <option value="inactive">Dừng hoạt động</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddUserModal = false" class="btn-secondary">Hủy</button>
            <button type="submit" class="btn-primary">Thêm người dùng</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Cửa sổ xác nhận xóa -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showDeleteModal = false">×</span>
        <h2>Xác nhận xóa</h2>
        <p v-if="selectedUser">
          Bạn có chắc chắn muốn xóa người dùng <strong>{{ selectedUser.name }}</strong> không?
          Hành động này không thể hoàn tác.
        </p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">Hủy</button>
          <button @click="deleteUser" class="btn-danger">Xóa</button>
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
const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortColumn = ref('id');
const sortDirection = ref('asc');
const totalPages = ref(1);
const totalUsers = ref(0);
const cityFilter = ref('');

// Trạng thái cửa sổ
const showViewModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showAddUserModal = ref(false);
const selectedUser = ref(null);
const editForm = reactive({ name: '', email: '', phone: '', status: '' });
const newUser = reactive({ name: '', email: '', status: 'active' });

// Lấy danh sách người dùng từ API
const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/api/HelpersList', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        city: cityFilter.value || undefined,
        search: searchQuery.value || undefined
      }
    });
    console.log('Dữ liệu từ API:', response.data.helpers);
    users.value = response.data.helpers.map(user => ({
      id: user.HelperID,
      name: user.HelperName,
      email: user.Email,
      phone: user.Phone,
      avatar: user.IMG_Helper || 'https://randomuser.me/api/portraits/men/1.jpg',
      status: user.IsDeleted === null ? 'active' : 'inactive', // Ánh xạ IsDeleted
      address: user.Address,
      joinDate: user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString() : 'Không có',
      lastLogin: user.LastLogin ? new Date(user.LastLogin).toLocaleString() : 'Chưa từng'
    }));
    totalUsers.value = response.data.total;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
  }
};

// Gọi API khi mounted và theo dõi thay đổi
onMounted(fetchUsers);
watch([currentPage, cityFilter, searchQuery], fetchUsers);

// Thuộc tính tính toán
const filteredUsers = computed(() => users.value);

const sortedUsers = computed(() => {
  return [...filteredUsers.value].sort((a, b) => {
    let aValue = a[sortColumn.value];
    let bValue = b[sortColumn.value];
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    return sortDirection.value === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });
});

const paginatedUsers = computed(() => sortedUsers.value);

const totalPagesComputed = computed(() => totalPages.value);

// Phương thức
const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const viewUser = (user) => {
  selectedUser.value = user;
  showViewModal.value = true;
};

const editUser = (user) => {
  selectedUser.value = user;
  editForm.name = user.name;
  editForm.email = user.email;
  editForm.phone = user.phone;
  editForm.status = user.status;
  showEditModal.value = true;
};

const saveUser = async () => {
  if (selectedUser.value) {
    try {
      const updatedData = {
        HelperName: editForm.name,
        Email: editForm.email,
        Phone: editForm.phone,
        IsDeleted: editForm.status === 'active' ? null : true // Cập nhật IsDeleted
      };
      await apiClient.put(`/api/helpers/${selectedUser.value.id}`, updatedData);
      const index = users.value.findIndex(u => u.id === selectedUser.value.id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...editForm };
      }
      showEditModal.value = false;
      fetchUsers(); // Cập nhật lại danh sách
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error);
      alert('Không thể lưu thay đổi: ' + (error.response?.data?.message || error.message));
    }
  }
};

const confirmDelete = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (selectedUser.value) {
    try {
      await apiClient.update(`/api/helpers/${selectedUser.value.id}`);
      users.value = users.value.filter(u => u.id !== selectedUser.value.id);
      showDeleteModal.value = false;
      if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchUsers(); // Cập nhật lại danh sách sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Không thể xóa người dùng: ' + (error.response?.data?.message || error.message));
    }
  }
};

const addUser = async () => {
  try {
    const newUserData = {
      HelperName: newUser.name,
      Email: newUser.email,
      IsDeleted: newUser.status === 'active' ? null : true // Ánh xạ IsDeleted khi thêm mới
    };
    const response = await apiClient.post('/api/helpers', newUserData);
    fetchUsers(); // Cập nhật lại danh sách
    newUser.name = '';
    newUser.email = '';
    newUser.status = 'active';
    showAddUserModal.value = false;
  } catch (error) {
    console.error('Lỗi khi thêm người dùng:', error);
    alert('Không thể thêm người dùng: ' + (error.response?.data?.message || error.message));
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  font-size: 14px;
}

.add-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-button:hover {
  background-color: #45a049;
}

.table-container {
  overflow-x: auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}

.users-table th:hover {
  background-color: #e9e9e9;
}

.sort-indicator {
  margin-left: 5px;
}

.users-table td {
  padding: 12px;
  border-top: 1px solid #eee;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
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
  background-color: #F44336;
}

.status-indicator.pending {
  background-color: #FFC107;
}

.actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.action-btn.view:hover {
  color: #2196F3;
}

.action-btn.edit:hover {
  color: #FF9800;
}

.action-btn.delete:hover {
  color: #F44336;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e9e9e9;
}

.page-info {
  font-size: 14px;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Modal styles */
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.user-details {
  margin-top: 20px;
}

.detail-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.detail-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.detail-row strong {
  width: 100px;
  display: inline-block;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #F44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>
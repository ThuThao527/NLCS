<template>
  <div class="app-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo">
        <h2>TidyFlex</h2>
        
      </div>
      <nav class="nav-menu">
        <div 
          v-for="item in navItems" 
          :key="item.id"
          @click="activeComponent = item.component"
          class="nav-item"
          :class="{ active: activeComponent === item.component }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.name }}</span>
        </div>
      </nav>
      <button @click="logout" class="btn btn-danger">
                    Đăng xuất
                  </button>
    </div>

    <!-- Main Content -->
    <div class="content">
      <header class="content-header">
        <h1>{{ getActiveComponentTitle() }}</h1>
      </header>
      <main class="content-body">
        <keep-alive>
          <component :is="activeComponent"></component>
        </keep-alive>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, defineAsyncComponent } from 'vue'
import { UserIcon, CalendarIcon, PackageIcon, ShoppingCartIcon, HomeIcon } from 'lucide-vue-next'
import apiClient from '../apiClient';

// Async component imports
const ProfileComponent = defineAsyncComponent(() => 
  import('../components/ProfileComponent.vue')
)
const ScheduleComponent = defineAsyncComponent(() => 
  import('../components/ScheduleComponent.vue')
)
const ServicesComponent = defineAsyncComponent(() => 
  import('../components/ServicesComponent.vue')
)
const BookingsComponent = defineAsyncComponent(() => 
  import('../components/BookingsComponent.vue')
)
const HomeComponent = defineAsyncComponent(() => 
  import('../components/HomeComponent.vue')
)

// Navigation items
const navItems = [
    { 
    id: 1, 
    name: 'Trang chủ', 
    component: HomeComponent, 
    icon: HomeIcon 
  },
  { 
    id: 2, 
    name: 'Hồ sơ', 
    component: ProfileComponent, 
    icon: UserIcon 
  },
  { 
    id: 3, 
    name: 'Lịch làm việc', 
    component: ScheduleComponent, 
    icon: CalendarIcon 
  },
  { 
    id: 4, 
    name: 'Phí dịch vụ', 
    component: ServicesComponent, 
    icon: PackageIcon 
  },
  { 
    id: 5, 
    name: 'Phiếu Đặt', 
    component: BookingsComponent, 
    icon: ShoppingCartIcon 
  },
]

// Active component state (using shallowRef for performance with components)
const activeComponent = shallowRef(ProfileComponent)

// Get the title of the active component
const getActiveComponentTitle = () => {
  const item = navItems.find(item => item.component === activeComponent.value)
  return item ? item.name : ''
}

const logout = () => {
  const confirmDelete = confirm('Bạn có muốn đăng xuất?');
  if (!confirmDelete) {
    return; // Hủy xóa nếu người dùng chọn "Cancel"
  }
  // Xử lý đăng xuất, ví dụ: Xóa thông tin người dùng và điều hướng lại
  console.log('Đăng xuất');
  localStorage.removeItem('user'); // Nếu thông tin người dùng được lưu trong localStorage với key là 'user'
  localStorage.removeItem('token'); // Nếu có token lưu trong localStorage, bạn cũng cần xóa nó
  alert('log out successfull');
  // router.push('/');
  // window.location.reload();
  // window.location.href = '/';
  window.location.replace('/');
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  color: black;
}

.sidebar {
  width: 250px;
  background-color: #1a1a1a;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
  transition: width 0.3s ease;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #333;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}
.btn-danger {
  margin: 40px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 4px 8px;
  border-radius: 8px;
}

.nav-item:hover {
  background-color: #333;
}

.nav-item.active {
  background-color: #4a4a4a;
}

.nav-icon {
  margin-right: 12px;
  width: 20px;
  height: 20px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f5f5f5;
}

.content-header {
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 500;
}

.content-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Responsive styles */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar .logo h2 {
    display: none;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-icon {
    margin-right: 0;
  }
  
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
}
</style>
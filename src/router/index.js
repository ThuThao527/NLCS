import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import Sign_In_And_Out from '@/views/Sign_In_And_Out.vue';
import HelperView from '@/views/HelperView.vue';
import BookingsComponent from '@/components/BookingsComponent.vue';
import ScheduleComponent from '@/components/ScheduleComponent.vue';
import ServicesComponent from '@/components/ServicesComponent.vue';
import ProfileComponent from '@/components/ProfileComponent.vue';
import AdminUserView from '@/components/AdminUserView.vue';
import AdminHelperView from '@/components/AdminHelperView.vue';
// require('dotenv').config();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
    path: '/home',
    name: 'Home',
    component: HelperView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileComponent
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: ScheduleComponent
  },
  {
    path: '/services',
    name: 'Services',
    component: ServicesComponent
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: BookingsComponent
    },
  {
    path: '/',
    name: 'Sign_In_And_Out',
    component: Sign_In_And_Out
    },
    {
      path: '/admin',
      name: 'AdminView',
      component: AdminView
    },
    {
      path: '/UserList',
      name: 'AdminUserView',
      component: AdminUserView
    },
      {
      path: '/HelperList',
      name: 'AdminHelperView',
      component: AdminHelperView
    }
  
  ],
});

// router.beforeEach((to, from, next) => {
//   console.log('Navigating to:', to.path, 'from:', from.path);
//   const user = JSON.parse(localStorage.getItem('user'));
//   console.log('User:', user);
//   next();
// });

router.afterEach((to, from) => {
  console.log('Navigation completed to:', to.path, 'from:', from.path);
});


export default router;

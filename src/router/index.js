import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import AdminBookingView from '@/components/AdminBookingView.vue';
import AdminTourView from '@/components/AdminTourView.vue';
import AdminServiceView from '@/components/AdminServiceView.vue';
import AdminBlogView from '@/components/AdminBlogView.vue';
import AdminUserView from '@/components/AdminUserView.vue';
import TourDetail from '@/views/TourDetail.vue';
import BlogDetail from '@/components/BlogDetail.vue';
import FileViewer from '@/components/FileViewer.vue';
import Sign_In_And_Out from '@/views/Sign_In_And_Out.vue';
import AdminStatistics from '@/components/AdminStatistics.vue';
import HelperView from '@/views/HelperView.vue';
import BookingsComponent from '@/components/BookingsComponent.vue';
import ScheduleComponent from '@/components/ScheduleComponent.vue';
import ServicesComponent from '@/components/ServicesComponent.vue';
import ProfileComponent from '@/components/ProfileComponent.vue';

// require('dotenv').config();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', component: HelperView
      // component: AdminView,
    },
    { path: '/sign_in_and_out', component: Sign_In_And_Out },
    // { path: '/booking', name: 'Booking', component: AdminBookingView },
    { path: '/booking', name: 'Booking', component: BookingsComponent },
    { path: '/service', name: 'Service', component: ServicesComponent },
    { path: '/schedule', name: 'Schedule', component: ScheduleComponent },
    { path: '/profile', component:ProfileComponent },
    { path: '/user', component: AdminUserView },
  ],
});

router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path, 'from:', from.path);
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User:', user);
  next();
});

router.afterEach((to, from) => {
  console.log('Navigation completed to:', to.path, 'from:', from.path);
});

export default router;

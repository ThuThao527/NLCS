import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Ebook from '@/views/Ebook.vue';
import About from '@/views/About.vue';
import Charity from '@/views/Charity.vue';
import Blog from '@/views/Blog.vue';
import Booking from '@/components/Booking.vue'
import BlogDetail from '@/components/BlogDetail.vue';
import BlogForm from '@/components/BlogForm.vue';
import Sign_In_And_Out from '@/views/Sign_In_And_Out.vue';
import FileViewer from '@/components/FileViewer.vue';
import Profile from '@/views/Profile.vue';
// import OrderHistory from '@/components/OrderHistory.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/Ebook',
      name: 'Ebook',
      component: Ebook,
    },
    {
      path: '/About',
      name: 'About',
      component: About,
    },
    {
      path: '/Blog',
      name: 'Blog',
      component: Blog,
    },
    {
      path: '/Charity',
      name: 'Charity',
      component: Charity,
    },
    // { path: '/blogs', component: BlogList },
    { path: '/blogs/:id', name: 'BlogDetail', component: BlogDetail },
    { path: '/create', component: BlogForm },
    { path: '/sign_in_and_out', component: Sign_In_And_Out },
    {
      path: '/view-file/:id', // Chúng ta sẽ truyền tham số fileId
      name: 'FileViewer',
      component: FileViewer,
    },
    {
      path: '/Profile',
      component: Profile,
    },
    {path: '/Booking', component: Booking},
  ],
  scrollBehavior(to, from, savedPosition) {
    // Trả về vị trí cuộn lên đầu trang khi chuyển đến bất kỳ route nào
    return { top: 0 };
  },
});

export default router;

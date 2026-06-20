import { createRouter, createWebHistory } from 'vue-router';

// Lazy load views untuk efisiensi performa load halaman
const Login = () => import('../views/LoginView.vue');
const Dashboard = () => import('../views/DashboardView.vue');
const AdminArea = () => import('../views/AdminAreaView.vue');
const PemberiArea = () => import('../views/PemberiAreaView.vue');
const PenerimaArea = () => import('../views/PenerimaAreaView.vue');

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminArea',
    component: AdminArea,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/pemberi/:eventId',
    name: 'PemberiArea',
    component: PemberiArea,
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/penerima/:eventId',
    name: 'PenerimaArea',
    component: PenerimaArea,
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard untuk mengunci keamanan halaman di sisi Front-End
router.beforeEach((to, from, next) => {
  const loggedInUser = JSON.parse(localStorage.getItem('user_session'));

  // 1. Jika halaman butuh autentikasi tapi user belum login
  if (to.meta.requiresAuth && !loggedInUser) {
    return next({ name: 'Login' });
  }

  // 2. Jika user sudah login tapi mencoba akses halaman login lagi
  if (to.name === 'Login' && loggedInUser) {
    return next({ name: 'Dashboard' });
  }

  // 3. Validasi Role Akses (Admin vs User biasa)
  if (to.meta.role && loggedInUser && loggedInUser.role !== to.meta.role) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
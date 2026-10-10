import { createRouter, createWebHistory } from 'vue-router'
import BlankLayout from '@/layouts/blank.vue'
import DefaultLayout from '@/layouts/default.vue'
import { useSessionStore } from '@/stores/global/session.store'
import AccessPage from '@/pages/businesses/access.vue'
import BillingPage from '@/pages/businesses/billing.vue'
import BookingPage from '@/pages/businesses/booking.vue'
import CalendarPage from '@/pages/businesses/calendar.vue'
import CustomersPage from '@/pages/businesses/customers.vue'
import NotificationsPage from '@/pages/businesses/notifications.vue'
import ReportsPage from '@/pages/businesses/reports.vue'
import SettingsPage from '@/pages/businesses/settings.vue'
import WorkspacePage from '@/pages/businesses/index.vue'
import BookPage from '@/pages/book/index.vue'
import ManagePage from '@/pages/book/manage.vue'
import DashboardPage from '@/pages/dashboard/index.vue'
import ForgotPasswordPage from '@/pages/auth/forgot-password.vue'
import LoginPage from '@/pages/auth/login.vue'
import RegisterPage from '@/pages/auth/register.vue'
import ResetPasswordPage from '@/pages/auth/reset-password.vue'
import VerifyEmailPage from '@/pages/auth/verify-email.vue'
import HomePage from '@/pages/index.vue'
import ProfilePage from '@/pages/profile/index.vue'
import AdminPage from '@/pages/admin/index.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: BlankLayout,
      children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'login', name: 'login', component: LoginPage, meta: { guest: true } },
        { path: 'register', name: 'register', component: RegisterPage, meta: { guest: true } },
        { path: 'verify-email', name: 'verify-email', component: VerifyEmailPage },
        { path: 'forgot-password', name: 'forgot-password', component: ForgotPasswordPage, meta: { guest: true } },
        { path: 'reset-password', name: 'reset-password', component: ResetPasswordPage },
        { path: 'book/:slug/manage/:token', name: 'manage-booking', component: ManagePage },
        { path: 'book/:slug', name: 'book', component: BookPage },
        { path: 'dashboard', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true } },
      ],
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'profile', name: 'profile', component: ProfilePage },
        { path: 'admin', name: 'admin', component: AdminPage, meta: { admin: true } },
        { path: 'businesses/:slug/access/:tab?', name: 'access', component: AccessPage },
        { path: 'businesses/:slug/billing/:tab?', name: 'billing', component: BillingPage },
        { path: 'businesses/:slug/booking', name: 'booking', component: BookingPage },
        { path: 'businesses/:slug/calendar', name: 'calendar', component: CalendarPage },
        { path: 'businesses/:slug/customers/:tab?', name: 'customers', component: CustomersPage },
        { path: 'businesses/:slug/notifications', name: 'notifications', component: NotificationsPage },
        { path: 'businesses/:slug/reports/:tab?', name: 'reports', component: ReportsPage },
        { path: 'businesses/:slug/settings', name: 'settings', component: SettingsPage },
        { path: 'businesses/:slug/:tab?', name: 'workspace', component: WorkspacePage },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.bootstrap()
  if (to.meta.requiresAuth && !session.accessToken) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  if (to.meta.admin && session.user?.platformRole !== 'ADMIN') {
    return { name: 'dashboard' }
  }
  if (to.meta.guest && session.accessToken) {
    return { name: 'dashboard' }
  }
  return true
})

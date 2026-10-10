<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import logo from '@/assets/brand/nexora-logo.png'
import mark from '@/assets/brand/nexora-mark.png'
import { useSessionStore } from '@/stores/global/session.store'

const session = useSessionStore()
const menuOpen = ref(false)
const year = new Date().getFullYear()

const features = [
  {
    icon: 'mdi-calendar-check-outline',
    title: 'A public booking page',
    body: 'Customers pick a service, a person, and a time that is actually free.',
  },
  {
    icon: 'mdi-calendar-month-outline',
    title: 'One calendar',
    body: 'See the week, cancel a booking, and keep staff hours in one place.',
  },
  {
    icon: 'mdi-email-outline',
    title: 'Email that follows up',
    body: 'Confirmations, reminders, and a link to cancel or move the appointment.',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Customers on file',
    body: 'Names and contact details stay with the business, ready for the next visit.',
  },
  {
    icon: 'mdi-shield-account-outline',
    title: 'Roles for the team',
    body: 'Decide who can manage the calendar, customers, and the rest of the business.',
  },
  {
    icon: 'mdi-chart-bar',
    title: 'Reports for the period',
    body: 'See how services and staff are booking across the dates you choose.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Set up the business',
    body: 'Add services, prices, and the hours each person works.',
  },
  {
    n: '02',
    title: 'Share the page',
    body: 'Customers book from your link and only see times that are free.',
  },
  {
    n: '03',
    title: 'Run the day',
    body: 'Confirmations go out. You manage the week from one calendar.',
  },
]

function closeMenu(): void {
  menuOpen.value = false
}

let revealObserver: IntersectionObserver | undefined

onMounted(() => {
  const nodes = document.querySelectorAll('.site-reveal')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-in'))
    return
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return
      }
      entry.target.classList.add('is-in')
      revealObserver?.unobserve(entry.target)
    })
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' })
  nodes.forEach((node) => revealObserver?.observe(node))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <div class="site">
    <header class="site-header">
      <div class="site-header-inner">
        <router-link class="site-brand" to="/" @click="closeMenu">
          <img class="site-logo" :src="logo" alt="Nexora">
        </router-link>
        <nav id="site-nav" class="site-nav" :class="{ 'is-open': menuOpen }">
          <a href="#features" @click="closeMenu">Features</a>
          <a href="#how" @click="closeMenu">How it works</a>
          <a href="#product" @click="closeMenu">Product</a>
          <router-link
            v-if="!session.accessToken"
            class="site-nav-login"
            to="/login"
            @click="closeMenu"
          >
            Log in
          </router-link>
        </nav>
        <div class="site-header-actions">
          <router-link
            v-if="session.accessToken"
            class="site-btn site-btn-primary"
            to="/dashboard"
            @click="closeMenu"
          >
            Dashboard
          </router-link>
          <template v-else>
            <router-link class="site-login" to="/login" @click="closeMenu">Log in</router-link>
            <router-link class="site-btn site-btn-primary" to="/register" @click="closeMenu">
              <span class="site-btn-long">Start free trial</span>
              <span class="site-btn-short">Start trial</span>
            </router-link>
          </template>
          <button
            class="site-toggle"
            :class="{ 'is-open': menuOpen }"
            type="button"
            :aria-expanded="menuOpen"
            aria-controls="site-nav"
            @click="menuOpen = !menuOpen"
          >
            <span class="site-toggle-bars" aria-hidden="true" />
            <span class="site-sr">Menu</span>
          </button>
        </div>
      </div>
    </header>

    <section class="site-hero">
      <div class="site-hero-art" aria-hidden="true">
        <span class="site-orb site-orb-blue" />
        <span class="site-orb site-orb-teal" />
      </div>
      <div class="site-wrap site-hero-grid">
        <div class="site-hero-copy">
          <p class="site-kicker"><span class="site-dot" aria-hidden="true" />Online booking</p>
          <h1>Your day, open for appointments.</h1>
          <p class="site-lead">
            Let customers book 24/7 while you spend less time managing the calendar.
          </p>
          <div class="site-actions">
            <router-link
              v-if="session.accessToken"
              class="site-btn site-btn-light site-btn-lg"
              to="/dashboard"
            >
              Go to your businesses
            </router-link>
            <template v-else>
              <router-link class="site-btn site-btn-light site-btn-lg" to="/register">
                Start free trial
              </router-link>
              <router-link class="site-btn site-btn-line site-btn-lg" to="/login">
                Log in
              </router-link>
            </template>
          </div>
          <p class="site-fine">5 days with full access.</p>
        </div>
        <div class="site-stage" aria-hidden="true">
          <article class="site-book">
            <header class="site-book-head">
              <span class="site-book-mark">SN</span>
              <div>
                <strong>Studio North</strong>
                <span>Hair · London</span>
              </div>
            </header>
            <p class="site-book-service">
              Cut &amp; style
              <span>45 min</span>
            </p>
            <p class="site-book-day">Thursday</p>
            <div class="site-times">
              <span>9:00</span>
              <span>9:45</span>
              <span class="is-on">10:30</span>
              <span>11:15</span>
              <span>1:00</span>
              <span>2:30</span>
            </div>
            <p class="site-book-note">Maya is free at 10:30.</p>
          </article>
          <article class="site-week">
            <header>This week</header>
            <ul>
              <li><span>10:30</span> Cut &amp; style</li>
              <li><span>1:00</span> Colour</li>
              <li><span>3:15</span> Consult</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="site-points site-reveal" aria-label="What you get">
      <ul class="site-wrap">
        <li>
          <strong>24/7 booking</strong>
          <span>Customers book when you are closed.</span>
        </li>
        <li>
          <strong>Open times only</strong>
          <span>Taken slots never show on the page.</span>
        </li>
        <li>
          <strong>Staff hours</strong>
          <span>Each person keeps their own week.</span>
        </li>
        <li>
          <strong>A way to change it</strong>
          <span>Customers can cancel or move by email.</span>
        </li>
      </ul>
    </section>

    <section id="features" class="site-section">
      <div class="site-wrap">
        <header class="site-section-head site-reveal">
          <p class="site-kicker site-kicker-ink">Features</p>
          <h2>Everything around the appointment.</h2>
          <p>The booking page, the calendar, and the follow-up live in one business.</p>
        </header>
        <div class="site-features">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            class="site-feature site-reveal"
            :style="{ '--site-delay': `${index * 70}ms` }"
          >
            <span class="site-icon" aria-hidden="true">
              <v-icon :icon="feature.icon" size="22" color="#006DFC" />
            </span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="how" class="site-section site-section-white">
      <div class="site-wrap">
        <header class="site-section-head site-reveal">
          <p class="site-kicker site-kicker-ink">How it works</p>
          <h2>From setup to a booked day.</h2>
        </header>
        <ol class="site-steps">
          <li
            v-for="(step, index) in steps"
            :key="step.n"
            class="site-reveal"
            :style="{ '--site-delay': `${index * 90}ms` }"
          >
            <span>{{ step.n }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section id="product" class="site-section">
      <div class="site-wrap site-split">
        <article class="site-panel site-reveal">
          <p class="site-kicker site-kicker-ink">For customers</p>
          <h2>A page with your name on it.</h2>
          <p>
            They choose a service, a person, and an open time, then leave their details.
            If they add an email, they get a link to cancel or move the appointment.
          </p>
        </article>
        <article class="site-panel site-panel-navy site-reveal" style="--site-delay: 90ms">
          <p class="site-kicker">For the business</p>
          <h2>The week in one place.</h2>
          <p>
            See who is booked, cancel an appointment, and keep each person's hours next
            to the calendar. Customers, reports, and billing stay with the business.
          </p>
        </article>
      </div>
    </section>

    <section class="site-cta">
        <div class="site-wrap">
        <div class="site-cta-card site-reveal">
        <h2>Open your calendar to customers.</h2>
        <p>5 days with full access. Verify your email before the business goes live.</p>
        <div class="site-actions site-actions-center">
          <router-link
            v-if="session.accessToken"
            class="site-btn site-btn-light site-btn-lg"
            to="/dashboard"
          >
            Go to your businesses
          </router-link>
          <template v-else>
            <router-link class="site-btn site-btn-light site-btn-lg" to="/register">
              Start free trial
            </router-link>
            <router-link class="site-btn site-btn-line site-btn-lg" to="/login">
              Log in
            </router-link>
          </template>
        </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="site-wrap site-footer-grid">
        <div>
          <router-link class="site-foot-brand" to="/">
            <img class="site-mark" :src="mark" alt="">
            <span>Nexora</span>
          </router-link>
          <p>Appointments for businesses that live on the calendar.</p>
        </div>
        <div>
          <h2>Product</h2>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#product">Product</a>
        </div>
        <div>
          <h2>Account</h2>
          <router-link v-if="session.accessToken" to="/dashboard">Dashboard</router-link>
          <template v-else>
            <router-link to="/login">Log in</router-link>
            <router-link to="/register">Start free trial</router-link>
          </template>
        </div>
      </div>
      <div class="site-wrap site-legal">
        <span>© {{ year }} Nexora</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/brand/appointiva-logo.png'
</script>

<template>
  <div class="site">
    <header class="site-header">
      <div class="site-header-inner">
        <router-link class="site-brand" to="/">
          <img class="site-logo" :src="logo" alt="Appointiva">
        </router-link>
      </div>
    </header>

    <main class="site-wrap site-policy">
      <article class="site-policy-card">
        <h1>Privacy policy</h1>
        <p class="site-policy-updated">Appointiva · appointiva.co.uk · 20 November 2026</p>
        <p>
          This policy explains what personal information Appointiva collects, why we use it,
          and who we share it with. Appointiva is the online booking service at
          <a href="https://appointiva.co.uk/">https://appointiva.co.uk/</a>.
        </p>

        <h2>Account information</h2>
        <p>When you create an Appointiva account we collect:</p>
        <ul>
          <li>Your name and email address.</li>
          <li>A password, stored only as a hash. We do not keep the password you type.</li>
          <li>The legal name, phone number, and address of the business you register.</li>
        </ul>
        <p>
          We use this to create the account, send the email verification link, let you
          reset a password, and keep you signed in. Sign-in uses an httpOnly cookie.
          We also store the IP address and browser user agent for that session so we
          can protect the account.
        </p>

        <h2>Information you add for a business</h2>
        <p>
          After the account exists, the business can store its public name, description,
          category, timezone, currency, logo, services and prices, staff names and contact
          details, working hours, customers, and appointments. We use that information
          to run the booking page, the calendar, reports, and the emails described below.
          People you invite to the business can see the information their role allows.
        </p>

        <h2>People who book an appointment</h2>
        <p>
          A customer does not need an Appointiva account. The booking page collects the
          first name and last name, the service, the person, and the time. Email and phone
          are collected when the customer provides them or when the business requires them.
          If an email address is given, we send the confirmation, reminders, and a link to
          cancel or move the appointment. The business they booked with can see these details.
        </p>

        <h2>Payments</h2>
        <p>
          Paid subscriptions are processed by Stripe. Appointiva receives the subscription
          status and does not store full card numbers. Stripe’s own privacy policy covers
          the card details they collect.
        </p>

        <h2>Who we share information with</h2>
        <p>We share personal information only as needed to run Appointiva:</p>
        <ul>
          <li>The business whose booking page or account the information belongs to.</li>
          <li>Stripe, for subscription payments.</li>
          <li>The email service that delivers verification, password reset, and booking messages.</li>
          <li>The hosting provider that stores the application and its databases.</li>
        </ul>
        <p>We do not sell personal information.</p>

        <h2>How long we keep it</h2>
        <p>
          We keep account and booking information while the account or appointment is in use.
          A business can erase a customer record from Appointiva. You can ask us to delete
          your account and the personal information we hold for it.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy requests go to
          <a href="mailto:privacy@appointiva.co.uk">privacy@appointiva.co.uk</a>.
        </p>
      </article>
    </main>

    <footer class="site-footer">
      <div class="site-wrap site-legal">
        <router-link to="/">Appointiva</router-link>
        <span>© {{ new Date().getFullYear() }} Appointiva</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import WeatherWidget from '$lib/components/WeatherWidget.svelte';
</script>

<Navbar />
<div class="container-fluid py-4">
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="card p-4 text-center">
        <h1 class="mb-3">Welcome to Sports Hall Booking</h1>
        <WeatherWidget />
        <p class="mt-3">Book your favorite sports hall easily and quickly.</p>
        <p>Check availability, make bookings, and manage your reservations.</p>
        <p>Get started by <a href="/login">logging in</a> or <a href="/register">registering</a>.</p>
      </div>
    </div>
  </div>
</div>

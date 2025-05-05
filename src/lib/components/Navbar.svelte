<script lang="ts">
import { auth } from '$lib/stores/auth';
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

let loggedIn = false;
let username = '';

$: {
  const authState = get(auth);
  loggedIn = authState.loggedIn;
  if (authState.token) {
    try {
      const payload = JSON.parse(atob(authState.token.split('.')[1]));
      username = payload.username;
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
}

function logout() {
  auth.logout();
  goto('/');
}

onMount(() => {
  loggedIn = get(auth).loggedIn;
});
</script>

<nav class="navbar navbar-expand-lg navbar-dark mb-4 shadow-sm" style="background: linear-gradient(90deg, #2a4365 60%, #4fd1c5 100%);">
  <div class="container-fluid">
    <a class="navbar-brand d-flex align-items-center gap-2" href="/">
      <img src="/favicon.png" alt="Logo" width="32" height="32" class="rounded" />
      <span class="fw-bold">Sports Hall Booking</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="/halls">Halls</a></li>
        <li class="nav-item"><a class="nav-link" href="/bookings">Bookings</a></li>
        {#if !loggedIn}
          <li class="nav-item"><a class="nav-link" href="/login">Login</a></li>
          <li class="nav-item"><a class="nav-link btn btn-outline-light px-3 py-1 ms-2" href="/register">Sign Up</a></li>
        {:else}
          <li class="nav-item">
            <span class="navbar-text me-2">Welcome, {username}!</span>
          </li>
          <li class="nav-item"><button class="btn btn-light btn-sm" on:click={logout}>Logout</button></li>
        {/if}
      </ul>
    </div>
  </div>
</nav>
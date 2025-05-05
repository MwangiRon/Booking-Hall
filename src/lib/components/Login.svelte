<script lang="ts">
// Login form with JWT handling
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';
let username = '';
let password = '';
let submitting = false;
let error = '';

function validate() {
  error = '';
  if (!username) {
    error = 'Username is required';
    return false;
  }
  if (!password) {
    error = 'Password is required';
    return false;
  }
  return true;
}

async function login() {
  if (!validate()) return;
  submitting = true;
  error = '';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      auth.login(data.token);
      goto('/bookings');
    } else {
      error = data.error || 'Login failed';
    }
  } catch (e) {
    error = 'Login failed';
    console.error('Login error:', e);
  } finally {
    submitting = false;
  }
}
</script>

<form class="needs-validation" novalidate on:submit|preventDefault={login}>
  <div class="mb-3">
    <input type="text" class="form-control {error && !username ? 'is-invalid' : ''}" bind:value={username} placeholder="Username" required />
    {#if error && !username}<div class="invalid-feedback">Username is required</div>{/if}
  </div>
  <div class="mb-3">
    <input type="password" class="form-control {error && !password ? 'is-invalid' : ''}" bind:value={password} placeholder="Password" required />
    {#if error && !password}<div class="invalid-feedback">Password is required</div>{/if}
  </div>
  <button type="submit" class="btn btn-primary w-100" disabled={submitting}>Login</button>
  {#if error && username && password}
    <div class="alert alert-danger mt-3">{error}</div>
  {/if}
</form>

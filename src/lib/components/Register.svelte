<script lang="ts">
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';

// Registration form
let username = '';
let email = '';
let password = '';
let confirm = '';
let submitting = false;
let error = '';
let success = '';

function validate() {
  error = '';
  if (!username) {
    error = 'Username is required';
    return false;
  }
  if (!email) {
    error = 'Email is required';
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    error = 'Invalid email format';
    return false;
  }
  if (!password) {
    error = 'Password is required';
    return false;
  }
  if (password.length < 6) {
    error = 'Password must be at least 6 characters';
    return false;
  }
  if (password !== confirm) {
    error = 'Passwords do not match';
    return false;
  }
  return true;
}

async function register() {
  error = '';
  success = '';
  if (!validate()) return;
  submitting = true;
  
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      success = 'Registration successful! Logging you in...';
      // Auto-login after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        auth.login(loginData.token);
        setTimeout(() => goto('/bookings'), 1000);
      } else {
        error = loginData.error || 'Login after registration failed';
      }
    } else {
      error = data.error || 'Registration failed';
    }
  } catch (e) {
    error = 'Registration failed';
    console.error('Registration error:', e);
  } finally {
    submitting = false;
  }
}
</script>

<form class="needs-validation" novalidate on:submit|preventDefault={register}>
  <div class="mb-3">
    <input type="text" class="form-control {error && !username ? 'is-invalid' : ''}" bind:value={username} placeholder="Username" required />
    {#if error && !username}<div class="invalid-feedback">Username is required</div>{/if}
  </div>
  <div class="mb-3">
    <input type="email" class="form-control {error && (!email || !/^\S+@\S+\.\S+$/.test(email)) ? 'is-invalid' : ''}" bind:value={email} placeholder="Email" required />
    {#if error && (!email || !/^\S+@\S+\.\S+$/.test(email))}<div class="invalid-feedback">Valid email is required</div>{/if}
  </div>
  <div class="mb-3">
    <input type="password" class="form-control {error && !password ? 'is-invalid' : ''}" bind:value={password} placeholder="Password" required />
    {#if error && !password}<div class="invalid-feedback">Password is required</div>{/if}
  </div>
  <div class="mb-3">
    <input type="password" class="form-control {error && password !== confirm ? 'is-invalid' : ''}" bind:value={confirm} placeholder="Confirm Password" required />
    {#if error && password !== confirm}<div class="invalid-feedback">Passwords must match</div>{/if}
  </div>
  <button type="submit" class="btn btn-primary w-100" disabled={submitting}>Register</button>
  {#if error && username && email && password && confirm}
    <div class="alert alert-danger mt-3">{error}</div>
  {/if}
  {#if success}
    <div class="alert alert-success mt-3">{success}</div>
  {/if}
</form>

<style>
</style>

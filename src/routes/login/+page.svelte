<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import Login from '$lib/components/Login.svelte';
</script>

<Navbar />
<div class="container-fluid py-4">
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="card p-4">
        <h1 class="mb-4 text-center">Login</h1>
        <Login />
        <div class="text-center mt-3">
          <a href="/login" class="text-decoration-underline">Login as admin</a>
        </div>
      </div>
    </div>
  </div>
</div>
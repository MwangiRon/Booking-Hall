<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import Register from '$lib/components/Register.svelte';
</script>

<Navbar />
<div class="container-fluid py-4">
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="card p-4">
        <h1 class="mb-4 text-center">Register</h1>
        <Register />
      </div>
    </div>
  </div>
</div>
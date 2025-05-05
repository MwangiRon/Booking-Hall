<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import HallList from '$lib/components/HallList.svelte';
import HallForm from '$lib/components/HallForm.svelte';
import { auth } from '$lib/stores/auth';
import { invalidateAll, goto } from '$app/navigation';

export let data: {
  halls: Array<{
    id: string;
    name: string;
    description?: string;
    location: string;
    sportType: string;
    capacity: number;
    openingHours: string;
    constructionYear: number;
    isAccessible: boolean;
    timeSlots?: Array<{
      id: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    isReserved: boolean;
  }>;
  isAdmin: boolean;
  error?: string;
};

let showForm = false;
let selectedHall: any = undefined;
let loggedIn = false;
let showAuthPrompt = false;
let hallToBook: any = null;
let error = '';
let success = '';

auth.subscribe((v) => {
  loggedIn = v.loggedIn;
});

function handleCreate() {
  if (!data.isAdmin) return;
  selectedHall = {
    name: '',
    location: '',
    sportType: '',
    capacity: 0,
    openingHours: '',
    constructionYear: new Date().getFullYear(),
    isAccessible: true
  };
  showForm = true;
}

function handleEdit(event: CustomEvent<any>) {
  if (!data.isAdmin) return;
  selectedHall = { ...event.detail };
  showForm = true;
}

async function handleSave(event: CustomEvent<any>) {
  if (!data.isAdmin) return;
  error = '';
  success = '';
  const hall = event.detail;
  const jwt = localStorage.getItem('jwt');
  const method = hall.id ? 'PUT' : 'POST';
  const url = hall.id ? `/api/halls/${hall.id}` : '/api/halls';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify(hall)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save hall');
    }

    success = `Hall successfully ${hall.id ? 'updated' : 'created'}`;
    showForm = false;
    selectedHall = undefined;
    await invalidateAll();
  } catch (e: any) {
    error = e.message || 'Failed to save hall';
  }
}

async function handleRemove(event: CustomEvent<string>) {
  if (!data.isAdmin) return;
  error = '';
  try {
    const id = event.detail;
    const jwt = localStorage.getItem('jwt');
    const response = await fetch(`/api/halls/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete hall');
    }

    await invalidateAll();
  } catch (e: any) {
    error = e.message || 'Failed to delete hall';
  }
}

function handleBook(event: CustomEvent<any>) {
  if (!loggedIn) {
    hallToBook = event.detail;
    showAuthPrompt = true;
    return;
  }
  goto(`/bookings?hallId=${event.detail.id}`);
}
</script>

<Navbar />
<div class="container py-4">
  {#if data.error}
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      {data.error}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  {/if}

  {#if error}
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      {error}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  {/if}

  {#if success}
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      {success}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  {/if}

  <div class="card">
    <div class="card-header bg-transparent border-0">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="mb-0">Sports Halls</h1>
        {#if data.isAdmin}
          <button class="btn btn-primary" on:click={handleCreate}>
            <i class="bi bi-plus-lg me-2"></i>Add New Hall
          </button>
        {/if}
      </div>
    </div>

    <div class="card-body">
      {#if showForm && data.isAdmin}
        <div class="row mb-4">
          <div class="col-12">
            <HallForm {selectedHall} on:save={handleSave} />
          </div>
        </div>
      {/if}

      {#if data.halls.length === 0}
        <div class="text-center py-5">
          <i class="bi bi-building display-1 text-muted"></i>
          <p class="lead mt-3 text-muted">No sports halls available at the moment.</p>
          {#if data.isAdmin}
            <button class="btn btn-primary mt-3" on:click={handleCreate}>Add First Hall</button>
          {/if}
        </div>
      {:else}
        <HallList 
          halls={data.halls} 
          loggedIn={data.isAdmin} 
          on:edit={handleEdit} 
          on:remove={handleRemove}
          on:book={handleBook}
        />
      {/if}
    </div>
  </div>

  {#if showAuthPrompt}
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Login Required</h5>
            <button type="button" class="btn-close" aria-label="Close modal" on:click={() => showAuthPrompt = false}></button>
          </div>
          <div class="modal-body text-center">
            <p>Please log in or sign up to book <strong>{hallToBook?.name}</strong></p>
            <div class="d-flex justify-content-center gap-3">
              <a href="/login" class="btn btn-primary">Log In</a>
              <a href="/register" class="btn btn-outline-primary">Sign Up</a>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-link" on:click={() => showAuthPrompt = false}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .modal {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
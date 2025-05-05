<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import BookingForm from '$lib/components/BookingForm.svelte';
import BookingList from '$lib/components/BookingList.svelte';
import { onMount } from 'svelte';
import { invalidateAll, goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';
import { page } from '$app/stores';
import { get } from 'svelte/store';

interface Booking {
  id: number;
  purpose: string;
  notes?: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    sportsHall: {
      id: string;
      name: string;
      location: string;
    };
  };
  user: {
    username: string;
  };
}

interface PageData {
  bookings: Booking[];
  halls: Array<{
    id: string;
    name: string;
    openingHours: string;
  }>;
  hallId: string | null;
  error?: string;
  success?: string;
}

export let data: PageData;

let halls: { id: string; name: string; openingHours: string }[] = [];
let bookings: Booking[] = [];
let showForm = false;
let loggedIn = false;
let successMessage: string | null = null;
let loading = true;

auth.subscribe(value => {
  loggedIn = value.loggedIn;
  if (loggedIn) {
    loadBookings();
  }
});

let hallId: string | null = null;
$: {
  hallId = $page.url?.searchParams.get('hallId') ?? null;
}

async function loadBookings() {
  if (!loggedIn) return;
  
  loading = true;
  const token = get(auth).token;
  
  try {
    const response = await fetch('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      bookings = await response.json();
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
  } finally {
    loading = false;
  }
}

onMount(async () => {
  try {
    // Load halls regardless of login state so they are available when needed
    const res = await fetch('/api/halls');
    const allHalls = await res.json();
    halls = allHalls.map((h: { id: string; name: string; openingHours: string }) => ({ id: h.id, name: h.name, openingHours: h.openingHours }));
  } catch (error) {
    console.error('Error fetching halls:', error);
  }

  // Check for success message in sessionStorage
  if (typeof window !== 'undefined') {
    const storedMessage = sessionStorage.getItem('bookingSuccess');
    if (storedMessage) {
      successMessage = storedMessage;
      // Clear the message so it doesn't show on subsequent page loads
      sessionStorage.removeItem('bookingSuccess');
      setTimeout(() => {
        successMessage = null;
      }, 5000);
    }
  }

  if (hallId) {
    showForm = true;
  }

  if (data.success) {
    successMessage = data.success;
    setTimeout(() => {
      successMessage = null;
    }, 3000);
  }

  if (loggedIn) {
    loadBookings();
  }
});

async function handleSave() {
  showForm = false;
  await loadBookings();
}

async function handleRemove() {
  await loadBookings();
}

$: {
  if (data?.bookings) {
    bookings = data.bookings;
  }
}
</script>

<Navbar />
<div class="container py-4">
  {#if !loggedIn}
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card p-4 text-center">
          <h2>Welcome to Bookings</h2>
          <p class="mb-4">Please log in to view and manage your bookings.</p>
          <div class="d-flex justify-content-center gap-3">
            <a href="/login" class="btn btn-primary">Log In</a>
            <a href="/register" class="btn btn-outline-primary">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="card p-4">
      {#if successMessage}
        <div class="alert alert-success" role="alert">
          {successMessage}
        </div>
      {/if}
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Your Bookings</h1>
        <button 
          class="btn btn-primary" 
          on:click={() => showForm = !showForm}
          disabled={!halls.length}
        >
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {#if showForm}
        <div class="row mb-4">
          <div class="col-12">
            <BookingForm 
              halls={halls} 
              hallId={hallId} 
              on:save={handleSave} 
            />
          </div>
        </div>
      {/if}

      {#if loading}
        <div class="text-center py-5">
          <p class="text-muted mb-3">Loading bookings...</p>
        </div>
      {:else}
        <BookingList 
          bookings={bookings} 
          on:remove={handleRemove}
        />
        
        {#if bookings.length === 0 && !showForm}
          <div class="text-center py-5">
            <p class="text-muted mb-3">You don't have any bookings yet.</p>
            <button class="btn btn-primary" on:click={() => showForm = true}>
              Create Your First Booking
            </button>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

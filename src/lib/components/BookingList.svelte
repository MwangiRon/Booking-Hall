<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { auth } from '$lib/stores/auth';
import { invalidateAll } from '$app/navigation';

export let bookings: {
  id: number;
  purpose: string;
  notes?: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    sportsHall: {
      name: string;
      location: string;
    }
  };
  user: {
    username: string;
  }
}[] = [];

const dispatch = createEventDispatcher();
let cancellingId: number | null = null;
let error = '';

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
          ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

$: sortedBookings = [...bookings].sort((a, b) => 
  new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
);

$: upcomingBookings = sortedBookings.filter(b => 
  new Date(b.timeSlot.startTime) >= new Date()
);

$: pastBookings = sortedBookings.filter(b => 
  new Date(b.timeSlot.startTime) < new Date()
);

async function cancelBooking(id: number) {
  try {
    cancellingId = id;
    error = '';
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      error = 'Please log in to cancel bookings';
      return;
    }

    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      error = data.error || 'Failed to cancel booking';
      return;
    }

    dispatch('remove', id);
    await invalidateAll();
  } catch (e) {
    error = 'Failed to cancel booking';
    console.error('Error cancelling booking:', e);
  } finally {
    cancellingId = null;
  }
}
</script>

<div class="bookings-list">
  {#if error}
    <div class="alert alert-danger mb-3" role="alert">
      {error}
      <button type="button" class="btn-close" aria-label="Close" on:click={() => error = ''}></button>
    </div>
  {/if}

  {#if bookings.length === 0}
    <div class="text-center p-4">
      <p class="text-muted mb-0">No bookings found</p>
    </div>
  {:else}
    <div class="booking-sections">
      {#if upcomingBookings.length > 0}
        <h3 class="mb-3">Upcoming Bookings</h3>
        <div class="list-group mb-4">
          {#each upcomingBookings as booking (booking.id)}
            <div class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                  <div class="d-flex align-items-center mb-1">
                    <h5 class="mb-0">{booking.timeSlot.sportsHall.name}</h5>
                  </div>
                  <p class="mb-1"><strong>Date:</strong> {formatDateTime(booking.timeSlot.startTime).split('at')[0]}</p>
                  <p class="mb-1"><strong>Time:</strong> {formatTimeRange(booking.timeSlot.startTime, booking.timeSlot.endTime)}</p>
                  <p class="mb-1"><strong>Purpose:</strong> {booking.purpose}</p>
                  <p class="mb-1"><strong>Location:</strong> {booking.timeSlot.sportsHall.location}</p>
                  {#if booking.notes}
                    <p class="mb-0 text-muted"><strong>Notes:</strong> {booking.notes}</p>
                  {/if}
                </div>
                <button
                  class="btn btn-outline-danger btn-sm"
                  on:click={() => cancelBooking(booking.id)}
                  disabled={cancellingId === booking.id}
                >
                  {#if cancellingId === booking.id}
                    <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Cancelling...
                  {:else}
                    Cancel
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if pastBookings.length > 0}
        <h3 class="mb-3">Past Bookings</h3>
        <div class="list-group">
          {#each pastBookings as booking (booking.id)}
            <div class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                  <div class="d-flex align-items-center mb-1">
                    <h5 class="mb-0">{booking.timeSlot.sportsHall.name}</h5>
                  </div>
                  <p class="mb-1"><strong>Date:</strong> {formatDateTime(booking.timeSlot.startTime).split('at')[0]}</p>
                  <p class="mb-1"><strong>Time:</strong> {formatTimeRange(booking.timeSlot.startTime, booking.timeSlot.endTime)}</p>
                  <p class="mb-1"><strong>Purpose:</strong> {booking.purpose}</p>
                  <p class="mb-1"><strong>Location:</strong> {booking.timeSlot.sportsHall.location}</p>
                  {#if booking.notes}
                    <p class="mb-0 text-muted"><strong>Notes:</strong> {booking.notes}</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .bookings-list {
    max-width: 100%;
  }
  
  .list-group-item {
    transition: background-color 0.2s;
  }
  
  .list-group-item:hover {
    background-color: #f8f9fa;
  }
</style>
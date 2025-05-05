<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { invalidateAll, goto } from '$app/navigation';

export let halls: { id: string; name: string; openingHours?: string }[] = [];
export let hallId: string | null = null;
const dispatch = createEventDispatcher();

let date = '';
let startTime = '09:00';
let endTime = '17:00';
let purpose = '';
let notes = '';
let error = '';
let submitting = false;
let selectedHallOpeningHours = '';

// Set minimum date to today
$: minDate = new Date().toISOString().split('T')[0];

// Parse opening hours when hall is selected
$: {
  if (hallId) {
    const selectedHall = halls.find(h => h.id === hallId);
    selectedHallOpeningHours = selectedHall?.openingHours || '09:00-17:00';
    const [defaultStart, defaultEnd] = selectedHallOpeningHours.split('-');
    startTime = defaultStart.trim();
    endTime = defaultEnd.trim();
  }
}

function isTimeWithinOpeningHours(time: string): boolean {
  if (!selectedHallOpeningHours) return true;
  
  const [openStart, openEnd] = selectedHallOpeningHours.split('-').map(t => t.trim());
  const timeValue = time.replace(':', '');
  const startValue = openStart.replace(':', '');
  const endValue = openEnd.replace(':', '');
  
  return Number(timeValue) >= Number(startValue) && Number(timeValue) <= Number(endValue);
}

function validate() {
  error = '';
  if (!hallId) error = 'Hall is required';
  else if (!date) error = 'Date is required';
  else if (new Date(date) < new Date(minDate)) error = 'Date cannot be in the past';
  else if (!startTime) error = 'Start time is required';
  else if (!endTime) error = 'End time is required';
  else if (!isTimeWithinOpeningHours(startTime)) error = `Start time must be within opening hours (${selectedHallOpeningHours})`;
  else if (!isTimeWithinOpeningHours(endTime)) error = `End time must be within opening hours (${selectedHallOpeningHours})`;
  else if (startTime >= endTime) error = 'Start time must be before end time';
  else if (!purpose) error = 'Purpose is required';
  return !error;
}

function getJwtToken() {
  const authState = get(auth);
  return authState.token;
}

function resetForm() {
  hallId = null;
  date = '';
  startTime = '09:00';
  endTime = '17:00';
  purpose = '';
  notes = '';
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  if (!validate()) return;

  submitting = true;
  const token = getJwtToken();
  if (!token) {
    error = 'Please log in to create a booking';
    submitting = false;
    return;
  }

  try {
    const bookingDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(bookingDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // First check if the slot is available
    const response = await fetch(`/api/timeslots?hallId=${hallId}&date=${date}&startTime=${startTime}&endTime=${endTime}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const timeSlots = await response.json();
    
    if (!response.ok) {
      throw new Error(timeSlots.error || 'Failed to check availability');
    }

    if (timeSlots.some((slot: any) => !slot.isAvailable)) {
      error = 'This hall is already booked for the selected time';
      submitting = false;
      return;
    }

    // If available, proceed with booking
    const bookingResponse = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hallId,
        date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose,
        notes
      }),
    });

    const result = await bookingResponse.json();
    
    if (bookingResponse.ok) {
      // Store success message in sessionStorage to persist through navigation
      sessionStorage.setItem('bookingSuccess', 'Your booking was successfully created!');
      dispatch('save', result);
      resetForm();
      await invalidateAll();
      goto('/bookings', { replaceState: true });
    } else {
      error = result.error || 'Failed to create booking';
    }
  } catch (e) {
    error = 'Failed to create booking';
    console.error(e);
  } finally {
    submitting = false;
  }
}
</script>

<form class="card p-4" method="POST" on:submit={handleSubmit}>
  <div class="mb-3">
    <label for="hall-select" class="form-label">Hall</label>
    <select id="hall-select" name="hallId" class="form-select {error?.includes('Hall') ? 'is-invalid' : ''}" bind:value={hallId} required>
      <option value="" disabled>Select Hall</option>
      {#each halls as hall}
      <option value={hall.id}>{hall.name}</option>
      {/each}
    </select>
    {#if error?.includes('Hall')}
    <div class="invalid-feedback">{error}</div>
    {/if}
  </div>

  <div class="mb-3">
    <label for="date-input" class="form-label">Date</label>
    <input id="date-input" type="date" name="date" class="form-control {error?.includes('Date') ? 'is-invalid' : ''}" 
      bind:value={date} min={minDate} required />
    {#if error?.includes('Date')}
    <div class="invalid-feedback">{error}</div>
    {/if}
  </div>

  {#if hallId}
    <div class="row mb-3">
      <div class="col-6">
        <label for="start-time" class="form-label">Start Time</label>
        <input id="start-time" type="time" class="form-control {error?.includes('Start time') ? 'is-invalid' : ''}"
          bind:value={startTime} required />
        {#if error?.includes('Start time')}
        <div class="invalid-feedback">{error}</div>
        {/if}
      </div>
      <div class="col-6">
        <label for="end-time" class="form-label">End Time</label>
        <input id="end-time" type="time" class="form-control {error?.includes('End time') ? 'is-invalid' : ''}"
          bind:value={endTime} required />
        {#if error?.includes('End time')}
        <div class="invalid-feedback">{error}</div>
        {/if}
      </div>
      <div class="col-12 mt-2">
        <small class="text-muted">Opening hours: {selectedHallOpeningHours}</small>
      </div>
    </div>
  {/if}

  <div class="mb-3">
    <label for="purpose-input" class="form-label">Purpose</label>
    <input id="purpose-input" type="text" name="purpose" class="form-control {error?.includes('Purpose') ? 'is-invalid' : ''}"
      bind:value={purpose} required />
    {#if error?.includes('Purpose')}
    <div class="invalid-feedback">{error}</div>
    {/if}
  </div>

  <div class="mb-3">
    <label for="notes-input" class="form-label">Notes</label>
    <input id="notes-input" type="text" name="notes" class="form-control" bind:value={notes} placeholder="Optional" />
  </div>

  {#if error && !error.includes('Hall') && !error.includes('Date') && !error.includes('Purpose') && !error.includes('time')}
  <div class="alert alert-danger">{error}</div>
  {/if}
  <button type="submit" class="btn btn-primary w-100" disabled={submitting}>
    {submitting ? 'Creating booking...' : 'Book Now'}
  </button>
</form>

<style>
  .card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

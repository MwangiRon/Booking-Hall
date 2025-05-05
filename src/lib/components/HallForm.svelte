<script lang="ts">
import { createEventDispatcher, afterUpdate } from 'svelte';
// Form for creating/editing a hall
export let selectedHall: { id?: number; name: string; location: string; capacity: number; sportType?: string; openingHours?: string; constructionYear?: number; isAccessible?: boolean } = { name: '', location: '', capacity: 0 };
const dispatch = createEventDispatcher();
let hall = { ...selectedHall };
let errors: Record<string, string> = {};
let submitting = false;
let success = '';

// Keep hall in sync with selectedHall
afterUpdate(() => {
  hall = { ...selectedHall };
});

function validate() {
  errors = {};
  if (!hall.name) errors.name = 'Name is required';
  if (!hall.location) errors.location = 'Location is required';
  if (!hall.sportType) errors.sportType = 'Sport type is required';
  if (!hall.capacity || hall.capacity < 1) errors.capacity = 'Capacity must be at least 1';
  if (!hall.openingHours) errors.openingHours = 'Opening hours required';
  if (!hall.constructionYear || hall.constructionYear < 1900) errors.constructionYear = 'Enter a valid year';
  return Object.keys(errors).length === 0;
}

async function submit() {
  success = '';
  if (!validate()) return;
  submitting = true;
  await dispatch('save', hall);
  submitting = false;
  success = 'Hall saved!';
  setTimeout(() => (success = ''), 2000);
}
</script>

<div class="container-fluid py-4">
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="card p-4">
        <form class="needs-validation" novalidate on:submit|preventDefault={submit}>
          <div class="mb-3">
            <label class="form-label" for="hall-name">Name</label>
            <input id="hall-name" type="text" class="form-control {errors.name ? 'is-invalid' : ''}" bind:value={hall.name} />
            {#if errors.name}<div class="invalid-feedback">{errors.name}</div>{/if}
          </div>
          <div class="mb-3">
            <label class="form-label" for="hall-location">Location</label>
            <input id="hall-location" type="text" class="form-control {errors.location ? 'is-invalid' : ''}" bind:value={hall.location} />
            {#if errors.location}<div class="invalid-feedback">{errors.location}</div>{/if}
          </div>
          <div class="mb-3">
            <label class="form-label" for="hall-sportType">Sport Type</label>
            <input id="hall-sportType" type="text" class="form-control {errors.sportType ? 'is-invalid' : ''}" bind:value={hall.sportType} />
            {#if errors.sportType}<div class="invalid-feedback">{errors.sportType}</div>{/if}
          </div>
          <div class="mb-3">
            <label class="form-label" for="hall-capacity">Capacity</label>
            <input id="hall-capacity" type="number" class="form-control {errors.capacity ? 'is-invalid' : ''}" min="1" bind:value={hall.capacity} />
            {#if errors.capacity}<div class="invalid-feedback">{errors.capacity}</div>{/if}
          </div>
          <div class="mb-3">
            <label class="form-label" for="hall-openingHours">Opening Hours</label>
            <input id="hall-openingHours" type="text" class="form-control {errors.openingHours ? 'is-invalid' : ''}" bind:value={hall.openingHours} placeholder="e.g. 08:00-22:00" />
            {#if errors.openingHours}<div class="invalid-feedback">{errors.openingHours}</div>{/if}
          </div>
          <div class="mb-3">
            <label class="form-label" for="hall-constructionYear">Construction Year</label>
            <input id="hall-constructionYear" type="number" class="form-control {errors.constructionYear ? 'is-invalid' : ''}" min="1900" max={new Date().getFullYear()} bind:value={hall.constructionYear} />
            {#if errors.constructionYear}<div class="invalid-feedback">{errors.constructionYear}</div>{/if}
          </div>
          <div class="form-check mb-3">
            <input id="accessible" type="checkbox" class="form-check-input" bind:checked={hall.isAccessible} />
            <label class="form-check-label" for="accessible">Accessible</label>
          </div>
          <button type="submit" class="btn btn-primary" disabled={submitting}>{hall.id ? 'Update' : 'Create'} Hall</button>
          {#if success}
            <div class="alert alert-success mt-3">{success}</div>
          {/if}
        </form>
      </div>
    </div>
  </div>
</div>

<style>
</style>
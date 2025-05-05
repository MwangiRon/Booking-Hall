<script lang="ts">
import { createEventDispatcher } from 'svelte';
export let halls: {
  id: string;
  name: string;
  description?: string;
  location: string;
  sportType: string;
  capacity: number;
  openingHours: string;
  constructionYear: number;
  isAccessible: boolean;
}[] = [];
const dispatch = createEventDispatcher();
export let loggedIn: boolean = false;

function edit(hall: typeof halls[0]) {
  dispatch('edit', hall);
}

async function remove(id: string) {
  const jwt = localStorage.getItem('jwt');
  await fetch(`/api/halls/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${jwt}` }
  });
  dispatch('remove', id);
}

function book(hall: typeof halls[0]) {
  dispatch('book', hall);
}
</script>

<ul class="list-group list-group-flush">
  {#each halls as hall}
    <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
      <div class="w-100 text-break">
        <div class="d-flex align-items-center mb-2">
          <h5 class="mb-0 me-2">{hall.name}</h5>
          {#if hall.isAccessible}
            <span class="badge bg-info me-2" title="Accessible">
              <i class="bi bi-wheelchair"></i>
            </span>
          {/if}
        </div>
        <p class="mb-1"><strong>Sport Type:</strong> {hall.sportType}</p>
        <p class="mb-1"><strong>Location:</strong> {hall.location}</p>
        <p class="mb-1"><strong>Capacity:</strong> {hall.capacity} people</p>
        <p class="mb-0"><strong>Opening Hours:</strong> {hall.openingHours}</p>
      </div>
      <div class="d-flex gap-2 w-100 w-md-auto justify-content-end align-items-center">
        {#if loggedIn}
          <button class="btn btn-sm btn-outline-primary" on:click={() => edit(hall)}>Edit</button>
          <button class="btn btn-sm btn-outline-danger" on:click={() => remove(hall.id)}>Delete</button>
        {/if}
        <button class="btn btn-success btn-sm" on:click={() => book(hall)}>Book Now</button>
      </div>
    </li>
  {/each}
</ul>

<style>
  .list-group-item {
    transition: background-color 0.2s;
  }
  
  .list-group-item:hover {
    background-color: #f8f9fa;
  }
  
  @media (min-width: 768px) {
    .list-group-item {
      padding: 1rem;
    }
  }
</style>
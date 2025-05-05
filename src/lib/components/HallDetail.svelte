<script lang="ts">
// Show details for a single hall
export let hall: { id: number; name: string; location: string; capacity: number };
</script>

<div>
  <h2>{hall.name}</h2>
  <p>Location: {hall.location}</p>
  <p>Capacity: {hall.capacity}</p>
</div>
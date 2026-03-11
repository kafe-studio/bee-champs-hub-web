<script lang="ts">
  import { Badge } from "flowbite-svelte"
  import { usePlanner } from "./plannerState.svelte"

  const planner = usePlanner()
</script>

{#if planner.assignedProgramCount > 0}
  <Badge rounded class="bg-primary! text-bg-primary! text-[11px]! font-bold! min-w-5.5 h-5.5 px-1.5! ml-0.5">
    {planner.assignedProgramCount}
  </Badge>
{/if}

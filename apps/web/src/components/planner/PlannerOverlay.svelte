<script lang="ts">
  import { usePlanner } from "./plannerState.svelte"
  import MonthAssignModal from "./MonthAssignModal.svelte"

  const planner = usePlanner()
</script>

{#if planner.modalOpen && planner.modalProgramId}
  <MonthAssignModal {planner} />
{/if}

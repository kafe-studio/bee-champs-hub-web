<script lang="ts">
  import { t } from "../../i18n"
  import { emitOpenModal, usePlanner } from "./plannerState.svelte"

  let { programId, color = "#F5A623" }: { programId: string; color?: string } = $props()

  const planner = usePlanner()
  const monthCount = $derived(planner.getProgramMonths(programId).length)
</script>

<button
  onclick={() => emitOpenModal(programId)}
  class="w-full py-3 rounded-xl font-bold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
  style:background-color={color}
  style:color="white"
  style:box-shadow={`0 4px 14px ${color}40`}
>
  {#if monthCount > 0}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
    {t.planner.sidebar.assignedCount.replace("{count}", String(monthCount))}
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>
    {t.common.addToPlanner}
  {/if}
</button>

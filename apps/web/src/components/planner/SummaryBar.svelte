<script lang="ts">
  import { Button } from "flowbite-svelte"
  import { t } from "../../i18n"
  import { getCategoryColor, type usePlanner } from "./plannerState.svelte"

  let { planner, oninquiry }: { planner: ReturnType<typeof usePlanner>; oninquiry: () => void } = $props()
</script>

<div class="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-r from-bg-primary to-bg-secondary border-t border-primary/20 shadow-2xl">
  <div class="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
    <!-- Horni radek: label + akce (na mobilu) -->
    <div class="flex items-center justify-between w-full sm:w-auto sm:shrink-0">
      <span class="text-xs text-text-secondary shrink-0 font-semibold flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        {t.planner.summary.selected}
      </span>
      <!-- Mobilni akce -->
      <div class="flex items-center gap-2 sm:hidden">
        <Button
          color="alternative"
          size="xs"
          onclick={() => planner.clearAll()}
          class="text-text-secondary! hover:text-cat-events! bg-transparent! border-none! hover:bg-white/5! text-[11px]!"
        >
          {t.planner.summary.clearAll}
        </Button>
        <Button
          color="primary"
          size="xs"
          onclick={oninquiry}
          disabled={planner.totalAssignments === 0}
          class="rounded-lg! inline-flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
          {t.planner.submitInquiry}
        </Button>
      </div>
    </div>

    <!-- Chipy programu -->
    <div class="flex-1 flex gap-2 overflow-x-auto w-full sm:w-auto">
      {#each planner.assignedPrograms as program}
        {@const color = getCategoryColor(program.category)}
        {@const months = planner.getProgramMonths(program.id)}
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 whitespace-nowrap border"
          style:background-color="{color}20"
          style:border-color="{color}40"
          style:color={color}
        >
          {program.icon} {program.name}
          <span class="opacity-60 hidden sm:inline">{months.map((m) => {
            const names = ["Zar", "Rij", "Lis", "Pro", "Led", "Uno", "Bre", "Dub", "Kve", "Cer", "Cvc", "Srp"]
            return names[m]
          }).join(", ")}</span>
        </span>
      {/each}
    </div>

    <!-- Desktopove akce -->
    <div class="hidden sm:flex items-center gap-3 shrink-0">
      <Button
        color="alternative"
        size="xs"
        onclick={() => planner.clearAll()}
        class="text-text-secondary! hover:text-cat-events! bg-transparent! border-none! hover:bg-white/5!"
      >
        {t.planner.summary.clearAll}
      </Button>
      <Button
        color="primary"
        size="sm"
        onclick={oninquiry}
        disabled={planner.totalAssignments === 0}
        class="rounded-xl! shadow-md hover:shadow-lg! hover:scale-[1.02]! inline-flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
        {t.planner.submitInquiry}
      </Button>
    </div>
  </div>
</div>

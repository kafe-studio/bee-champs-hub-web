<script lang="ts">
  import { Modal, Button } from "flowbite-svelte"
  import { t } from "../../i18n"
  import { SCHOOL_MONTHS, getCategoryColor, getProgramById, type MonthIndex, type usePlanner } from "./plannerState.svelte"

  let { planner }: { planner: ReturnType<typeof usePlanner> } = $props()

  let isOpen = $state(true)

  // Rozliseni: prirazeni programu->mesice vs. mesic->programy
  const isMonthMode = $derived(planner.modalProgramId?.startsWith("__month__") ?? false)
  const monthIndex = $derived(
    isMonthMode ? parseInt(planner.modalProgramId!.replace("__month__", "")) as MonthIndex : null
  )
  const program = $derived(
    !isMonthMode && planner.modalProgramId ? getProgramById(planner.modalProgramId) : null
  )

  function handleClose() {
    if (!isOpen) return
    isOpen = false
    planner.closeModal()
  }
</script>

<Modal bind:open={isOpen} size="md" outsideclose onclose={handleClose}>
  {#snippet header()}
    <div>
      {#if isMonthMode && monthIndex !== null}
        <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading">{SCHOOL_MONTHS[monthIndex].name}</h3>
        <p class="text-text-muted text-xs mt-0.5">{t.planner.modal.selectPrograms}</p>
      {:else if program}
        <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading">
          {program.icon} {program.name}
        </h3>
        <p class="text-text-muted text-xs mt-0.5">{t.planner.modal.selectMonths}</p>
      {/if}
    </div>
  {/snippet}
  <div class="flex flex-col space-y-4">

    <!-- Obsah -->
    {#if !isMonthMode && program}
      <!-- Mod: program -> mesice -->
      <p class="text-text-muted text-xs">{t.planner.modal.clickMonths}</p>
      <div class="grid grid-cols-3 gap-2.5">
        {#each SCHOOL_MONTHS as month}
          {@const isAssigned = planner.getProgramMonths(program.id).includes(month.index)}
          {@const color = getCategoryColor(program.category)}
          <button
            onclick={() => planner.toggleMonthForProgram(program.id, month.index)}
            class="px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all text-center"
            style:border-color={isAssigned ? color : "#E2E8F0"}
            style:background-color={isAssigned ? `${color}15` : "transparent"}
            style:color={isAssigned ? color : "#64748B"}
          >
            {month.name}
            {#if isAssigned}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="inline ml-1"><path d="M20 6 9 17l-5-5"/></svg>
            {/if}
          </button>
        {/each}
      </div>

    {:else if isMonthMode && monthIndex !== null}
      <!-- Mod: mesic -> programy -->
      {@const allPrograms = planner.programs}
      {#if allPrograms.length === 0}
        <p class="text-text-muted text-sm text-center py-4">{t.planner.modal.noPrograms}</p>
      {:else}
        <div class="space-y-1 max-h-90 overflow-y-auto">
          {#each allPrograms as prog}
            {@const color = getCategoryColor(prog.category)}
            {@const isAssigned = planner.getMonthPrograms(monthIndex).some((p) => p.id === prog.id)}
            <button
              onclick={() => planner.toggleMonthForProgram(prog.id, monthIndex)}
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left"
              style:border-color={isAssigned ? `${color}40` : "transparent"}
              style:background-color={isAssigned ? `${color}0A` : "transparent"}
            >
              <div
                class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                style:border-color={isAssigned ? color : "#CBD5E1"}
                style:background-color={isAssigned ? color : "transparent"}
              >
                {#if isAssigned}
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                {/if}
              </div>
              <span
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                style:background-color="{color}12"
              >{prog.icon}</span>
              <span class="text-[13px] font-semibold truncate" style:color={isAssigned ? color : "#0D1B2E"}>
                {prog.name}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Paticka -->
    <div class="flex justify-end border-t border-gray-200 pt-3 dark:border-gray-700">
      <Button color="primary" onclick={handleClose}>
        {t.planner.modal.done}
      </Button>
    </div>
  </div>
</Modal>

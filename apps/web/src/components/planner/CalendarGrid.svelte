<script lang="ts">
  import { Badge, Button } from "flowbite-svelte"
  import { t } from "../../i18n"
  import { SCHOOL_MONTHS, getCategoryColor, type usePlanner } from "./plannerState.svelte"

  let { planner }: { planner: ReturnType<typeof usePlanner> } = $props()
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
  {#each SCHOOL_MONTHS as month}
    {@const monthPrograms = planner.getMonthPrograms(month.index)}
    {@const hasPrograms = monthPrograms.length > 0}
    <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group/month">
      <!-- Hlavicka mesice -->
      <div class="bg-[#2D384B] px-4 py-3 flex items-center justify-between">
        <h3 class="text-base font-bold text-white font-heading">{month.name}</h3>
        {#if hasPrograms}
          <Badge rounded class="bg-[#F5A623]! text-white/90! text-[11px]! font-bold!">
            {monthPrograms.length} {monthPrograms.length === 1 ? "akce" : monthPrograms.length < 5 ? "akce" : "akci"}
          </Badge>
        {/if}
      </div>

      <!-- Obsah mesice -->
      <div class="px-4 pb-3 pt-3 min-h-22.5">
        {#if hasPrograms}
          <div class="space-y-1.5">
            {#each monthPrograms as program}
              {@const color = getCategoryColor(program.category)}
              <div
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all group/tag"
                style:background-color="{color}0A"
              >
                <span class="w-2 h-2 rounded-full shrink-0" style:background-color={color}></span>
                <span class="text-xs shrink-0">{program.icon}</span>
                <span class="text-[13px] font-medium text-text-dark truncate flex-1">{program.name}</span>
                <button
                  onclick={() => planner.removeProgramFromMonth(program.id, month.index)}
                  class="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/tag:opacity-100 text-text-muted hover:text-cat-events transition-all shrink-0"
                  title={t.planner.modal.close}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Pridat program -->
        <div class:mt-2={hasPrograms} class:mt-0={!hasPrograms}>
          <Button
            outline
            color="light"
            size="xs"
            onclick={() => planner.openModal(`__month__${month.index}`)}
            class="w-full! border-dashed! border-border-light! text-text-muted/60! hover:text-primary! hover:border-primary/40! hover:bg-primary/5! rounded-lg!"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="me-1.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            {t.planner.calendar.addProgram}
          </Button>
        </div>
      </div>
    </div>
  {/each}
</div>

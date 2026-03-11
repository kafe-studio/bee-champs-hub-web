<script lang="ts">
  import { Input } from "flowbite-svelte"
  import type { CategorySlug } from "@bee-champs/shared"
  import { t } from "../../i18n"
  import { getCategoryColor, type usePlanner } from "./plannerState.svelte"

  let { planner }: { planner: ReturnType<typeof usePlanner> } = $props()

  const categoryFilters = $derived<{ slug: CategorySlug | "all"; label: string; color: string }[]>([
    { slug: "all", label: t.planner.sidebar.filterAll, color: "var(--color-text-secondary)" },
    ...planner.categories.map((c) => ({ slug: c.slug as CategorySlug, label: c.label, color: c.color })),
  ])

  /** Seskupeni filtrovanych programu podle kategorie */
  const groupedPrograms = $derived.by(() => {
    const groups: { slug: CategorySlug; name: string; color: string; programs: typeof planner.filteredPrograms }[] = []
    for (const cat of planner.categories) {
      const catPrograms = planner.filteredPrograms.filter((p) => p.category === cat.slug)
      if (catPrograms.length > 0) {
        groups.push({ slug: cat.slug, name: cat.name, color: cat.color, programs: catPrograms })
      }
    }
    return groups
  })

  let searchValue = $state(planner.searchQuery)
</script>

<div class="p-5">
  <!-- Hlavicka -->
  <div class="mb-5">
    <div class="flex items-center gap-2.5 mb-1">
      <div class="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
      </div>
      <div>
        <h2 class="text-base font-bold text-text-dark font-heading">{t.planner.sidebar.title}</h2>
        <p class="text-text-muted text-[11px]">{t.planner.sidebar.subtitle}</p>
      </div>
    </div>
  </div>

  <!-- Vyhledavani -->
  <div class="mb-4">
    <Input
      type="text"
      placeholder={t.planner.sidebar.searchPlaceholder}
      value={searchValue}
      oninput={(e: Event) => { searchValue = (e.currentTarget as HTMLInputElement).value; planner.setSearchQuery(searchValue) }}
      size="sm"
      class="rounded-xl! ps-9"
    >
      {#snippet left()}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted/50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      {/snippet}
    </Input>
  </div>

  <!-- Filtrace kategorii -->
  <div class="flex flex-wrap gap-1.5 mb-5">
    {#each categoryFilters as filter}
      {@const isActive = planner.activeCategory === filter.slug}
      <button
        onclick={() => planner.setActiveCategory(filter.slug)}
        class="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5"
        style:background-color={isActive ? (filter.slug === "all" ? "#F0EDE8" : `${filter.color}12`) : "transparent"}
        style:color={isActive ? (filter.slug === "all" ? "var(--color-text-dark)" : filter.color) : "var(--color-text-muted)"}
      >
        <span
          class="w-2 h-2 rounded-full shrink-0"
          style:background-color={filter.slug === "all" ? "var(--color-text-muted)" : filter.color}
        ></span>
        {filter.label}
      </button>
    {/each}
  </div>

  <!-- Seznam programu -->
  <div class="space-y-4">
    {#each groupedPrograms as group}
      <div>
        <!-- Hlavicka kategorie -->
        <div class="flex items-center gap-2 mb-2 px-1">
          <div class="w-2 h-2 rounded-full" style:background-color={group.color}></div>
          <span class="text-[10px] font-bold uppercase tracking-wider" style:color={group.color}>
            {group.name}
          </span>
          <div class="h-px flex-1 bg-border-light"></div>
          <span class="text-[10px] font-medium text-text-muted/50">{group.programs.length}</span>
        </div>

        <!-- Programy -->
        <div class="space-y-1.5">
          {#each group.programs as program}
            {@const isAssigned = planner.isProgramAssigned(program.id)}
            {@const monthCount = planner.getProgramMonths(program.id).length}
            <button
              onclick={() => planner.openModal(program.id)}
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left group/item bg-bg-warm hover:bg-[#F5F0E8]"
              class:!bg-[#F5F0E8]={isAssigned}
            >
              <!-- Ikona -->
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                style:background-color="{group.color}12"
              >{program.icon}</span>

              <!-- Nazev + info -->
              <div class="flex-1 min-w-0">
                <span class="text-[13px] font-semibold text-text-dark truncate block">{program.name}</span>
                <span class="text-[10px] text-text-muted">
                  {#if monthCount > 0}
                    <span class="font-semibold" style:color={group.color}>{t.planner.sidebar.assignedCount.replace("{count}", String(monthCount))}</span>
                  {:else}
                    {program.ageRange} · {program.duration}
                  {/if}
                </span>
              </div>

              <!-- Indikator stavu -->
              {#if isAssigned}
                <span class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style:background-color={group.color}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
              {:else}
                <span class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-text-muted/30 group-hover/item:text-primary transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/each}

    {#if groupedPrograms.length === 0}
      <div class="text-center py-8">
        <div class="w-12 h-12 mx-auto rounded-full bg-bg-warm flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <p class="text-text-muted text-sm">{t.planner.sidebar.noResults}</p>
      </div>
    {/if}
  </div>
</div>

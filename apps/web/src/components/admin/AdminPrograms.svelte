<script lang="ts">
  import { apiFetch } from "../../lib/api"

  type Category = { id: number; slug: string; name: string; label: string; color: string }
  type Program = {
    id: number; slug: string; categorySlug: string; name: string; icon: string;
    description: string; ageRange: string; duration: string; instructors: string;
    active: boolean; sortOrder: number;
  }

  let {
    initialPrograms,
    categories,
    adminToken,
  }: {
    initialPrograms: Program[]
    categories: Category[]
    adminToken: string
  } = $props()

  let programs = $state<Program[]>(initialPrograms)
  let editingId = $state<number | null>(null)
  let creating = $state(false)
  let saving = $state(false)
  let message = $state<string | null>(null)
  let messageType = $state<"success" | "error">("success")
  let filterCategory = $state("all")
  let searchQuery = $state("")
  let sortKey = $state<string | null>(null)
  let sortDir = $state<"asc" | "desc">("asc")

  let formSlug = $state("")
  let formName = $state("")
  let formCategory = $state("")
  let formIcon = $state("")
  let formDescription = $state("")
  let formAgeRange = $state("")
  let formDuration = $state("")
  let formInstructors = $state("")

  const categoryItems = categories.map(c => ({ value: c.slug, name: c.name, color: c.color }))
  const filterItems = [{ value: "all", name: "Vše" }, ...categoryItems.map(c => ({ value: c.value, name: c.name }))]
  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]))

  const filteredPrograms = $derived.by(() => {
    let result = filterCategory === "all" ? programs : programs.filter(p => p.categorySlug === filterCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (categoryMap[p.categorySlug]?.name ?? "").toLowerCase().includes(q)
      )
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aVal = "", bVal = ""
        if (sortKey === "name") { aVal = a.name; bVal = b.name }
        else if (sortKey === "category") { aVal = categoryMap[a.categorySlug]?.name ?? ""; bVal = categoryMap[b.categorySlug]?.name ?? "" }
        else if (sortKey === "age") { aVal = a.ageRange; bVal = b.ageRange }
        else if (sortKey === "duration") { aVal = a.duration; bVal = b.duration }
        else if (sortKey === "status") { aVal = a.active ? "a" : "z"; bVal = b.active ? "a" : "z" }
        const cmp = aVal.localeCompare(bVal, "cs")
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  })

  const authHeaders = { Authorization: `Bearer ${adminToken}` }

  function showMessage(text: string, type: "success" | "error") {
    message = text; messageType = type
    setTimeout(() => message = null, 3000)
  }

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc"
    } else {
      sortKey = key; sortDir = "asc"
    }
  }

  function startCreate() {
    creating = true; editingId = null
    formSlug = ""; formName = ""; formCategory = categories[0]?.slug ?? ""
    formIcon = ""; formDescription = ""; formAgeRange = ""; formDuration = ""; formInstructors = ""
  }

  function startEdit(p: Program) {
    editingId = p.id; creating = false
    formSlug = p.slug; formName = p.name; formCategory = p.categorySlug
    formIcon = p.icon; formDescription = p.description; formAgeRange = p.ageRange
    formDuration = p.duration; formInstructors = p.instructors
  }

  function cancelEdit() { editingId = null; creating = false }

  async function saveProgram() {
    if (!formName.trim() || !formSlug.trim()) return
    saving = true
    try {
      if (creating) {
        const result = await apiFetch<Program>("/admin/programs", {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ slug: formSlug.trim(), categorySlug: formCategory, name: formName.trim(), icon: formIcon.trim(), description: formDescription.trim(), ageRange: formAgeRange.trim(), duration: formDuration.trim(), instructors: formInstructors.trim(), sortOrder: programs.length }),
        })
        programs = [...programs, result]
        showMessage("Program vytvořen", "success")
      } else if (editingId) {
        const result = await apiFetch<Program>(`/admin/programs/${editingId}`, {
          method: "PUT", headers: authHeaders,
          body: JSON.stringify({ slug: formSlug.trim(), categorySlug: formCategory, name: formName.trim(), icon: formIcon.trim(), description: formDescription.trim(), ageRange: formAgeRange.trim(), duration: formDuration.trim(), instructors: formInstructors.trim() }),
        })
        programs = programs.map(p => p.id === editingId ? result : p)
        showMessage("Program uložen", "success")
      }
      cancelEdit()
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    } finally { saving = false }
  }

  async function toggleActive(p: Program) {
    saving = true
    try {
      const result = await apiFetch<Program>(`/admin/programs/${p.id}`, {
        method: "PUT", headers: authHeaders,
        body: JSON.stringify({ ...p, active: !p.active }),
      })
      programs = programs.map(pr => pr.id === p.id ? result : pr)
      showMessage(result.active ? "Program aktivován" : "Program deaktivován", "success")
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    } finally { saving = false }
  }

  async function deleteProgram(p: Program) {
    if (!confirm(`Smazat program "${p.name}"?`)) return
    saving = true
    try {
      await apiFetch(`/admin/programs/${p.id}`, { method: "DELETE", headers: authHeaders })
      programs = programs.filter(pr => pr.id !== p.id)
      showMessage("Program smazán", "success")
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    } finally { saving = false }
  }
</script>

{#snippet editForm()}
  <div class="bg-white rounded-xl border border-black/6 overflow-hidden mt-5 shadow-sm">
    <div class="px-6 py-4 border-b border-black/6">
      <h3 class="text-base font-semibold text-text-dark">{creating ? "Nový program" : "Upravit program"}</h3>
    </div>
    <div class="p-6">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Název</label>
          <input bind:value={formName} placeholder="Název programu" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Slug</label>
          <input bind:value={formSlug} placeholder="nazev-programu" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Kategorie</label>
          <select bind:value={formCategory} class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition">
            {#each categoryItems as cat}
              <option value={cat.value}>{cat.name}</option>
            {/each}
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Ikona (emoji)</label>
          <input bind:value={formIcon} placeholder="🏀" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="sm:col-span-2 flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Popis</label>
          <textarea bind:value={formDescription} placeholder="Krátký popis programu" rows="2" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition resize-y"></textarea>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Věkové rozmezí</label>
          <input bind:value={formAgeRange} placeholder="MŠ–ZŠ" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Délka</label>
          <input bind:value={formDuration} placeholder="90 min" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Lektoři</label>
          <input bind:value={formInstructors} placeholder="1–2" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-black/6 bg-black/2 flex items-center justify-end gap-3">
      <button onclick={cancelEdit} class="px-5 py-2.5 text-sm font-semibold text-text-dark rounded-lg hover:bg-black/5 transition">
        Zrušit
      </button>
      <button onclick={saveProgram} disabled={saving} class="px-5 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition disabled:opacity-50">
        {saving ? "Ukládám..." : creating ? "Vytvořit" : "Uložit"}
      </button>
    </div>
  </div>
{/snippet}

{#snippet sortIcon(key: string)}
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none" class="shrink-0 {sortKey === key ? 'text-primary' : 'text-text-muted/30'}">
    <path d="M8 3L11 6H5L8 3Z" fill="currentColor" class="{sortKey === key && sortDir === 'desc' ? 'opacity-30' : ''}"/>
    <path d="M8 13L5 10H11L8 13Z" fill="currentColor" class="{sortKey === key && sortDir === 'asc' ? 'opacity-30' : ''}"/>
  </svg>
{/snippet}

<div class="flex flex-col gap-6">
  <!-- Page Header -->
  <div class="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold text-text-dark font-heading leading-tight">Programy</h1>
      <p class="text-sm text-text-muted mt-1">Správa nabídky programů ({programs.length})</p>
    </div>
    <button onclick={startCreate} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      Nový program
    </button>
  </div>

  <!-- Toast -->
  {#if message}
    <div class="px-4 py-3 rounded-lg text-sm font-medium {messageType === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}">
      {message}
    </div>
  {/if}

  <!-- Novy program form -->
  {#if creating}
    {@render editForm()}
  {/if}

  <!-- Search + Filter bar -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1 max-w-80">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        placeholder="Hledat programy..."
        bind:value={searchQuery}
        class="w-full py-2.5 pl-10 pr-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition"
      />
    </div>
    <div class="flex gap-1.5 flex-wrap">
      {#each filterItems as item}
        <button
          onclick={() => filterCategory = item.value}
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition-all {filterCategory === item.value ? 'bg-primary text-white' : 'bg-white border border-black/8 text-text-muted hover:border-black/15 hover:text-text-dark'}"
        >
          {item.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- DataTable -->
  {#if filteredPrograms.length === 0}
    <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-16 h-16 flex items-center justify-center mb-4 text-text-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
        </div>
        <p class="text-base font-semibold text-text-dark mb-1">Žádné programy</p>
        <p class="text-sm text-text-muted">{searchQuery ? "Zkuste upravit vyhledávání" : "V této kategorii nejsou žádné programy"}</p>
      </div>
    </div>
  {:else}
    <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/6 bg-black/2">
              <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                <button onclick={() => toggleSort("name")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                  Název
                  {@render sortIcon("name")}
                </button>
              </th>
              <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                <button onclick={() => toggleSort("category")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                  Kategorie
                  {@render sortIcon("category")}
                </button>
              </th>
              <th class="text-left font-semibold text-text-dark whitespace-nowrap hidden md:table-cell">
                <button onclick={() => toggleSort("age")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                  Věk
                  {@render sortIcon("age")}
                </button>
              </th>
              <th class="text-left font-semibold text-text-dark whitespace-nowrap hidden lg:table-cell">
                <button onclick={() => toggleSort("duration")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                  Délka
                  {@render sortIcon("duration")}
                </button>
              </th>
              <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                <button onclick={() => toggleSort("status")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                  Stav
                  {@render sortIcon("status")}
                </button>
              </th>
              <th class="text-right font-semibold text-text-dark whitespace-nowrap px-4 py-3">
                Akce
              </th>
            </tr>
          </thead>
          <tbody>
            {#each filteredPrograms as program}
              <tr class="border-b border-black/6 last:border-b-0 hover:bg-black/1.5 transition {editingId === program.id ? 'bg-primary/3' : ''}">
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <span class="text-lg shrink-0">{program.icon}</span>
                    <div class="min-w-0">
                      <span class="font-semibold text-text-dark block truncate">{program.name}</span>
                      <span class="text-xs text-text-muted truncate block">{program.slug}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  {#if categoryMap[program.categorySlug]}
                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style:background-color="{categoryMap[program.categorySlug].color}15" style:color={categoryMap[program.categorySlug].color}>
                      <span class="w-1.5 h-1.5 rounded-full" style:background-color={categoryMap[program.categorySlug].color}></span>
                      {categoryMap[program.categorySlug].name}
                    </span>
                  {:else}
                    <span class="text-text-muted">{program.categorySlug}</span>
                  {/if}
                </td>
                <td class="px-4 py-3.5 text-text-muted hidden md:table-cell">{program.ageRange}</td>
                <td class="px-4 py-3.5 text-text-muted hidden lg:table-cell">{program.duration}</td>
                <td class="px-4 py-3.5">
                  {#if program.active}
                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-700">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Aktivní
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 text-text-muted">
                      <span class="w-1.5 h-1.5 rounded-full bg-text-muted/50"></span>
                      Neaktivní
                    </span>
                  {/if}
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      onclick={() => editingId === program.id ? cancelEdit() : startEdit(program)}
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition {editingId === program.id ? 'bg-primary-dark text-white' : 'bg-primary text-bg-primary hover:bg-primary-hover'}"
                    >
                      Upravit
                    </button>
                    <button
                      onclick={() => toggleActive(program)}
                      class="px-3 py-1.5 text-xs font-medium rounded-md border border-black/8 bg-white transition {program.active ? 'text-text-muted hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50' : 'text-green-700 hover:bg-green-50 hover:border-green-300'}"
                    >
                      {program.active ? "Deaktivovat" : "Aktivovat"}
                    </button>
                    <button
                      onclick={() => deleteProgram(program)}
                      class="px-3 py-1.5 text-xs font-medium rounded-md border border-black/8 bg-white text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
              {#if editingId === program.id}
                <tr>
                  <td colspan="6" class="px-4 pb-4">
                    {@render editForm()}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import { apiFetch } from "../../lib/api"

  type Inquiry = {
    id: number; schoolName: string; schoolType: string; city: string;
    childrenCount: number; ageRange: string; contactName: string;
    contactPosition: string | null; contactPhone: string; contactEmail: string;
    hasGym: string | null; hasPlayground: string | null; notes: string | null;
    selectedPrograms: string; createdAt: string;
  }

  let { initialInquiries, adminToken }: { initialInquiries: Inquiry[]; adminToken: string } = $props()

  let inquiries = $state<Inquiry[]>(initialInquiries)
  let selectedId = $state<number | null>(null)
  let message = $state<string | null>(null)
  let messageType = $state<"success" | "error">("success")
  let searchQuery = $state("")
  let sortKey = $state<string | null>("date")
  let sortDir = $state<"asc" | "desc">("desc")

  const selected = $derived(inquiries.find(i => i.id === selectedId))
  const authHeaders = { Authorization: `Bearer ${adminToken}` }

  const schoolTypeLabels: Record<string, string> = {
    ms: "MŠ", zs: "ZŠ", ss: "SŠ", other: "Jiné",
  }
  const schoolTypeFullLabels: Record<string, string> = {
    ms: "Mateřská škola", zs: "Základní škola", ss: "Střední škola", other: "Jiné",
  }
  const gymLabels: Record<string, string> = { yes: "Ano", no: "Ne", external: "Externí" }
  const playgroundLabels: Record<string, string> = { yes: "Ano", no: "Ne" }

  function parsePrograms(json: string): { id: string; name: string; category: string; months: string[] }[] {
    try { return JSON.parse(json) } catch { return [] }
  }

  const filteredInquiries = $derived.by(() => {
    let result = [...inquiries]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(i =>
        i.schoolName.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.contactName.toLowerCase().includes(q) ||
        i.contactEmail.toLowerCase().includes(q)
      )
    }
    if (sortKey) {
      result.sort((a, b) => {
        let aVal = "", bVal = ""
        if (sortKey === "school") { aVal = a.schoolName; bVal = b.schoolName }
        else if (sortKey === "type") { aVal = a.schoolType; bVal = b.schoolType }
        else if (sortKey === "city") { aVal = a.city; bVal = b.city }
        else if (sortKey === "contact") { aVal = a.contactName; bVal = b.contactName }
        else if (sortKey === "date") { aVal = a.createdAt; bVal = b.createdAt }
        else if (sortKey === "programs") {
          const aP = parsePrograms(a.selectedPrograms).length
          const bP = parsePrograms(b.selectedPrograms).length
          return sortDir === "asc" ? aP - bP : bP - aP
        }
        const cmp = aVal.localeCompare(bVal, "cs")
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  })

  function showMessage(text: string, type: "success" | "error" = "success") {
    message = text; messageType = type
    setTimeout(() => message = null, 3000)
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("cs", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("cs", { day: "numeric", month: "short", year: "numeric" })
  }

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc"
    } else {
      sortKey = key; sortDir = key === "date" ? "desc" : "asc"
    }
  }

  async function deleteInquiry(id: number) {
    if (!confirm("Opravdu smazat tuto poptávku?")) return
    try {
      await apiFetch(`/admin/inquiries/${id}`, { method: "DELETE", headers: authHeaders })
      inquiries = inquiries.filter(i => i.id !== id)
      if (selectedId === id) selectedId = null
      showMessage("Poptávka smazána")
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    }
  }
</script>

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
      <h1 class="text-2xl font-bold text-text-dark font-heading leading-tight">Poptávky</h1>
      <p class="text-sm text-text-muted mt-1">Přijaté poptávky od škol ({inquiries.length})</p>
    </div>
    {#if selected}
      <button onclick={() => selectedId = null} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-black/8 text-text-dark rounded-lg bg-white hover:bg-black/2 transition-all shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Zpět na seznam
      </button>
    {/if}
  </div>

  <!-- Toast -->
  {#if message}
    <div class="px-4 py-3 rounded-lg text-sm font-medium {messageType === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}">
      {message}
    </div>
  {/if}

  {#if selected}
    <!-- DETAIL VIEW -->
    <div class="flex flex-col gap-6">
      <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div class="px-6 py-5">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-1.5">
                <h2 class="text-xl font-bold text-text-dark">{selected.schoolName}</h2>
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {parsePrograms(selected.selectedPrograms).length} programů
                </span>
              </div>
              <p class="text-sm text-text-muted">
                {schoolTypeFullLabels[selected.schoolType] ?? selected.schoolType} · {selected.city} · {selected.childrenCount} dětí · {selected.ageRange}
              </p>
              <p class="text-xs text-text-muted/60 mt-1.5">{formatDate(selected.createdAt)}</p>
            </div>
            <button onclick={() => deleteInquiry(selected.id)} class="px-3 py-1.5 text-xs font-medium rounded-md border border-black/8 bg-white text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition">
              Smazat
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
          <div class="px-6 py-4 border-b border-black/6">
            <h3 class="text-base font-semibold text-text-dark">Kontaktní osoba</h3>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-bg-primary font-semibold text-sm shrink-0">
                {selected.contactName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-text-dark">{selected.contactName}</p>
                {#if selected.contactPosition}
                  <p class="text-text-muted text-sm">{selected.contactPosition}</p>
                {/if}
              </div>
            </div>
            <div class="flex flex-col gap-3 pl-15">
              <a href="mailto:{selected.contactEmail}" class="inline-flex items-center gap-2.5 text-sm text-primary hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {selected.contactEmail}
              </a>
              <a href="tel:{selected.contactPhone}" class="inline-flex items-center gap-2.5 text-sm text-primary hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.88.37 1.74.7 2.55a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.81.33 1.67.57 2.55.7A2 2 0 0 1 22 16.92z"/></svg>
                {selected.contactPhone}
              </a>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
          <div class="px-6 py-4 border-b border-black/6">
            <h3 class="text-base font-semibold text-text-dark">Zázemí školy</h3>
          </div>
          <div class="p-6 grid grid-cols-2 gap-5">
            <div>
              <p class="text-xs font-medium text-text-muted mb-1">Tělocvična</p>
              <p class="text-sm font-semibold text-text-dark">{gymLabels[selected.hasGym ?? ""] ?? "Neuvedeno"}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-text-muted mb-1">Hřiště</p>
              <p class="text-sm font-semibold text-text-dark">{playgroundLabels[selected.hasPlayground ?? ""] ?? "Neuvedeno"}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-text-muted mb-1">Počet dětí</p>
              <p class="text-sm font-semibold text-text-dark">{selected.childrenCount}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-text-muted mb-1">Věk</p>
              <p class="text-sm font-semibold text-text-dark">{selected.ageRange}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div class="px-6 py-4 border-b border-black/6 flex items-center justify-between">
          <h3 class="text-base font-semibold text-text-dark">Vybrané programy</h3>
          <span class="text-sm text-text-muted">{parsePrograms(selected.selectedPrograms).length} programů</span>
        </div>
        <div class="divide-y divide-black/6">
          {#each parsePrograms(selected.selectedPrograms) as program}
            <div class="flex items-center justify-between px-6 py-4">
              <span class="font-medium text-text-dark">{program.name}</span>
              <div class="flex flex-wrap gap-2">
                {#each program.months as month}
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{month}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if selected.notes}
        <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
          <div class="px-6 py-4 border-b border-black/6">
            <h3 class="text-base font-semibold text-text-dark">Poznámky</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-text-dark leading-relaxed">{selected.notes}</p>
          </div>
        </div>
      {/if}
    </div>

  {:else}
    <!-- TABLE VIEW -->
    <div class="relative max-w-80">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        placeholder="Hledat školy, města, kontakty..."
        bind:value={searchQuery}
        class="w-full py-2.5 pl-10 pr-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition"
      />
    </div>

    {#if filteredInquiries.length === 0}
      <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div class="w-16 h-16 flex items-center justify-center mb-4 text-text-muted/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <p class="text-base font-semibold text-text-dark mb-1">Žádné poptávky</p>
          <p class="text-sm text-text-muted">{searchQuery ? "Zkuste upravit vyhledávání" : "Poptávky od škol se zobrazí zde"}</p>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-black/6 bg-black/2">
                <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                  <button onclick={() => toggleSort("school")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Škola
                    {@render sortIcon("school")}
                  </button>
                </th>
                <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                  <button onclick={() => toggleSort("type")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Typ
                    {@render sortIcon("type")}
                  </button>
                </th>
                <th class="text-left font-semibold text-text-dark whitespace-nowrap hidden md:table-cell">
                  <button onclick={() => toggleSort("city")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Město
                    {@render sortIcon("city")}
                  </button>
                </th>
                <th class="text-left font-semibold text-text-dark whitespace-nowrap hidden lg:table-cell">
                  <button onclick={() => toggleSort("contact")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Kontakt
                    {@render sortIcon("contact")}
                  </button>
                </th>
                <th class="text-left font-semibold text-text-dark whitespace-nowrap hidden md:table-cell">
                  <button onclick={() => toggleSort("programs")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Programy
                    {@render sortIcon("programs")}
                  </button>
                </th>
                <th class="text-left font-semibold text-text-dark whitespace-nowrap">
                  <button onclick={() => toggleSort("date")} class="flex items-center gap-1.5 w-full px-4 py-3 hover:bg-black/3 transition">
                    Datum
                    {@render sortIcon("date")}
                  </button>
                </th>
                <th class="text-right font-semibold text-text-dark whitespace-nowrap px-4 py-3">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody>
              {#each filteredInquiries as inq}
                {@const progs = parsePrograms(inq.selectedPrograms)}
                <tr class="border-b border-black/6 last:border-b-0 hover:bg-black/1.5 transition">
                  <td class="px-4 py-3.5">
                    <span class="font-semibold text-text-dark">{inq.schoolName}</span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span class="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 text-text-muted">
                      {schoolTypeLabels[inq.schoolType] ?? inq.schoolType}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-text-muted hidden md:table-cell">{inq.city}</td>
                  <td class="px-4 py-3.5 hidden lg:table-cell">
                    <div class="text-text-dark">{inq.contactName}</div>
                    <div class="text-xs text-text-muted">{inq.contactEmail}</div>
                  </td>
                  <td class="px-4 py-3.5 hidden md:table-cell">
                    <span class="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {progs.length} prog.
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-text-muted text-xs whitespace-nowrap">{formatShortDate(inq.createdAt)}</td>
                  <td class="px-4 py-3.5 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        onclick={() => selectedId = inq.id}
                        class="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-bg-primary hover:bg-primary-hover transition"
                      >
                        Detail
                      </button>
                      <button
                        onclick={() => deleteInquiry(inq.id)}
                        class="px-3 py-1.5 text-xs font-medium rounded-md border border-black/8 bg-white text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
</div>

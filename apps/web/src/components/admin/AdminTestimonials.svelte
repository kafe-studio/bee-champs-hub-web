<script lang="ts">
  import { apiFetch } from "../../lib/api"

  type Testimonial = { id: number; text: string; name: string; role: string; initials: string; active: boolean; sortOrder: number }

  let { initialTestimonials, adminToken }: { initialTestimonials: Testimonial[]; adminToken: string } = $props()

  let items = $state<Testimonial[]>(initialTestimonials)
  let editingId = $state<number | null>(null)
  let creating = $state(false)
  let saving = $state(false)
  let message = $state<string | null>(null)
  let messageType = $state<"success" | "error">("success")
  let searchQuery = $state("")

  let formText = $state("")
  let formName = $state("")
  let formRole = $state("")
  let formInitials = $state("")

  const authHeaders = { Authorization: `Bearer ${adminToken}` }

  const filteredItems = $derived.by(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q) ||
      t.text.toLowerCase().includes(q)
    )
  })

  function showMessage(text: string, type: "success" | "error") {
    message = text; messageType = type
    setTimeout(() => message = null, 3000)
  }

  function startCreate() {
    creating = true; editingId = null
    formText = ""; formName = ""; formRole = ""; formInitials = ""
  }

  function startEdit(t: Testimonial) {
    editingId = t.id; creating = false
    formText = t.text; formName = t.name; formRole = t.role; formInitials = t.initials
  }

  function cancelEdit() { editingId = null; creating = false }

  async function save() {
    if (!formText.trim() || !formName.trim()) return
    saving = true
    try {
      if (creating) {
        const result = await apiFetch<Testimonial>("/admin/testimonials", {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ text: formText.trim(), name: formName.trim(), role: formRole.trim(), initials: formInitials.trim(), sortOrder: items.length }),
        })
        items = [...items, result]
        showMessage("Reference vytvořena", "success")
      } else if (editingId) {
        const result = await apiFetch<Testimonial>(`/admin/testimonials/${editingId}`, {
          method: "PUT", headers: authHeaders,
          body: JSON.stringify({ text: formText.trim(), name: formName.trim(), role: formRole.trim(), initials: formInitials.trim() }),
        })
        items = items.map(i => i.id === editingId ? result : i)
        showMessage("Reference uložena", "success")
      }
      cancelEdit()
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    } finally { saving = false }
  }

  async function deleteItem(t: Testimonial) {
    if (!confirm(`Smazat referenci od "${t.name}"?`)) return
    try {
      await apiFetch(`/admin/testimonials/${t.id}`, { method: "DELETE", headers: authHeaders })
      items = items.filter(i => i.id !== t.id)
      showMessage("Reference smazána", "success")
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Chyba", "error")
    }
  }
</script>

{#snippet editForm()}
  <div class="bg-white rounded-xl border border-black/6 overflow-hidden mt-5 shadow-sm">
    <div class="px-6 py-4 border-b border-black/6">
      <h3 class="text-base font-semibold text-text-dark">{creating ? "Nová reference" : "Upravit referenci"}</h3>
    </div>
    <div class="p-6">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="sm:col-span-2 flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Text recenze</label>
          <textarea bind:value={formText} placeholder="Text recenze..." rows="3" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition resize-y"></textarea>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Jméno</label>
          <input bind:value={formName} placeholder="Mgr. Jana Nováková" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Pozice</label>
          <input bind:value={formRole} placeholder="Ředitelka ZŠ Květinová" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-text-dark">Iniciály</label>
          <input bind:value={formInitials} placeholder="JN" class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition" />
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-black/6 bg-black/2 flex items-center justify-end gap-3">
      <button onclick={cancelEdit} class="px-5 py-2.5 text-sm font-semibold text-text-dark rounded-lg hover:bg-black/5 transition">
        Zrušit
      </button>
      <button onclick={save} disabled={saving} class="px-5 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition disabled:opacity-50">
        {saving ? "Ukládám..." : creating ? "Vytvořit" : "Uložit"}
      </button>
    </div>
  </div>
{/snippet}

<div class="flex flex-col gap-6">
  <!-- Page Header -->
  <div class="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 class="text-2xl font-bold text-text-dark font-heading leading-tight">Reference</h1>
      <p class="text-sm text-text-muted mt-1">Recenze a hodnocení od škol ({items.length})</p>
    </div>
    <button onclick={startCreate} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      Nová reference
    </button>
  </div>

  <!-- Toast -->
  {#if message}
    <div class="px-4 py-3 rounded-lg text-sm font-medium {messageType === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}">
      {message}
    </div>
  {/if}

  <!-- Nova reference -->
  {#if creating}
    {@render editForm()}
  {/if}

  <!-- Search -->
  <div class="relative max-w-80">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input
      type="text"
      placeholder="Hledat reference..."
      bind:value={searchQuery}
      class="w-full py-2.5 pl-10 pr-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition"
    />
  </div>

  <!-- DataTable -->
  {#if filteredItems.length === 0}
    <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-16 h-16 flex items-center justify-center mb-4 text-text-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p class="text-base font-semibold text-text-dark mb-1">Žádné reference</p>
        <p class="text-sm text-text-muted">{searchQuery ? "Zkuste upravit vyhledávání" : "Přidejte první referenci od školy"}</p>
      </div>
    </div>
  {:else}
    <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/6 bg-black/2">
              <th class="text-left font-semibold text-text-dark px-4 py-3">Autor</th>
              <th class="text-left font-semibold text-text-dark px-4 py-3 hidden md:table-cell">Text</th>
              <th class="text-left font-semibold text-text-dark px-4 py-3">Stav</th>
              <th class="text-right font-semibold text-text-dark px-4 py-3">Akce</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredItems as item}
              <tr class="border-b border-black/6 last:border-b-0 hover:bg-black/1.5 transition {editingId === item.id ? 'bg-primary/3' : ''} {!item.active ? 'opacity-50' : ''}">
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                      {item.initials}
                    </div>
                    <div class="min-w-0">
                      <span class="font-semibold text-text-dark block">{item.name}</span>
                      <span class="text-xs text-text-muted block truncate">{item.role}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5 hidden md:table-cell">
                  <p class="text-text-muted italic truncate max-w-md">&bdquo;{item.text}&ldquo;</p>
                </td>
                <td class="px-4 py-3.5">
                  {#if item.active}
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
                      onclick={() => editingId === item.id ? cancelEdit() : startEdit(item)}
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition {editingId === item.id ? 'bg-primary-dark text-white' : 'bg-primary text-bg-primary hover:bg-primary-hover'}"
                    >
                      Upravit
                    </button>
                    <button
                      onclick={() => deleteItem(item)}
                      class="px-3 py-1.5 text-xs font-medium rounded-md border border-black/8 bg-white text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
              {#if editingId === item.id}
                <tr>
                  <td colspan="4" class="px-4 pb-4">
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

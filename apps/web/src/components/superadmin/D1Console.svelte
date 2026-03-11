<script lang="ts">
  import { apiFetch } from "../../lib/api"

  let { superadminToken }: { superadminToken: string } = $props()

  type QueryMeta = { duration: number; rows_read: number; rows_written: number; changes: number; size_after: number }

  let sqlInput = $state("")
  let results = $state<Record<string, unknown>[]>([])
  let meta = $state<QueryMeta | null>(null)
  let columns = $state<string[]>([])
  let loading = $state(false)
  let error = $state<string | null>(null)
  let exporting = $state(false)
  let showConfirm = $state(false)
  let lastTable = $state<string | null>(null)
  let deletingRow = $state<number | null>(null)

  const authHeaders = { Authorization: `Bearer ${superadminToken}` }

  const DML_PATTERN = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)/i

  const quickQueries = [
    { label: "Tabulky", sql: "SELECT name, type FROM sqlite_master WHERE type='table' ORDER BY name" },
    { label: "Programy", sql: "SELECT id, slug, name, category_slug, active, sort_order FROM programs ORDER BY sort_order" },
    { label: "Kategorie", sql: "SELECT id, slug, name, color FROM categories ORDER BY sort_order" },
    { label: "Poptávky", sql: "SELECT id, school_name, city, contact_email, created_at FROM inquiries ORDER BY created_at DESC LIMIT 50" },
    { label: "Reference", sql: "SELECT id, name, role, active FROM testimonials ORDER BY sort_order" },
    { label: "Nastavení", sql: "SELECT key, value FROM settings ORDER BY key" },
    { label: "Indexy", sql: "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name" },
  ]

  async function executeQuery(overrideSql?: string) {
    const sql = overrideSql ?? sqlInput.trim()
    if (!sql) return

    // DML potvrzení
    if (DML_PATTERN.test(sql) && !showConfirm) {
      showConfirm = true
      return
    }
    showConfirm = false

    loading = true
    error = null
    try {
      const data = await apiFetch<{ results: Record<string, unknown>[]; meta: QueryMeta }>("/superadmin/d1/query", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ sql }),
      })
      results = data.results ?? []
      meta = data.meta ?? null
      columns = results.length > 0 ? Object.keys(results[0]) : []

      // Extrahuj tabulku z FROM klauzule
      const fromMatch = sql.match(/FROM\s+(\w+)/i)
      lastTable = fromMatch?.[1] ?? null
    } catch (e) {
      error = e instanceof Error ? e.message : "Chyba"
      results = []
      columns = []
      meta = null
    } finally {
      loading = false
    }
  }

  async function deleteRow(index: number) {
    if (!lastTable || !results[index]) return
    const row = results[index]
    const id = row["id"]
    if (id === undefined) {
      error = "Řádek nemá sloupec 'id'"
      return
    }

    deletingRow = index
    try {
      await apiFetch("/superadmin/d1/query", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ sql: `DELETE FROM ${lastTable} WHERE id = ${Number(id)}` }),
      })
      results = results.filter((_, i) => i !== index)
    } catch (e) {
      error = e instanceof Error ? e.message : "Chyba"
    } finally {
      deletingRow = null
    }
  }

  async function handleExport() {
    exporting = true
    error = null
    try {
      const data = await apiFetch<{ url: string }>("/superadmin/d1/export", {
        method: "POST",
        headers: authHeaders,
      })
      window.open(data.url, "_blank")
    } catch (e) {
      error = e instanceof Error ? e.message : "Export selhal"
    } finally {
      exporting = false
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      executeQuery()
    }
  }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold font-heading">D1 Konzole</h1>
      <p class="text-text-muted text-sm mt-1">SQL dotazy přímo na Cloudflare D1</p>
    </div>
    <button onclick={handleExport} disabled={exporting} class="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 border border-black/6 hover:bg-black/10 transition-colors disabled:opacity-50">
      {exporting ? "Exportuji..." : "Export DB"}
    </button>
  </div>

  <!-- Rychlé dotazy -->
  <div class="flex flex-wrap gap-2 mb-4">
    {#each quickQueries as q}
      <button
        onclick={() => { sqlInput = q.sql; executeQuery(q.sql) }}
        class="px-3 py-1.5 rounded-full text-xs font-medium bg-black/5 text-text-dark hover:bg-primary/15 hover:text-primary transition-colors"
      >
        {q.label}
      </button>
    {/each}
  </div>

  <!-- SQL editor -->
  <div class="mb-4">
    <textarea
      bind:value={sqlInput}
      onkeydown={handleKeydown}
      placeholder="SELECT * FROM ..."
      rows="4"
      class="w-full px-4 py-3 rounded-xl bg-white border border-black/6 text-text-dark font-mono text-sm placeholder-text-muted focus:outline-none focus:border-primary/50 resize-y"
    ></textarea>
    <div class="flex items-center justify-between mt-2">
      <span class="text-xs text-text-muted/60">Ctrl+Enter pro spuštění</span>
      <div class="flex gap-2">
        {#if showConfirm}
          <span class="text-xs text-primary mr-2">DML operace — opravdu spustit?</span>
          <button onclick={() => { showConfirm = false }} class="px-3 py-1.5 rounded-lg text-xs bg-black/5 hover:bg-black/10 transition-colors">Zrušit</button>
        {/if}
        <button
          onclick={() => executeQuery()}
          disabled={loading || !sqlInput.trim()}
          class="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Spouštím..." : showConfirm ? "Potvrdit" : "Spustit"}
        </button>
      </div>
    </div>
  </div>

  {#if error}
    <div class="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600 font-mono">{error}</div>
  {/if}

  <!-- Metadata -->
  {#if meta}
    <div class="flex flex-wrap gap-4 mb-4 text-xs text-text-muted">
      <span>{meta.duration.toFixed(2)} ms</span>
      <span>{meta.rows_read} řádků přečteno</span>
      <span>{meta.rows_written} řádků zapsáno</span>
      <span>{meta.changes} změn</span>
      <span>{(meta.size_after / 1024).toFixed(1)} KB</span>
    </div>
  {/if}

  <!-- Výsledky -->
  {#if columns.length > 0}
    <div class="overflow-x-auto rounded-xl border border-black/6">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-white">
            {#each columns as col}
              <th class="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap border-b border-black/6">{col}</th>
            {/each}
            {#if lastTable}
              <th class="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-black/6"></th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each results as row, i}
            <tr class="border-b border-black/4 hover:bg-bg-warm/30 {deletingRow === i ? 'opacity-40' : ''}">
              {#each columns as col}
                <td class="px-4 py-2 text-text-dark font-mono text-xs whitespace-nowrap max-w-xs truncate">{String(row[col] ?? "")}</td>
              {/each}
              {#if lastTable && row["id"] !== undefined}
                <td class="px-4 py-2">
                  <button onclick={() => deleteRow(i)} class="text-text-muted/60 hover:text-red-600 transition-colors" title="Smazat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="text-xs text-text-muted/60 mt-2">{results.length} řádků</p>
  {:else if !loading && !error && meta}
    <div class="text-center py-8 text-text-muted/60 text-sm">Dotaz proběhl úspěšně (bez výsledků)</div>
  {/if}
</div>

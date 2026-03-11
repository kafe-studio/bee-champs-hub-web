<script lang="ts">
  import { apiFetch } from "../../lib/api"

  let { superadminToken }: { superadminToken: string } = $props()

  let status = $state<"idle" | "loading" | "success" | "error">("idle")
  let error = $state("")
  let lastResult = $state<string | null>(null)
  let purgeUrls = $state("")
  let showPurgeAllConfirm = $state(false)

  const authHeaders = { Authorization: `Bearer ${superadminToken}` }

  async function purgeEverything() {
    if (!showPurgeAllConfirm) {
      showPurgeAllConfirm = true
      return
    }
    showPurgeAllConfirm = false
    status = "loading"
    error = ""
    try {
      const data = await apiFetch<{ ok: boolean; id: string }>("/superadmin/cache/purge", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ purgeEverything: true }),
      })
      status = "success"
      lastResult = `Cache vyčištěna (ID: ${data.id})`
    } catch (e) {
      status = "error"
      error = e instanceof Error ? e.message : "Chyba"
    }
  }

  async function purgeByUrls() {
    const urls = purgeUrls.split("\n").map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) return
    if (urls.length > 30) {
      error = "Maximálně 30 URL najednou"
      status = "error"
      return
    }

    status = "loading"
    error = ""
    try {
      const data = await apiFetch<{ ok: boolean; id: string }>("/superadmin/cache/purge", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ files: urls }),
      })
      status = "success"
      lastResult = `Vyčištěno ${urls.length} URL (ID: ${data.id})`
    } catch (e) {
      status = "error"
      error = e instanceof Error ? e.message : "Chyba"
    }
  }

  function resetStatus() {
    if (status === "success" || status === "error") {
      status = "idle"
      error = ""
      lastResult = null
    }
  }
</script>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold font-heading">Cache Purge</h1>
    <p class="text-text-muted text-sm mt-1">Vyčistit Cloudflare CDN cache</p>
  </div>

  {#if status === "success" && lastResult}
    <div class="mb-6 px-4 py-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-600">{lastResult}</div>
  {/if}

  {#if status === "error" && error}
    <div class="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">{error}</div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Purge Everything -->
    <div class="bg-white rounded-xl border border-black/6 p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </div>
        <div>
          <h2 class="font-bold text-lg">Purge Everything</h2>
          <p class="text-text-muted/60 text-xs">Vyčistí CELOU cache pro všechny domény v zóně</p>
        </div>
      </div>

      <div class="bg-red-50/50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-600">
        Tato akce je destruktivní. Všechny cachovane odpovědi budou smazány a bude potřeba je znovu vygenerovat.
      </div>

      {#if showPurgeAllConfirm}
        <div class="flex gap-2">
          <button onclick={purgeEverything} disabled={status === "loading"} class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-text-dark hover:bg-red-700 transition-colors disabled:opacity-50">
            {status === "loading" ? "Mažu..." : "Ano, smazat vše"}
          </button>
          <button onclick={() => showPurgeAllConfirm = false} class="px-4 py-2.5 rounded-lg text-sm bg-black/5 border border-black/6 hover:bg-black/10 transition-colors">
            Zrušit
          </button>
        </div>
      {:else}
        <button onclick={purgeEverything} disabled={status === "loading"} class="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
          Purge Everything
        </button>
      {/if}
    </div>

    <!-- Purge by URL -->
    <div class="bg-white rounded-xl border border-black/6 p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div>
          <h2 class="font-bold text-lg">Purge podle URL</h2>
          <p class="text-text-muted/60 text-xs">Vyčistit cache pro konkrétní URL (max 30)</p>
        </div>
      </div>

      <textarea
        bind:value={purgeUrls}
        onfocus={resetStatus}
        placeholder={"https://beechampshub.cz/\nhttps://beechampshub.cz/api/programs"}
        rows="5"
        class="w-full px-4 py-3 rounded-lg bg-bg-warm border border-black/6 text-text-dark font-mono text-xs placeholder-text-muted focus:outline-none focus:border-primary/50 resize-y mb-4"
      ></textarea>

      <button
        onclick={purgeByUrls}
        disabled={status === "loading" || !purgeUrls.trim()}
        class="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Mažu..." : "Purge URL"}
      </button>
    </div>
  </div>
</div>

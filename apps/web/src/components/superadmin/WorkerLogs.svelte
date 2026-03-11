<script lang="ts">
  import { apiFetch, API_BASE } from "../../lib/api"

  let { superadminToken }: { superadminToken: string } = $props()

  type LogEntry = {
    id: number
    timestamp: string
    outcome: string
    method: string
    url: string
    status: number
    logs: string[]
    exceptions: string[]
    scriptName: string | null
  }

  const WORKERS = ["bee-champs-hub-web"]
  const MAX_ENTRIES = 500

  let selectedWorker = $state("bee-champs-hub-web")
  let status = $state<"idle" | "connecting" | "connected" | "error">("idle")
  let error = $state("")
  let paused = $state(false)

  let tailId = $state<string | null>(null)
  let ws = $state<WebSocket | null>(null)
  let expiresAt = $state<string | null>(null)

  let entries = $state<LogEntry[]>([])
  let entryCounter = $state(0)

  let filterText = $state("")
  let showOnlyErrors = $state(false)

  const authHeaders = { Authorization: `Bearer ${superadminToken}` }

  const filteredEntries = $derived(
    entries.filter((e) => {
      if (showOnlyErrors && e.outcome === "ok" && e.exceptions.length === 0) return false
      if (filterText) {
        const q = filterText.toLowerCase()
        return (
          e.url.toLowerCase().includes(q) ||
          e.method.toLowerCase().includes(q) ||
          e.logs.some((l) => l.toLowerCase().includes(q)) ||
          e.exceptions.some((ex) => ex.toLowerCase().includes(q))
        )
      }
      return true
    }),
  )

  async function startTail() {
    status = "connecting"
    error = ""
    entries = []
    entryCounter = 0

    try {
      const data = await apiFetch<{ id: string; url: string; expiresAt: string; scriptName: string }>(
        "/superadmin/logs/tail",
        { method: "POST", headers: authHeaders, body: JSON.stringify({ scriptName: selectedWorker }) },
      )

      tailId = data.id
      expiresAt = data.expiresAt
      connectWebSocket(data.url)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      status = "error"
    }
  }

  function connectWebSocket(url: string) {
    const socket = new WebSocket(url, "trace-v1")

    socket.onopen = () => {
      status = "connected"
    }

    socket.onmessage = async (event) => {
      if (paused) return

      try {
        const raw = event.data instanceof Blob ? await event.data.text() : event.data
        const data = JSON.parse(raw) as {
          outcome?: string
          scriptName?: string | null
          eventTimestamp?: number
          event?: {
            request?: { url?: string; method?: string }
            response?: { status?: number }
          }
          logs?: Array<{ message: unknown[]; level: string; timestamp: number }>
          exceptions?: Array<{ name: string; message: string; timestamp: number }>
        }

        const entry: LogEntry = {
          id: ++entryCounter,
          timestamp: data.eventTimestamp
            ? new Date(data.eventTimestamp).toLocaleTimeString("cs", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
              })
            : new Date().toLocaleTimeString("cs"),
          outcome: data.outcome ?? "unknown",
          method: data.event?.request?.method ?? "?",
          url: data.event?.request?.url ?? "",
          status: data.event?.response?.status ?? 0,
          logs: (data.logs ?? []).map((l) =>
            l.message.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join(" "),
          ),
          exceptions: (data.exceptions ?? []).map((ex) => `${ex.name}: ${ex.message}`),
          scriptName: data.scriptName ?? null,
        }

        entries = [entry, ...entries.slice(0, MAX_ENTRIES - 1)]
      } catch {
        // Nevalidní zpráva — ignoruj
      }
    }

    socket.onerror = () => {
      error = "WebSocket chyba"
      status = "error"
    }

    socket.onclose = () => {
      if (status === "connected") {
        status = "idle"
      }
      ws = null
    }

    ws = socket
  }

  async function stopTail() {
    if (ws) {
      ws.close()
      ws = null
    }

    if (tailId) {
      try {
        await fetch(`${API_BASE}/superadmin/logs/tail/${tailId}`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ scriptName: selectedWorker }),
        })
      } catch {
        // Ignoruj — session expiruje sama
      }
      tailId = null
    }

    status = "idle"
  }

  function clearLogs() {
    entries = []
    entryCounter = 0
  }

  function outcomeColor(outcome: string): string {
    if (outcome === "ok") return "text-green-600"
    if (outcome === "exception") return "text-red-600"
    return "text-amber-600"
  }

  function statusColor(code: number): string {
    if (code >= 200 && code < 300) return "text-green-600"
    if (code >= 400 && code < 500) return "text-amber-600"
    if (code >= 500) return "text-red-600"
    return "text-text-muted"
  }

  function shortUrl(url: string): string {
    try {
      const u = new URL(url)
      return u.pathname + u.search
    } catch {
      return url
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold font-heading">Worker Logy</h1>
      <p class="text-text-muted text-sm mt-1">Real-time logy z Cloudflare Workers</p>
    </div>
    {#if status === "connected"}
      <span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-600 animate-pulse">
        <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        LIVE
      </span>
    {:else if status === "connecting"}
      <span class="inline-flex items-center rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-text-muted animate-pulse">Pripojuji...</span>
    {/if}
  </div>

  <!-- Ovládání -->
  <div class="bg-white rounded-xl border border-black/6 p-4 space-y-3">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <!-- Výběr workeru -->
      <div class="flex gap-1.5">
        {#each WORKERS as w}
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {selectedWorker === w ? 'bg-primary text-white' : 'bg-black/5 text-text-muted hover:bg-black/10'}"
            disabled={status === "connected"}
            onclick={() => { selectedWorker = w }}
          >
            {w}
          </button>
        {/each}
      </div>

      <div class="flex gap-2 sm:ml-auto">
        {#if status === "connected"}
          <button
            onclick={() => { paused = !paused }}
            class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors {paused ? 'bg-primary/10 text-primary border-primary/20' : 'border-black/6 hover:bg-black/5'}"
          >
            {paused ? "Pokracovat" : "Pauza"}
          </button>
          <button
            onclick={clearLogs}
            class="rounded-lg border border-black/6 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
          >
            Vymazat
          </button>
          <button
            onclick={stopTail}
            class="rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-red-100"
          >
            Zastavit
          </button>
        {:else}
          <button
            onclick={startTail}
            disabled={status === "connecting"}
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {status === "connecting" ? "Pripojuji..." : "Spustit tail"}
          </button>
        {/if}
      </div>
    </div>

    {#if status === "connected"}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Filtr (URL, log, exception...)"
          bind:value={filterText}
          class="flex-1 rounded-lg border border-black/6 bg-bg-warm px-3 py-1.5 text-sm text-text-dark focus:border-primary/50 focus:outline-none"
        />
        <label class="flex items-center gap-1.5 text-sm text-text-muted cursor-pointer">
          <input type="checkbox" bind:checked={showOnlyErrors} class="rounded" />
          Jen chyby
        </label>
      </div>
    {/if}

    {#if expiresAt && status === "connected"}
      <p class="text-xs text-text-muted/60">
        Session vyprsi: {new Date(expiresAt).toLocaleTimeString("cs")}
        &middot; {filteredEntries.length} / {entries.length} zaznamu
        {#if paused}
          &middot; <span class="text-amber-600 font-medium">PAUZA</span>
        {/if}
      </p>
    {/if}

    {#if status === "error"}
      <p class="text-sm text-red-600">{error}</p>
    {/if}
  </div>

  <!-- Výpis logů -->
  {#if entries.length > 0}
    <div class="rounded-xl border border-black/6 overflow-hidden">
      <div class="max-h-[70vh] overflow-y-auto font-mono text-xs">
        {#each filteredEntries as entry (entry.id)}
          <div class="border-b border-black/4 px-3 py-2 hover:bg-bg-warm/50 transition-colors">
            <!-- Hlavní řádek -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-text-muted/60 shrink-0">{entry.timestamp}</span>
              <span class="font-bold shrink-0 {outcomeColor(entry.outcome)}">
                {entry.outcome.toUpperCase()}
              </span>
              <span class="font-bold text-text-dark shrink-0">{entry.method}</span>
              {#if entry.status > 0}
                <span class="shrink-0 {statusColor(entry.status)}">{entry.status}</span>
              {/if}
              <span class="text-text-dark truncate">{shortUrl(entry.url)}</span>
            </div>

            <!-- Console.log výstupy -->
            {#if entry.logs.length > 0}
              <div class="mt-1 pl-4 space-y-0.5">
                {#each entry.logs as log}
                  <div class="text-blue-600 break-all">
                    <span class="text-text-muted/60 select-none">console</span> {log}
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Exceptions -->
            {#if entry.exceptions.length > 0}
              <div class="mt-1 pl-4 space-y-0.5">
                {#each entry.exceptions as ex}
                  <div class="text-red-600 break-all font-bold">{ex}</div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else if status === "connected"}
    <div class="rounded-xl border border-black/6 bg-white py-12 text-center">
      <p class="text-text-muted animate-pulse">Cekam na udalosti...</p>
      <p class="text-xs text-text-muted/60 mt-2">Posli request na {selectedWorker} a uvidis ho tady.</p>
    </div>
  {:else if status === "idle"}
    <div class="text-center py-16 text-text-muted/60">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 mx-auto mb-4 opacity-30"><path d="M13 12h8"/><path d="M13 18h8"/><path d="M13 6h8"/><path d="M3 12h1"/><path d="M3 18h1"/><path d="M3 6h1"/><path d="M8 12h1"/><path d="M8 18h1"/><path d="M8 6h1"/></svg>
      <p>Zadne logy. Klikni na "Spustit tail".</p>
    </div>
  {/if}
</div>

<script lang="ts">
  import { apiFetch } from "../../lib/api"

  let { superadminToken }: { superadminToken: string } = $props()

  type Stats = { programs: number; categories: number; inquiries: number; testimonials: number; settings: number }

  let stats = $state<Stats | null>(null)
  let loading = $state(true)
  let error = $state<string | null>(null)

  const authHeaders = { Authorization: `Bearer ${superadminToken}` }

  const cards = [
    { key: "programs" as const, label: "Programy", color: "bg-blue-500/10 text-blue-400", icon: "M4 6h16M4 12h16M4 18h16" },
    { key: "categories" as const, label: "Kategorie", color: "bg-emerald-500/10 text-emerald-400", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" },
    { key: "inquiries" as const, label: "Poptávky", color: "bg-primary/10 text-primary", icon: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" },
    { key: "testimonials" as const, label: "Reference", color: "bg-purple-500/10 text-purple-400", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { key: "settings" as const, label: "Nastavení", color: "bg-slate-500/10 text-text-muted", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" },
  ]

  async function loadStats() {
    loading = true
    error = null
    try {
      stats = await apiFetch<Stats>("/superadmin/stats", { headers: authHeaders })
    } catch (e) {
      error = e instanceof Error ? e.message : "Chyba"
    } finally {
      loading = false
    }
  }

  $effect(() => { loadStats() })
</script>

<div>
  <div class="mb-8">
    <h1 class="text-2xl font-bold font-heading">Dashboard</h1>
    <p class="text-text-muted text-sm mt-1">Přehled databáze a systému</p>
  </div>

  {#if error}
    <div class="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">{error}</div>
  {/if}

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each cards as card}
      <div class="bg-white rounded-xl border border-black/6 p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center {card.color}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              {@html card.icon}
            </svg>
          </div>
          <div>
            <p class="text-text-muted text-xs font-medium uppercase tracking-wider">{card.label}</p>
            {#if loading}
              <div class="h-7 w-12 bg-black/5 rounded animate-pulse mt-1"></div>
            {:else}
              <p class="text-2xl font-bold">{stats?.[card.key] ?? 0}</p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Rychlé odkazy -->
  <div class="mt-8">
    <h2 class="text-lg font-bold mb-4">Rychlé akce</h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <a href="/superadmin/d1" class="bg-white rounded-xl border border-black/6 p-4 hover:border-primary/30 transition-colors group">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
          </div>
          <div>
            <p class="font-semibold text-sm group-hover:text-primary transition-colors">D1 Konzole</p>
            <p class="text-text-muted/60 text-xs">SQL dotazy přímo na databázi</p>
          </div>
        </div>
      </a>
      <a href="/superadmin/logs" class="bg-white rounded-xl border border-black/6 p-4 hover:border-primary/30 transition-colors group">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M13 12h8"/><path d="M13 18h8"/><path d="M13 6h8"/><path d="M3 12h1"/><path d="M3 18h1"/><path d="M3 6h1"/><path d="M8 12h1"/><path d="M8 18h1"/><path d="M8 6h1"/></svg>
          </div>
          <div>
            <p class="font-semibold text-sm group-hover:text-primary transition-colors">Worker Logy</p>
            <p class="text-text-muted/60 text-xs">Real-time logy z workerů</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</div>

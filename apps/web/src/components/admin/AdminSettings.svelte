<script lang="ts">
  import { apiFetch } from "../../lib/api"

  let { initialSettings, adminToken }: { initialSettings: Record<string, string>; adminToken: string } = $props()

  let settings = $state<Record<string, string>>({ ...initialSettings })
  let saving = $state(false)
  let message = $state<string | null>(null)
  let messageType = $state<"success" | "error">("success")

  const authHeaders = { Authorization: `Bearer ${adminToken}` }

  const groups = [
    {
      title: "Statistiky na homepage",
      description: "Čísla zobrazená v hero sekci hlavní stránky.",
      fields: [
        { key: "stat1_value", label: "Statistika 1 — hodnota", placeholder: "240+" },
        { key: "stat1_label", label: "Statistika 1 — popis", placeholder: "Realizovaných akcí" },
        { key: "stat2_value", label: "Statistika 2 — hodnota", placeholder: "85" },
        { key: "stat2_label", label: "Statistika 2 — popis", placeholder: "Zapojených škol" },
        { key: "stat3_value", label: "Statistika 3 — hodnota", placeholder: "98%" },
        { key: "stat3_label", label: "Statistika 3 — popis", placeholder: "Spokojených ředitelů" },
      ],
    },
    {
      title: "E-mailové notifikace",
      description: "E-maily pro příjem notifikací o nových poptávkách.",
      fields: [
        { key: "notification_emails", label: "Notifikační e-maily", placeholder: "info@beechampshub.cz" },
        { key: "admin_email", label: "Hlavní admin e-mail", placeholder: "info@beechampshub.cz" },
      ],
    },
  ]

  function showMessage(text: string, type: "success" | "error" = "success") {
    message = text; messageType = type
    setTimeout(() => message = null, 3000)
  }

  async function save() {
    saving = true
    try {
      await apiFetch("/admin/settings", {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      showMessage("Nastavení uloženo")
    } catch {
      showMessage("Nepodařilo se uložit", "error")
    } finally { saving = false }
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Page Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-text-dark font-heading leading-tight">Nastavení</h1>
      <p class="text-sm text-text-muted mt-1">Globální nastavení webu a notifikací</p>
    </div>
    <button onclick={save} disabled={saving} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition disabled:opacity-50 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
      {saving ? "Ukládám…" : "Uložit změny"}
    </button>
  </div>

  {#if message}
    <div class="px-4 py-3 rounded-lg text-sm font-medium {messageType === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}">
      {message}
    </div>
  {/if}

  <!-- Settings Cards -->
  <div class="flex flex-col gap-6">
    {#each groups as group}
      <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div class="px-6 py-5 border-b border-black/6">
          <h3 class="text-lg font-semibold text-text-dark">{group.title}</h3>
          <p class="text-sm text-text-muted mt-0.5">{group.description}</p>
        </div>
        <div class="p-6">
          <div class="grid gap-5 sm:grid-cols-2">
            {#each group.fields as field}
              <div class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-text-dark">{field.label}</span>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={settings[field.key] ?? ""}
                  oninput={(e: Event) => settings[field.key] = (e.target as HTMLInputElement).value}
                  class="w-full py-2.5 px-4 text-sm border border-black/8 rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition"
                />
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

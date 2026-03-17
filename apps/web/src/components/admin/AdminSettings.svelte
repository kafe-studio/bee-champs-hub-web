<script lang="ts">
  import { apiFetch } from "../../lib/api"

  let { initialSettings, adminToken }: { initialSettings: Record<string, string>; adminToken: string } = $props()

  let settings = $state<Record<string, string>>({ ...initialSettings })
  let saving = $state(false)
  let message = $state<string | null>(null)
  let messageType = $state<"success" | "error">("success")

  const authHeaders = { Authorization: `Bearer ${adminToken}` }

  // Správa notifikačních příjemců jako pole emailů
  let notificationEmails = $state<string[]>(
    (initialSettings["notification_emails"] ?? "").split(",").map(e => e.trim()).filter(Boolean)
  )
  let newEmail = $state("")
  let emailError = $state("")

  // Synchronizace pole emailů zpět do settings
  $effect(() => {
    settings["notification_emails"] = notificationEmails.join(",")
  })

  function addEmail() {
    const email = newEmail.trim().toLowerCase()
    emailError = ""
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      emailError = "Neplatný formát e-mailu"
      return
    }
    if (notificationEmails.includes(email)) {
      emailError = "Tento e-mail už je v seznamu"
      return
    }
    notificationEmails = [...notificationEmails, email]
    newEmail = ""
  }

  function removeEmail(email: string) {
    notificationEmails = notificationEmails.filter(e => e !== email)
  }

  function handleEmailKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addEmail()
    }
  }

  const statGroups = [
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
      title: "Ostatní",
      description: "Další nastavení webu.",
      fields: [
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

  <!-- Příjemci notifikací -->
  <div class="bg-white rounded-xl border border-black/6 overflow-hidden">
    <div class="px-6 py-5 border-b border-black/6">
      <h3 class="text-lg font-semibold text-text-dark">Příjemci poptávek</h3>
      <p class="text-sm text-text-muted mt-0.5">E-maily, které obdrží notifikaci při každé nové poptávce z formuláře.</p>
    </div>
    <div class="p-6">
      <!-- Seznam emailů -->
      {#if notificationEmails.length > 0}
        <div class="flex flex-wrap gap-2 mb-4">
          {#each notificationEmails as email}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {email}
              <button
                onclick={() => removeEmail(email)}
                class="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition"
                title="Odebrat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </span>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-text-muted mb-4">Zatím žádní příjemci. Přidejte alespoň jeden e-mail.</p>
      {/if}

      <!-- Přidání nového emailu -->
      <div class="flex gap-2 items-start">
        <div class="flex-1">
          <input
            type="email"
            placeholder="novy@email.cz"
            bind:value={newEmail}
            onkeydown={handleEmailKeydown}
            class="w-full py-2.5 px-4 text-sm border rounded-lg bg-white text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:ring-3 transition {emailError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-black/8 focus:border-primary focus:ring-primary/10'}"
          />
          {#if emailError}
            <p class="text-xs text-red-600 mt-1">{emailError}</p>
          {/if}
        </div>
        <button
          onclick={addEmail}
          class="px-4 py-2.5 text-sm font-semibold bg-primary text-bg-primary rounded-lg hover:bg-primary-hover transition shrink-0"
        >
          Přidat
        </button>
      </div>
    </div>
  </div>

  <!-- Settings Cards -->
  <div class="flex flex-col gap-6">
    {#each statGroups as group}
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

<script lang="ts">
  import { t } from "../../i18n"
  import type { usePlanner } from "./plannerState.svelte"
  import { SCHOOL_MONTHS, getCategoryColor } from "./plannerState.svelte"
  import { Modal, Button, Label, Input, Select, Textarea, Helper } from "flowbite-svelte"

  let { planner, onclose }: {
    planner: ReturnType<typeof usePlanner>
    onclose: () => void
  } = $props()

  let isOpen = $state(true)


  let schoolName = $state("")
  let schoolType = $state("")
  let city = $state("")
  let childrenCount = $state("")
  let ageRange = $state("")
  let contactName = $state("")
  let contactPosition = $state("")
  let contactPhone = $state("")
  let contactEmail = $state("")
  let hasGym = $state("")
  let hasPlayground = $state("")
  let notes = $state("")

  let submitting = $state(false)
  let success = $state(false)
  let errorMessage = $state("")

  let touched = $state<Record<string, boolean>>({})

  function markTouched(field: string) {
    touched = { ...touched, [field]: true }
  }

  const requiredFields = $derived({
    schoolName: String(schoolName ?? "").trim().length > 0,
    schoolType: String(schoolType ?? "").trim().length > 0,
    city: String(city ?? "").trim().length > 0,
    childrenCount: String(childrenCount ?? "").trim().length > 0 && Number(childrenCount) > 0,
    ageRange: String(ageRange ?? "").trim().length > 0,
    contactName: String(contactName ?? "").trim().length > 0,
    contactPhone: String(contactPhone ?? "").trim().length > 0,
    contactEmail: String(contactEmail ?? "").trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contactEmail ?? "").trim()),
  })

  const isValid = $derived(Object.values(requiredFields).every(Boolean))

  const selectedProgramsData = $derived.by(() => {
    return planner.assignedPrograms.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      months: planner.getProgramMonths(p.id).map((mi) => SCHOOL_MONTHS[mi].name),
    }))
  })

  const schoolTypeItems = [
    { value: "ms", name: t.inquiry.schoolTypes.ms },
    { value: "zs", name: t.inquiry.schoolTypes.zs },
    { value: "ss", name: t.inquiry.schoolTypes.ss },
    { value: "other", name: t.inquiry.schoolTypes.other },
  ]

  const gymItems = [
    { value: "yes", name: t.inquiry.hasGymOptions.yes },
    { value: "no", name: t.inquiry.hasGymOptions.no },
    { value: "external", name: t.inquiry.hasGymOptions.external },
  ]

  const playgroundItems = [
    { value: "yes", name: t.inquiry.hasPlaygroundOptions.yes },
    { value: "no", name: t.inquiry.hasPlaygroundOptions.no },
  ]

  // Synchronizuj stav z DOM — browser autofill nemusí triggernout bind:value
  function syncFromDom() {
    const get = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? ""
    schoolName = get("schoolName")
    schoolType = get("schoolType")
    city = get("city")
    childrenCount = get("childrenCount")
    ageRange = get("ageRange")
    contactName = get("contactName")
    contactPosition = get("contactPosition")
    contactPhone = get("contactPhone")
    contactEmail = get("contactEmail")
    hasGym = get("hasGym")
    hasPlayground = get("hasPlayground")
    notes = get("notes")
  }

  async function handleSubmit() {
    syncFromDom()
    // Oznac vsechna pole jako touched pro zobrazeni chyb
    if (!isValid) {
      touched = { schoolName: true, schoolType: true, city: true, childrenCount: true, ageRange: true, contactName: true, contactPhone: true, contactEmail: true }
      errorMessage = t.inquiry.required
      return
    }
    if (submitting) return

    submitting = true
    errorMessage = ""

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: String(schoolName ?? "").trim(),
          schoolType: String(schoolType ?? "").trim(),
          city: String(city ?? "").trim(),
          childrenCount: Number(childrenCount) || 0,
          ageRange: String(ageRange ?? "").trim(),
          contactName: String(contactName ?? "").trim(),
          contactPosition: String(contactPosition ?? "").trim() || undefined,
          contactPhone: String(contactPhone ?? "").trim(),
          contactEmail: String(contactEmail ?? "").trim(),
          hasGym: hasGym || undefined,
          hasPlayground: hasPlayground || undefined,
          notes: String(notes ?? "").trim() || undefined,
          selectedPrograms: JSON.stringify(selectedProgramsData),
        }),
      })

      if (response.ok) {
        success = true
        planner.clearAll()
      } else {
        const data = await response.json().catch(() => null)
        errorMessage = data?.detail ?? data?.error ?? t.inquiry.errorGeneral
      }
    } catch {
      errorMessage = t.inquiry.errorGeneral
    } finally {
      submitting = false
    }
  }

  function handleClose() {
    isOpen = false
    onclose()
  }

  function hasError(field: string): boolean {
    return !!touched[field] && !requiredFields[field as keyof typeof requiredFields]
  }
</script>

<Modal form bind:open={isOpen} size="md" outsideclose title={t.inquiry.title} onclose={handleClose}>
  <div class="flex flex-col space-y-4">

    {#if success}
      <div class="flex flex-col items-center justify-center py-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">{t.inquiry.successTitle}</h3>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">{t.inquiry.successMessage}</p>
        <Button color="primary" onclick={handleClose}>{t.inquiry.successClose}</Button>
      </div>
    {:else}
      <!-- Scrollovatelny obsah -->
      <div class="max-h-[60vh] space-y-4 overflow-y-auto overscroll-contain pr-1">
        <!-- Vybrane programy -->
        <div>
          <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.inquiry.selectedPrograms}</p>
          <div class="flex flex-wrap gap-1.5">
            {#each planner.assignedPrograms as program}
              {@const color = getCategoryColor(program.category)}
              {@const months = planner.getProgramMonths(program.id).map((mi) => SCHOOL_MONTHS[mi].shortName)}
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style:background-color="{color}15"
                style:color={color}
              >
                {program.icon} {program.name}
                <span class="opacity-60">({months.join(", ")})</span>
              </span>
            {/each}
          </div>
        </div>

        <!-- Udaje o skole -->
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{t.inquiry.sectionSchool}</h4>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <Label for="schoolName" class="mb-2">{t.inquiry.schoolName} <span class="text-red-500">*</span></Label>
            <Input id="schoolName" name="schoolName" type="text" bind:value={schoolName} onblur={() => markTouched("schoolName")} placeholder={t.inquiry.schoolNamePlaceholder} color={hasError("schoolName") ? "red" : undefined} />
            {#if hasError("schoolName")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="schoolType" class="mb-2">{t.inquiry.schoolType} <span class="text-red-500">*</span></Label>
            <Select id="schoolType" name="schoolType" bind:value={schoolType} onchange={() => markTouched("schoolType")} items={schoolTypeItems} placeholder={t.inquiry.schoolTypePlaceholder} />
            {#if hasError("schoolType")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="city" class="mb-2">{t.inquiry.city} <span class="text-red-500">*</span></Label>
            <Input id="city" name="city" type="text" bind:value={city} onblur={() => markTouched("city")} placeholder={t.inquiry.cityPlaceholder} color={hasError("city") ? "red" : undefined} />
            {#if hasError("city")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="childrenCount" class="mb-2">{t.inquiry.childrenCount} <span class="text-red-500">*</span></Label>
            <Input id="childrenCount" name="childrenCount" type="number" bind:value={childrenCount} onblur={() => markTouched("childrenCount")} placeholder={t.inquiry.childrenCountPlaceholder} color={hasError("childrenCount") ? "red" : undefined} />
            {#if hasError("childrenCount")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="ageRange" class="mb-2">{t.inquiry.ageRange} <span class="text-red-500">*</span></Label>
            <Input id="ageRange" name="ageRange" type="text" bind:value={ageRange} onblur={() => markTouched("ageRange")} placeholder={t.inquiry.ageRangePlaceholder} color={hasError("ageRange") ? "red" : undefined} />
            {#if hasError("ageRange")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
        </div>

        <!-- Kontaktni udaje -->
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{t.inquiry.sectionContact}</h4>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <Label for="contactName" class="mb-2">{t.inquiry.contactName} <span class="text-red-500">*</span></Label>
            <Input id="contactName" name="contactName" type="text" bind:value={contactName} onblur={() => markTouched("contactName")} placeholder={t.inquiry.contactNamePlaceholder} color={hasError("contactName") ? "red" : undefined} />
            {#if hasError("contactName")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="contactPosition" class="mb-2">{t.inquiry.contactPosition}</Label>
            <Input id="contactPosition" name="contactPosition" type="text" bind:value={contactPosition} placeholder={t.inquiry.contactPositionPlaceholder} />
          </div>
          <div>
            <Label for="contactPhone" class="mb-2">{t.inquiry.contactPhone} <span class="text-red-500">*</span></Label>
            <Input id="contactPhone" name="contactPhone" type="tel" bind:value={contactPhone} onblur={() => markTouched("contactPhone")} placeholder={t.inquiry.contactPhonePlaceholder} color={hasError("contactPhone") ? "red" : undefined} />
            {#if hasError("contactPhone")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
          <div>
            <Label for="contactEmail" class="mb-2">{t.inquiry.contactEmail} <span class="text-red-500">*</span></Label>
            <Input id="contactEmail" name="contactEmail" type="email" bind:value={contactEmail} onblur={() => markTouched("contactEmail")} placeholder={t.inquiry.contactEmailPlaceholder} color={hasError("contactEmail") ? "red" : undefined} />
            {#if hasError("contactEmail")}
              <Helper class="mt-1" color="red">{t.inquiry.required}</Helper>
            {/if}
          </div>
        </div>

        <!-- Zazemi skoly -->
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{t.inquiry.sectionFacilities}</h4>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <Label for="hasGym" class="mb-2">{t.inquiry.hasGym}</Label>
            <Select id="hasGym" name="hasGym" bind:value={hasGym} items={gymItems} placeholder="---" />
          </div>
          <div>
            <Label for="hasPlayground" class="mb-2">{t.inquiry.hasPlayground}</Label>
            <Select id="hasPlayground" name="hasPlayground" bind:value={hasPlayground} items={playgroundItems} placeholder="---" />
          </div>
        </div>

        <!-- Poznamky -->
        <div>
          <Label for="notes" class="mb-2">{t.inquiry.sectionNotes}</Label>
          <Textarea id="notes" name="notes" bind:value={notes} placeholder={t.inquiry.notesPlaceholder} rows={3} class="w-full" />
        </div>
      </div>

      <!-- Chybova zprava -->
      {#if errorMessage}
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {errorMessage}
        </div>
      {/if}

      <!-- Paticka - MIMO scrollovatelny div -->
      <div class="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          <span class="text-red-500">*</span> {t.inquiry.required}
        </span>
        <Button color="primary" onclick={handleSubmit} disabled={submitting}>
          {#if submitting}
            <svg class="me-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {t.inquiry.submitting}
          {:else}
            {t.inquiry.submit}
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</Modal>

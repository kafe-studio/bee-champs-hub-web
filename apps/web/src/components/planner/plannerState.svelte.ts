/**
 * Stav ročního plánovače — Svelte 5 runes
 *
 * Komunikace mezi Astro ostrovy přes custom events na window.
 * Persistence přes localStorage.
 */

import type { CategorySlug, Program, Category } from "@bee-champs/shared"
import { API_BASE } from "../../lib/api"
import { t } from "../../i18n"

// === Data z API (nacteni pri inicializaci) ===
// Pouzivame plain JS promennou (ne $state) aby View Transitions neresetovaly stav

let categories = $state<Category[]>([])
let programs = $state<Program[]>([])
let dataLoaded = $state(false)
let loadPromise: Promise<void> | null = null

function loadDataFromAPI() {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      const [catRes, progRes] = await Promise.all([
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/programs`),
      ])
      if (catRes.ok) {
        const catJson = await catRes.json() as { data: Category[] }
        categories = catJson.data
      }
      if (progRes.ok) {
        const progJson = await progRes.json() as { data: Program[] }
        programs = progJson.data
      }
    } catch {
      // Fallback — data zustane prazdna
    }
    dataLoaded = true
  })()
  return loadPromise
}

// === Typy ===

export interface MonthAssignment {
  readonly programId: string
  readonly monthIndex: number
}

export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/** Měsíce školního roku: září (9) až srpen (8) */
const monthKeys = [
  "september", "october", "november", "december",
  "january", "february", "march", "april",
  "may", "june", "july", "august",
] as const

export const SCHOOL_MONTHS = monthKeys.map((key, i) => ({
  index: i as MonthIndex,
  calendarMonth: i < 4 ? i + 9 : i - 3,
  name: t.planner.months[key],
  shortName: t.planner.monthsShort[key],
}))

// === Pomocné funkce ===

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id)
}

export function getCategoryColor(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.color ?? "#F5A623"
}

// === Persistence (localStorage) ===

const STORAGE_KEY = "bee-champs-planner"

function loadAssignments(): MonthAssignment[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (a: unknown): a is MonthAssignment =>
        typeof a === "object" && a !== null &&
        "programId" in a && "monthIndex" in a &&
        typeof (a as MonthAssignment).programId === "string" &&
        typeof (a as MonthAssignment).monthIndex === "number"
    )
  } catch {
    return []
  }
}

function saveAssignments(data: MonthAssignment[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage plný nebo nedostupný
  }
}

// === Custom events pro komunikaci mezi Astro ostrovy ===

const OPEN_MODAL_EVENT = "bee-champs:open-modal"
const STATE_CHANGED_EVENT = "bee-champs:state-changed"

/** Vyšle event na otevření modálu (pro cross-island komunikaci) */
export function emitOpenModal(programId: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: { programId } }))
}

/** Vyšle event o změně stavu (pro badge aktualizaci) */
function emitStateChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(STATE_CHANGED_EVENT))
}

// === Reaktivní stav ===

// Přiřazení programů k měsícům (jediný zdroj pravdy, persistované)
let assignments = $state<MonthAssignment[]>(loadAssignments())

// Filtrace
let searchQuery = $state("")
let activeCategory = $state<CategorySlug | "all">("all")

// Modál
let modalOpen = $state(false)
let modalProgramId = $state<string | null>(null)

// === Derived hodnoty ===

const filteredPrograms = $derived.by(() => {
  let filtered = programs.slice()

  if (activeCategory !== "all") {
    filtered = filtered.filter((p) => p.category === activeCategory)
  }

  if (String(searchQuery ?? "").trim()) {
    const query = String(searchQuery ?? "").trim().toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

/** Programy s alespoň jedním přiřazením */
const assignedPrograms = $derived(
  programs.filter((p) => assignments.some((a) => a.programId === p.id))
)

const assignedProgramCount = $derived(assignedPrograms.length)
const totalAssignments = $derived(assignments.length)

/** Programy přiřazené k danému měsíci */
function getMonthPrograms(monthIndex: MonthIndex): Program[] {
  const ids = assignments
    .filter((a) => a.monthIndex === monthIndex)
    .map((a) => a.programId)
  return ids.map((id) => getProgramById(id)).filter((p): p is Program => p !== undefined)
}

/** Měsíce přiřazené danému programu */
function getProgramMonths(programId: string): MonthIndex[] {
  return assignments.filter((a) => a.programId === programId).map((a) => a.monthIndex as MonthIndex)
}

/** Má program alespoň jedno přiřazení? */
function isProgramAssigned(programId: string): boolean {
  return assignments.some((a) => a.programId === programId)
}

// === Akce ===

function persistAndNotify() {
  saveAssignments(assignments)
  emitStateChanged()
}

function assignProgramToMonth(programId: string, monthIndex: MonthIndex) {
  const exists = assignments.some(
    (a) => a.programId === programId && a.monthIndex === monthIndex
  )
  if (!exists) {
    assignments = [...assignments, { programId, monthIndex }]
    persistAndNotify()
  }
}

function removeProgramFromMonth(programId: string, monthIndex: MonthIndex) {
  assignments = assignments.filter(
    (a) => !(a.programId === programId && a.monthIndex === monthIndex)
  )
  persistAndNotify()
}

function toggleMonthForProgram(programId: string, monthIndex: MonthIndex) {
  const exists = assignments.some(
    (a) => a.programId === programId && a.monthIndex === monthIndex
  )
  if (exists) {
    removeProgramFromMonth(programId, monthIndex)
  } else {
    assignProgramToMonth(programId, monthIndex)
  }
}

function removeProgram(programId: string) {
  assignments = assignments.filter((a) => a.programId !== programId)
  persistAndNotify()
}

function clearAll() {
  assignments = []
  persistAndNotify()
}

function openModal(programId: string) {
  modalProgramId = programId
  modalOpen = true
}

function closeModal() {
  modalOpen = false
}

function setSearchQuery(query: string) {
  searchQuery = String(query ?? "")
}

function setActiveCategory(category: CategorySlug | "all") {
  activeCategory = category
}

/** Znovu načte stav z localStorage (pro synchronizaci mezi ostrovy) */
function reloadFromStorage() {
  assignments = loadAssignments()
}

// === Export ===

export function usePlanner() {
  // Nacti data z API pri prvnim pouziti
  $effect(() => {
    if (!dataLoaded) {
      loadDataFromAPI()
    }
  })

  // Poslouchej custom events (pro cross-island komunikaci)
  $effect(() => {
    function handleOpenModal(e: Event) {
      const detail = (e as CustomEvent).detail
      if (detail?.programId) {
        openModal(detail.programId)
      }
    }

    function handleStateChanged() {
      reloadFromStorage()
    }

    window.addEventListener(OPEN_MODAL_EVENT, handleOpenModal)
    window.addEventListener(STATE_CHANGED_EVENT, handleStateChanged)

    return () => {
      window.removeEventListener(OPEN_MODAL_EVENT, handleOpenModal)
      window.removeEventListener(STATE_CHANGED_EVENT, handleStateChanged)
    }
  })

  return {
    // Stav
    get assignments() { return assignments },
    get searchQuery() { return searchQuery },
    get activeCategory() { return activeCategory },
    get modalOpen() { return modalOpen },
    get modalProgramId() { return modalProgramId },
    get dataLoaded() { return dataLoaded },
    get categories() { return categories },
    get programs() { return programs },

    // Derived
    get filteredPrograms() { return filteredPrograms },
    get assignedPrograms() { return assignedPrograms },
    get assignedProgramCount() { return assignedProgramCount },
    get totalAssignments() { return totalAssignments },

    // Pomocné
    getMonthPrograms,
    getProgramMonths,
    isProgramAssigned,

    // Akce
    assignProgramToMonth,
    removeProgramFromMonth,
    toggleMonthForProgram,
    removeProgram,
    clearAll,
    openModal,
    closeModal,
    setSearchQuery,
    setActiveCategory,
    reloadFromStorage,
  }
}

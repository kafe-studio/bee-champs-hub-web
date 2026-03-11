export type CategorySlug = "sport" | "vzdelavani" | "projektove-dny" | "akce"

export interface Category {
  readonly slug: CategorySlug
  readonly name: string
  readonly label: string
  readonly icon: string
  readonly color: string
  readonly description: string
}

export const categories: readonly Category[] = [
  {
    slug: "sport",
    name: "Sportovní programy",
    label: "SPORT",
    icon: "🏃",
    color: "#F5A623",
    description: "Pohybové programy pro všechny věkové kategorie — od lyžování až po atletiku.",
  },
  {
    slug: "vzdelavani",
    name: "Vzdělávací programy",
    label: "VZDĚLÁVÁNÍ",
    icon: "🧠",
    color: "#2ECC71",
    description: "Interaktivní workshopy a lekce — první pomoc, emoční inteligence, prevence.",
  },
  {
    slug: "projektove-dny",
    name: "Projektové dny",
    label: "PROJEKTOVÉ DNY",
    icon: "📅",
    color: "#3498DB",
    description: "Celodenní tematické akce pro celou školu — olympiády, den zdraví, týmové dny.",
  },
  {
    slug: "akce",
    name: "Akce a pobyty",
    label: "AKCE A POBYTY",
    icon: "🏕",
    color: "#E74C3C",
    description: "Vícedenní akce a pobyty — lyžáky, vodáky, škola v přírodě, tábory.",
  },
] as const

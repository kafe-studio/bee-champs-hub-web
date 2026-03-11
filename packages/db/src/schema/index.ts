import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// Tabulka poptavek
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Skola
  schoolName: text("school_name").notNull(),
  schoolType: text("school_type").notNull(),
  city: text("city").notNull(),
  childrenCount: integer("children_count").notNull(),
  ageRange: text("age_range").notNull(),

  // Kontakt
  contactName: text("contact_name").notNull(),
  contactPosition: text("contact_position"),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),

  // Doplnujici info
  hasGym: text("has_gym"),
  hasPlayground: text("has_playground"),
  notes: text("notes"),

  // Vybrane programy (JSON pole s mesici)
  selectedPrograms: text("selected_programs").notNull(),

  // Meta
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// Tabulka kategorii
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
})

// Tabulka programu
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  categorySlug: text("category_slug").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  ageRange: text("age_range").notNull(),
  duration: text("duration").notNull(),
  instructors: text("instructors").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
})

// Tabulka referenci
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
})

// Tabulka nastaveni (key-value)
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
})

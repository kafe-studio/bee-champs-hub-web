// API helper pro klientske volani (Svelte komponenty)
// API endpointy jsou ted soucasti stejneho workeru pod /api/
export const API_BASE = "/api"

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((error as { error: string }).error ?? "Chyba pozadavku")
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

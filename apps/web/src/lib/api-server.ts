// API helper pro serverove volani (Astro SSR)
// API endpointy jsou soucasti stejneho workeru — potrebujeme absolutni URL
// Origin ziskame z Astro.url nebo z request headeru
export async function apiFetchSSR<T>(path: string, cookie?: string | null, origin?: string): Promise<T> {
  const base = origin ?? "http://localhost:4321"
  const res = await fetch(`${base}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((error as { error: string }).error ?? "Chyba pozadavku")
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

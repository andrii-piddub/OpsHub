export type HealthResponse = {
  status: string
  service: string
}

export async function getHealth(
  signal: AbortSignal,
): Promise<HealthResponse> {
  const response = await fetch('/api/v1/health/', {
    signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Помилка сервера: ${response.status}`)
  }

  return response.json()
}
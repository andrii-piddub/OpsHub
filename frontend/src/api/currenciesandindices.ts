import { ApiErrors } from "./ApiError"

export async function usdCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  return (await response.json())
}


export async function eurCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=EUR')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  return (await response.json())
}


export async function crossCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://api.frankfurter.dev/v2/rate/eur/usd')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  return (await response.json())
}

export async function SEIndexes(symbol:string,signal: AbortSignal) {
  const url = new URL('/api/v1/market/indexes/', window.location.origin)
  const params = new URLSearchParams(url.search)
    if (symbol) {
    params.append('name', symbol)
  }
  url.search = params.toString()
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  return (response.json())
}
import { ApiErrors } from "./ApiError"

export async function usdCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  const data = await response.json()
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(`Request failed: response is empty or too long`)
  }
  if (
    typeof data[0]['rate'] !== 'number' || !Number.isFinite(data[0]['rate'])
  ) {
    throw new Error('Request failed: rate is not Finite number')
  }
  return (data)
}


export async function eurCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=EUR')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  const data = await response.json()
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(`Request failed: response is empty or too long`)
  }
  if (
    typeof data[0]['rate'] !== 'number' || !Number.isFinite(data[0]['rate'])
  ) {
    throw new Error('Request failed: rate is not Finite number')
  }
  return (data)
}

export async function crossCurrenciesRate(signal: AbortSignal) {
  const url = new URL('https://api.frankfurter.dev/v2/rate/eur/usd')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ApiErrors(`Request failed: ${response.status}`, response.status)
  }
  const data = await response.json()
  if (
    typeof data['rate'] !== 'number' || !Number.isFinite(data['rate'])
  ) {
    throw new Error('Request failed: rate is not Finite number')
  }
  return (data)
}

export async function SEIndexes(symbol: string, signal: AbortSignal) {
  const url = new URL('/api/v1/market/indexes/', window.location.origin)
  const params = new URLSearchParams(url.search)
  if (symbol) {
    params.append('name', symbol)
  }
  url.search = params.toString()
  const response = await fetch(url, { signal })
  if (!response.ok) {
    const  data= await response.json()
    throw new ApiErrors(`Request failed: ${data["error_message"]}`, response.status)
  }
  let data = await response.json()
  if (data !== null){
    data = Number(data)
  }
  if (
    typeof data !== 'number' || !Number.isFinite(data)
  ) {
    throw new Error('Request failed: rate is not Finite number')
  }
  return (data)
}
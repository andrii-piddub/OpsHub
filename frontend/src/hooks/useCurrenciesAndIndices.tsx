import { useEffect, useState } from 'react'
import { usdCurrenciesRate, eurCurrenciesRate, crossCurrenciesRate, SEIndexes } from '../api/currenciesandindices'
import dayjs from 'dayjs'
import { ApiErrors } from '../api/ApiError'
export function useCurrenciesandIndices(
    handleErrors: (error: unknown, signal?: AbortSignal) => Promise<void>,
) {
    const [usdRate, setUsdRate] = useState<number | null>(null)
    const [usdError, setUsdError] = useState('')
    const [eurRate, setEurRate] = useState<number | null>(null)
    const [eurError, setEurError] = useState('')
    const [crossRate, setCrossRate] = useState<number | null>(null)
    const [crossError, setCrossError] = useState('')
    const [SP500Rate, setSP500Rate] = useState<string | null | number>(null)
    const [SP500Error, setSP500Error] = useState('')
    const [nasdaqRate, setNasdaqRate] = useState<string | null | number>(null)
    const [nasdaqError, setNasdaqError] = useState('')
    const [DJIARate, setDJIARate] = useState<string | null | number>(null)
    const [DJIAError, setDJIAError] = useState('')
    const [updatedTime, setUpdatedTime] = useState<string | null | number>('')
    const [refresh, setRefresh] = useState(true)
    const [error, setError] = useState('')
    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller


        async function loadUsdRate() {
            let dataUpdated = 0
            try {
                setError('')
                const [usdData, eurData, crossData, SP500Data, nasdaqData, DJIAData] = await Promise.allSettled([usdCurrenciesRate(signal), eurCurrenciesRate(signal), crossCurrenciesRate(signal), SEIndexes('SP500', signal), SEIndexes('NASDAQCOM', signal), SEIndexes('DJIA', signal)])
                if (signal.aborted) return
                if (usdData.status === 'rejected') {
                    setUsdError(usdData.reason instanceof Error ? usdData.reason.message : 'Не вдалося завантажити USD/UAH')
                    setUpdatedTime('-')
                } else if (usdData.status === 'fulfilled') {
                    setUsdRate(usdData.value[0]?.rate)
                    setUsdError("")
                    dataUpdated++
                }
                if (eurData.status === 'rejected') {
                    setEurError(eurData.reason instanceof Error ? eurData.reason.message : 'Не вдалося завантажити EUR/UAH')
                    setUpdatedTime('-')
                } else if (eurData.status === 'fulfilled') {
                    setEurRate(eurData.value[0]?.rate)
                    setEurError("")
                    dataUpdated++
                }
                if (crossData.status === 'rejected') {
                    setCrossError(crossData.reason instanceof Error ? crossData.reason.message : 'Не вдалося завантажити EUR/USD')
                    setUpdatedTime('-')
                } else if (crossData.status === 'fulfilled') {
                    setCrossRate(crossData.value?.rate)
                    dataUpdated++
                }
                if (SP500Data.status === 'rejected') {
                    setSP500Error(SP500Data.reason instanceof Error ? SP500Data.reason.message : 'Не вдалося завантажити S&P500')
                    setUpdatedTime('-')
                } else if (SP500Data.status === 'fulfilled') {
                    setSP500Rate(SP500Data.value)
                    setSP500Error("")
                    dataUpdated++
                }
                if (nasdaqData.status === 'rejected') {
                    setNasdaqError(nasdaqData.reason instanceof Error ? nasdaqData.reason.message : 'Не вдалося завантажити NASDAQ')
                    setUpdatedTime('-')
                } else if (nasdaqData.status === 'fulfilled') {
                    setNasdaqRate(nasdaqData.value)
                    setNasdaqError("")
                    dataUpdated++
                }
                if (DJIAData.status === 'rejected') {
                    setDJIAError(DJIAData.reason instanceof Error ? DJIAData.reason.message : 'Не вдалося завантажити Dow Jones Average')
                    setUpdatedTime('-')
                } else if (DJIAData.status === 'fulfilled') {
                    setDJIARate(DJIAData.value)
                    setDJIAError("")
                    dataUpdated++
                }
                if (dataUpdated === 6) {
                    setUpdatedTime(dayjs().format('D MMMM HH:mm'))
                }
            } catch (error) {
                await handleErrors(error)
                setError(error instanceof ApiErrors ? error.message : 'Failed to get value')
                
            }
        }

        void loadUsdRate()
        return () => controller.abort()
    }, [handleErrors, setUpdatedTime, refresh])

    return {
        usdRate, usdError, eurRate, eurError, crossRate, crossError,
        SP500Rate, SP500Error, nasdaqRate, nasdaqError, DJIARate, DJIAError, updatedTime, setRefresh, refresh, error
    }
}

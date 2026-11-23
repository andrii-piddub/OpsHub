import { useEffect, useState } from 'react'
import { usdCurrenciesRate, eurCurrenciesRate, crossCurrenciesRate, SEIndexes } from '../api/currenciesandindices'
import dayjs from 'dayjs'
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
    const [nasdaqRate, setNasdaqRate]= useState<string | null>(null)
    const [nasdaqError, setNasdaqError] = useState('')
    const [DJIARate, setDJIARate] = useState<string | null>(null)
    const [DJIAError, setDJIAError] = useState('')
    const [updatedTime, setUpdatedTime]= useState<string | null | number>('')
    const [refresh, setRefresh] = useState(true)
    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller

        
        async function loadUsdRate() {
            let dataUpdated = 0
            try {
                const usdData: { rate?: unknown }[] = await usdCurrenciesRate(signal)
                const usdRate = usdData[0]?.rate

                if (!signal.aborted) {
                    setUsdRate(typeof usdRate === 'number' && Number.isFinite(usdRate) ? usdRate : null)
                    dataUpdated++

                }

            } catch (error) {
                if (!signal.aborted) {
                    setUsdError(error instanceof Error ? error.message : 'Не вдалося завантажити USD/UAH')
                    await handleErrors(error, signal)
                }
            }
            try {
                const eurData: { rate?: unknown }[] = await eurCurrenciesRate(signal)
                const eurRate = eurData[0]?.rate
                if (!signal.aborted) {
                    setEurRate(typeof eurRate === 'number' && Number.isFinite(eurRate) ? eurRate : null)
                    dataUpdated++

                }

            } catch (error) {
                if (!signal.aborted) {
                    setEurError(error instanceof Error ? error.message : 'Не вдалося завантажити EUR/UAH')
                    await handleErrors(error, signal)
                }
            }
            try {
                const crossData = await crossCurrenciesRate(signal)
                const crossRate = crossData?.rate
                if (!signal.aborted) {
                    setCrossRate(typeof crossRate === 'number' ? crossRate : null)
                    dataUpdated++

                }

            } catch (error) {
                if (!signal.aborted) {
                    setCrossError(error instanceof Error ? error.message : 'Не вдалося завантажити EUR/USD')
                    await handleErrors(error, signal)
                }
            }
            try {
                const SP500Data = await SEIndexes('SP500', signal)
                if (!signal.aborted) {
                    setSP500Rate(SP500Data)
                    dataUpdated++


                }
            } catch (error) {
                if (!signal.aborted) {
                    setSP500Error(error instanceof Error ? error.message : 'Не вдалося завантажити S&P500')
                    await handleErrors(error, signal)
                }
            }
            try {
                const nasdaqData = await SEIndexes('NASDAQCOM', signal)
                if (!signal.aborted) {
                    setNasdaqRate(nasdaqData)
                    dataUpdated++


                }
            } catch (error) {
                if (!signal.aborted) {
                    setNasdaqError(error instanceof Error ? error.message : 'Не вдалося завантажити NASDAQCOM')
                    await handleErrors(error, signal)
                }
            }
             try {
                const DJIAData = await SEIndexes('DJIA', signal)
                if (!signal.aborted) {
                    setDJIARate(DJIAData)
                    dataUpdated++


                }
            } catch (error) {
                if (!signal.aborted) {
                    setDJIAError(error instanceof Error ? error.message : 'Не вдалося завантажити DJIA')
                    await handleErrors(error, signal)
                }
            }
            if (dataUpdated === 6){
               setUpdatedTime(dayjs().format('D MMMM HH:mm')) 

            }


        }

        void loadUsdRate()
        return () => controller.abort()
    }, [handleErrors,setUpdatedTime, refresh])

    return {
        usdRate, usdError, eurRate, eurError, crossRate, crossError, 
        SP500Rate, SP500Error, nasdaqRate, nasdaqError, DJIARate, DJIAError, updatedTime, setRefresh, refresh
    }
}

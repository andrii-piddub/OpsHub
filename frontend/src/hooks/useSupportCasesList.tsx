import { getSupportCases } from '../api/supportcases'
import { useEffect, useState } from 'react';
import type {SupportCases} from '../api/supportcases'
import type {SupportCasesPar} from '../pages/SupportCasesPage'
import { acumaticaConnect } from '../api/acumaticaEmployee'

export function useSupportCasesList(props:SupportCasesPar) {
    const [casses,setCasses] = useState<SupportCases[]>([])
    const [casesLoading, setCasesLoading]= useState(false)
    const [casesErrors, setCasesErrors] = useState('')
    const [refresh,setRefresh] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        async function checkSupportCasses() {
            setCasesLoading(true);
            setCasesErrors('');
            setCasses([]);
            try {
                const data = await getSupportCases(controller.signal)
                setCasses(data.cases)

            } catch (error) {
                if (controller.signal.aborted) return
                await props.handleErrors(error, controller.signal)
                if (controller.signal.aborted) return
                setCasesErrors(
                    error instanceof Error ? error.message : 'Failed to load message',
                )
            } finally {
                if (!controller.signal.aborted) {
                    setCasesLoading(false)
                }
            }
        }
        checkSupportCasses()
        return (() => {
            controller.abort()
        })
    }, [refresh])

    return {setRefresh, casses, casesLoading, casesErrors, acumaticaConnect}
}

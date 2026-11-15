import { useState } from "react"
import { logout } from '../api/auth'
import type { User } from "../api/auth"

export function useAppLayout(setUser:(value:User | null)=>void) {
    const [error, setError] = useState('')
    const [logouting, setLogouting] = useState(false)
    async function logoutRequest() {
        setError('')
        try {
            setLogouting(true)
            await logout()
            setUser(null)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Did not receive an answer',
            )

        } finally {
            setLogouting(false)
        }
    }
return {logoutRequest, logouting,error}
}


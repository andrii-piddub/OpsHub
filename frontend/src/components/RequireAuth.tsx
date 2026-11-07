
import { Navigate, Outlet } from "react-router"
import type {User} from "../api/auth"
type RequireAuthProps={
    authLoading:boolean,
    user:User | null
}
export function RequireAuth(props: RequireAuthProps){
    if (props.authLoading) return <p>Loading...</p>
    if (!props.user){return <Navigate to='/login' />}
    return <Outlet />
}



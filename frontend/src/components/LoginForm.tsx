import { login, getCsrf, authMe } from '../api/auth'
import {  useState } from 'react'
import type { FormEvent } from 'react'
import type {User} from '../api/auth.ts'

type LoginFormProps={
    getUser:(user: User) => void;
    setCreateAccount:(value:boolean)=>void;

}

function LoginForm(props:LoginFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [requesting, setRequesting] = useState(false)
    const [error, setError] = useState('')
    async function loginRequest(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        try {
            setRequesting(true)
            await getCsrf();
            await login(username, password);
            const response = await authMe();
            props.getUser(response)
          
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Did not receive an answer',
            )
        } finally {
            setRequesting(false)
        }


    }

    return (<section className="auth-card login-card" aria-labelledby="login-heading">
        <form
            onSubmit={loginRequest}
        >
            <p className="auth-brand">OpsHub</p>
            <h1 id="login-heading">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your workspace.</p>
            <div className="auth-fields">

                <label
                    htmlFor="username"
                >Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value)
                    }}
                    autoComplete="username"
                    placeholder="Enter your username"
                />
                <label
                    htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value)
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                />
                <button className="auth-submit" type="submit" disabled={requesting}>Sign in</button>
                {requesting && <p className="login-status" role="status">Signing in…</p>}
                {error && <p className="login-error" role="alert">Error: {error}</p>}
            </div>
            <div className="login-footer">
                <p>Don't have an account?</p>
                <button
                className="login-register"
                type="button"
                onClick={()=>{
                    props.setCreateAccount(true)
                }}
                >
                    Create account
                </button>
            </div>
        </form>
    </section>)
}

export default LoginForm

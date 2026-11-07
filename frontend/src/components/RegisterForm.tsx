import { register, getCsrf } from '../api/auth'
import { useState } from 'react'
import type { FormEvent } from 'react'


type RegisterFormProps = {
    setCreateAccount: (value: boolean) => void;

}

function RegisterForm(props: RegisterFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [requesting, setRequesting] = useState(false)
    const [error, setError] = useState('')
    const [usernameError, setUsernameError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    async function RegisterRequest(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setUsernameError("")
        setPasswordError("")
        try {
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }
            setRequesting(true)
            await getCsrf();
            await register(username, password);
            props.setCreateAccount(false)


        } catch (error) {
            const data = (error as { data?: Record<string, string[]> }).data
            setUsernameError(data?.username?.[0] ?? '')
            setPasswordError(data?.password?.[0] ?? '')
            setError(error instanceof Error ? error.message : '')
        } finally {
            setRequesting(false)

        }
    }


    return (<div className="auth-screen">
        <section className="auth-card register-card" aria-labelledby="register-heading">
            <form
                onSubmit={RegisterRequest}
            >
                <p className="auth-brand">OpsHub</p>
                <h1 id="register-heading">Create account</h1>
                <p className="auth-subtitle">Get started with your OpsHub workspace.</p>
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
                        autoComplete="new-password"
                        placeholder="Create a password"
                    />
                    <label
                        htmlFor="confirmPassword">Confirm password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value)
                        }}
                        autoComplete="new-password"
                        placeholder="Enter your password again"
                    />
                    <button className="auth-submit" type="submit" disabled={requesting}>Create account</button>
                    {requesting && <p className="register-status" role="status">Creating your account…</p>}
                    {error && <p className="register-error" role="alert">Error: {error}</p>}
                    {usernameError && <p role="alert">{usernameError}</p>}
                    {passwordError && <p role="alert">{passwordError}</p>}

                </div>
                <div className="register-footer">
                    <p>Already have an account?</p>
                    <button
                        className="register-back"
                        type="button"
                        onClick={() => {
                            props.setCreateAccount(false)
                        }}
                    >
                        Back to login
                    </button>
                </div>
            </form>
        </section>

    </div>)
}
export default RegisterForm

export type User = {id:number, username:string}

export async function getCsrf(): Promise<void> {
    let url = new URL('/api/v1/auth/csrf/', window.location.origin)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
}

export function getCsrfToken(): string | undefined {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1]
}

export async function login(username: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() ?? '',

        },

        body: JSON.stringify({ username: username, password: password })
    })
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
}

export async function authMe(): Promise<User> {
    const response = await fetch('/api/v1/auth/me/', {
          credentials: 'same-origin'
    })
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
    return (await response.json() as User)
}


export type User = { id: number, username: string, acumatica_employee_name :string, acumatica_employee_id:string }

export async function getCsrf(): Promise<void> {
    const url = new URL('/api/v1/auth/csrf/', window.location.origin)
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
        throw {status:response.status}
    }
    return (await response.json() as User)
}


export async function logout(): Promise<void> {
    const response = await fetch('/api/v1/auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() ?? '',
        }
    })
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
}

export async function register(username: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() ?? '',

        },
        body: JSON.stringify({ username: username, password: password })
    })
    if (!response.ok) {
        const data = await response.json()
        throw {status:response.status,data}
    }
}

export async function employee_acumatica_update(displayName:string, employee_id:string){
    const response = await fetch(
       `/api/v1/auth/me/acumatica/`,
       {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'X-CSRFToken': getCsrfToken()?? ''
         },
         body: JSON.stringify({ acumatica_employee_name: displayName, acumatica_employee_id:employee_id  }),
       })
 if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }
} 

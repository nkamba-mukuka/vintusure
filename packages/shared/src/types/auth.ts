export interface User {
    uid: string
    email: string | null
    displayName: string | null
    role: 'admin' | 'agent' | 'staff'
}

export interface AuthError {
    code: string
    message: string
} 
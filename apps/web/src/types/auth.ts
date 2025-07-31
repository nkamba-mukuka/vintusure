import { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'agent' | 'customer'

export interface UserProfile {
    uid: string
    email: string | null
    displayName: string | null
    role: UserRole
    createdAt: Timestamp
    lastLogin: Timestamp
    phoneNumber?: string | null
    photoURL?: string | null
}

export interface AuthError {
    code: string
    message: string
} 
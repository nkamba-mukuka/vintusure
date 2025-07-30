import { User } from 'firebase/auth';

export type UserRole = 'admin' | 'agent';

export interface UserProfile {
    uid: string;
    email: string | null;
    role: UserRole;
    displayName: string | null;
    createdAt: Date;
    lastLogin: Date;
}

export interface AuthUser extends User {
    role?: UserRole;
}

export interface AuthContextType {
    user: AuthUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
} 
import { User as FirebaseUser } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'agent' | 'customer'

export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
  insuranceCompany?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  profileCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
  insuranceCompany?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  profileCompleted?: boolean;
}

export interface AuthError {
    code: string
    message: string
} 

export type UserRole = 'accountant' | 'auditor' | 'admin';

export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

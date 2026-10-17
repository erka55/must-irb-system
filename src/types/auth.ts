// Хэрэглэгчийн 6 үндсэн роль
export type UserRole = 
  | 'GUEST'
  | 'RESEARCHER'
  | 'REVIEWER'
  | 'SECRETARY'
  | 'CHAIR'
  | 'SYSADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

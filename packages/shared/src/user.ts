export interface User {
  id: string;
  displayName: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

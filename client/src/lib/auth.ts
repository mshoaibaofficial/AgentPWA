export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
}

export class AuthService {
  private static readonly USER_KEY = 'care_manager_user';
  
  static getCurrentUser(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) return null;
      
      const user = JSON.parse(userJson);
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt);
      return user;
    } catch {
      return null;
    }
  }
  
  static setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }
  
  static logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
  
  static getUserInitials(user: AuthUser): string {
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

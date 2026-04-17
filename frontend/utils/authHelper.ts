// Authentication helper utilities

export const authHelper = {
  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Set token in localStorage
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  // Get user from localStorage
  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set user in localStorage
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  // Check if token is valid (basic check)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Logout and redirect
  logout(): void {
    this.clearAuth();
    window.location.href = '/login';
  }
};

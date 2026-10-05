const TOKEN_KEY = 'woo-companion:token';

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Navegación privada sin storage: la sesión durará lo que dure la pestaña
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Igual que en set()
    }
  },
};

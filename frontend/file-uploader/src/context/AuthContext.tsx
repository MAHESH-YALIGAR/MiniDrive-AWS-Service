import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage when app loads
  useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('user');

    if (savedLogin === 'true' && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUser(userData);
        console.log('✅ User restored from localStorage:', userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);

    // Save to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('✅ User logged in:', userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);

    // Remove from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    console.log('✅ User logged out');
  };

  // Show nothing while checking localStorage
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
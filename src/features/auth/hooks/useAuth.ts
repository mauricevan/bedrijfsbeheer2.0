/**
 * useAuth Hook
 * Authentication business logic
 */

import { useState, useCallback } from 'react';
import type { User } from '../../../types';

export const useAuth = (users: User[]) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>('');

  const login = useCallback(
    (email: string, password: string): boolean => {
      setLoginError('');

      // Validation
      if (!email || !password) {
        setLoginError('Email en wachtwoord zijn verplicht');
        return false;
      }

      // Find user
      const user = users.find((u) => u.email === email);

      if (!user) {
        setLoginError('Gebruiker niet gevonden');
        return false;
      }

      // Check password (in production: bcrypt.compare)
      if (user.password !== password) {
        setLoginError('Onjuist wachtwoord');
        return false;
      }

      // Success - set current user
      setCurrentUser(user);

      // Store in localStorage for session persistence
      localStorage.setItem('currentUser', JSON.stringify(user));

      return true;
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setLoginError('');
    localStorage.removeItem('currentUser');
  }, []);

  // Check localStorage on mount
  const checkStoredSession = useCallback(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  return {
    currentUser,
    loginError,
    login,
    logout,
    checkStoredSession,
  };
};

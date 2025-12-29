import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    // Check if already logged in from sessionStorage
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdminMode(true);
    }

    // Listen for Cmd+Shift+Period (or Ctrl+Shift+Period on Windows)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '.') {
        e.preventDefault();
        setShowPasswordModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const login = (password: string): boolean => {
    if (password === 'Crescent1!') {
      setIsAdminMode(true);
      sessionStorage.setItem('isAdmin', 'true');
      setShowPasswordModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminMode(false);
    sessionStorage.removeItem('isAdmin');
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminMode,
        showPasswordModal,
        setShowPasswordModal,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

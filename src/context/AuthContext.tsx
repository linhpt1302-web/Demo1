import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  userRole: 'guest' | 'admin';
  isLoginModalOpen: boolean;
  loginError: string | null;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('pickle_friends_is_admin') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('pickle_friends_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const openLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError(null);
  };

  const loginAdmin = (password: string): boolean => {
    const correctPassword = '01082026';
    if (password.trim() === correctPassword) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setLoginError(null);
      return true;
    } else {
      setLoginError('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại!');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        userRole: isAdmin ? 'admin' : 'guest',
        isLoginModalOpen,
        loginError,
        openLoginModal,
        closeLoginModal,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

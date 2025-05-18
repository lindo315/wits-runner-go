
import React, { createContext, useState, useContext, useEffect } from "react";

// Types for our runner user
export interface RunnerUser {
  id: string;
  email: string;
  role: "runner";
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  student_number: string;
  verification_status: "verified";
  created_at: string;
  updated_at: string;
}

// Interface for the auth context
interface AuthContextType {
  currentUser: RunnerUser | null;
  isLoading: boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<RunnerUser | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [currentUser, setCurrentUser] = useState<RunnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock login function - in a real app, this would connect to Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulating an API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is a mock user - in a real app, you would validate credentials with Supabase
    const mockUser: RunnerUser = {
      id: "1",
      email,
      role: "runner",
      first_name: "John",
      last_name: "Doe",
      full_name: "John Doe",
      phone_number: "0123456789",
      student_number: "1234567",
      verification_status: "verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save user to localStorage for persistence
    localStorage.setItem("runner_user", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    setIsLoading(false);
  };
  
  // Logout function
  const logout = async () => {
    localStorage.removeItem("runner_user");
    setCurrentUser(null);
    return Promise.resolve();
  };
  
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("runner_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  
  // Create context value
  const value = {
    currentUser,
    setCurrentUser,
    isLoading,
    login,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

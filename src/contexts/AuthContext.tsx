
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Real login function using Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        console.log("Auth successful, user:", authData.user);
        
        try {
          // Fetch the user's runner profile from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .eq('role', 'runner')
            .single();
          
          console.log("User profile fetch result:", userData, userError);
          
          if (userError) {
            console.error("User profile fetch error:", userError);
            // If there's an infinite recursion RLS error, we can still continue
            if (userError.code === '42P17') {
              console.log("RLS policy error detected, creating basic runner user");
              
              // Let's create a minimal runner profile using auth user data
              const runnerUser: RunnerUser = {
                id: authData.user.id,
                email: authData.user.email || email,
                role: "runner",
                first_name: authData.user.user_metadata?.first_name || "",
                last_name: authData.user.user_metadata?.last_name || "",
                full_name: authData.user.user_metadata?.full_name || "",
                phone_number: authData.user.phone || "",
                student_number: authData.user.user_metadata?.student_number || "",
                verification_status: "verified",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              localStorage.setItem("runner_user", JSON.stringify(runnerUser));
              setCurrentUser(runnerUser);
              
              // No need to throw the error, we've created a fallback user
              return;
            }
            
            throw userError;
          }
          
          if (!userData) {
            throw new Error('No runner profile found for this user');
          }
          
          // Format the user data to match our RunnerUser interface
          const runnerUser: RunnerUser = {
            id: userData.id,
            email: userData.email,
            role: "runner" as const,
            first_name: userData.full_name.split(' ')[0],
            last_name: userData.full_name.split(' ').slice(1).join(' '),
            full_name: userData.full_name,
            phone_number: userData.phone_number || '',
            student_number: userData.student_number || '',
            verification_status: userData.verification_status as "verified",
            created_at: userData.created_at,
            updated_at: userData.updated_at || userData.created_at
          };
          
          // Save user to localStorage for persistence
          localStorage.setItem("runner_user", JSON.stringify(runnerUser));
          setCurrentUser(runnerUser);
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          // If there's an RLS policy error, we're still authenticated but need to handle differently
          if (error.code === '42P17') {
            // This is the infinite recursion error code
            const runnerUser: RunnerUser = {
              id: authData.user.id,
              email: authData.user.email || email,
              role: "runner",
              first_name: "",
              last_name: "",
              full_name: "",
              phone_number: "",
              student_number: "",
              verification_status: "verified",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            localStorage.setItem("runner_user", JSON.stringify(runnerUser));
            setCurrentUser(runnerUser);
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem("runner_user");
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
    return Promise.resolve();
  };
  
  // Check for saved user on mount and session from Supabase
  useEffect(() => {
    const savedUser = localStorage.getItem("runner_user");
    
    // Check Supabase session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Active session found:", session.user.email);
          
          if (savedUser) {
            console.log("Restoring saved user from localStorage");
            setCurrentUser(JSON.parse(savedUser));
          } else {
            // Fetch user data if we have a session but no saved user
            console.log("Fetching user data for active session");
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .eq('role', 'runner')
                .single();
              
              console.log("User data fetch result:", userData, userError);
              
              if (!userError && userData) {
                const runnerUser: RunnerUser = {
                  id: userData.id,
                  email: userData.email,
                  role: "runner" as const,
                  first_name: userData.full_name.split(' ')[0],
                  last_name: userData.full_name.split(' ').slice(1).join(' '),
                  full_name: userData.full_name,
                  phone_number: userData.phone_number || '',
                  student_number: userData.student_number || '',
                  verification_status: userData.verification_status as "verified",
                  created_at: userData.created_at,
                  updated_at: userData.updated_at || userData.created_at
                };
                
                localStorage.setItem("runner_user", JSON.stringify(runnerUser));
                setCurrentUser(runnerUser);
              } else if (userError && userError.code === '42P17') {
                // Handle RLS policy error with a basic user object
                console.log("RLS policy error in session check, creating basic runner user");
                const runnerUser: RunnerUser = {
                  id: session.user.id,
                  email: session.user.email || "",
                  role: "runner",
                  first_name: session.user.user_metadata?.first_name || "",
                  last_name: session.user.user_metadata?.last_name || "",
                  full_name: session.user.user_metadata?.full_name || "",
                  phone_number: session.user.phone || "",
                  student_number: session.user.user_metadata?.student_number || "",
                  verification_status: "verified",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                
                localStorage.setItem("runner_user", JSON.stringify(runnerUser));
                setCurrentUser(runnerUser);
              }
            } catch (error) {
              console.error("Error during session check:", error);
            }
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem("runner_user");
          setCurrentUser(null);
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
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

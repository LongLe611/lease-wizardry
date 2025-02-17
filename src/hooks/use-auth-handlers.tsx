
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useAuthHandlers() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: authData.user.id, role }]);

      if (roleError) throw roleError;

      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification instructions.",
      });
      
      navigate("/lease-management");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during sign up");
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      navigate("/lease-management");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSignUp,
    handleLogin,
    setError,
  };
}

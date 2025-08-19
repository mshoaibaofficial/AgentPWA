import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      login(result.user);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-fade-in">
      {/* Logo and Branding */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="w-10 h-10 text-care-blue" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Care Manager Co-pilot</h1>
        <p className="text-care-gray-dark text-sm">Your AI assistant for healthcare management</p>
      </div>
      
      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="care.manager@hospital.com"
                    type="email"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-care-blue focus:border-transparent transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-care-blue focus:border-transparent transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit"
            className="w-full bg-care-blue hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <a href="#" className="text-care-blue text-sm font-medium hover:underline">
          Forgot your password?
        </a>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-care-gray-dark">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-care-blue font-medium hover:underline"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}

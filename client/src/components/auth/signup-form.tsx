import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/signup", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      const result = await response.json();
      
      login(result.user);
      toast({
        title: "Welcome to Care Manager Co-pilot!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again.",
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Join Care Manager Co-pilot</h1>
        <p className="text-care-gray-dark text-sm">Create your healthcare management account</p>
      </div>
      
      {/* Signup Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dr. Jane Smith"
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
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-care-gray-dark">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-care-blue font-medium hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}

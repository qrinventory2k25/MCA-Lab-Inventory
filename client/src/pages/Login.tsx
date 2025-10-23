import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Shield,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { login, isLoading } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError(false);
    setIsAnimating(true);
    
    try {
      const success = await login(data.username, data.password);
      if (!success) {
        setLoginError(true);
        // Reset animation after delay
        setTimeout(() => setIsAnimating(false), 1000);
      }
    } catch (error) {
      setLoginError(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleErrorAnimation = () => {
    if (loginError) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header with Enhanced Design */}
        <div className="text-center mb-10">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-2xl animate-pulse-slow">
              <Shield className="w-14 h-14" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3 animate-fade-in-up">
            Lab Admin Portal
          </h1>
          <p className="text-purple-200 text-base md:text-lg animate-fade-in-up-delay">
            Secure access to College QR Inventory System
          </p>
        </div>

        {/* Modern Login Form */}
        <Card className={`p-6 md:p-10 border-0 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl ${loginError ? 'animate-shake' : 'animate-slide-up'}`}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              {/* Username Field with Enhanced Styling */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white/90 mb-3 block">
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 group-focus-within:text-purple-400 transition-colors">
                          <User className="w-full h-full" />
                        </div>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your username"
                          className="pl-12 pr-4 h-14 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder:text-white/60 focus:border-purple-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Password Field with Perfectly Aligned Eye Icon */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-white/90 mb-3 block">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 group-focus-within:text-purple-400 transition-colors">
                          <Lock className="w-full h-full" />
                        </div>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-12 pr-12 h-14 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder:text-white/60 focus:border-purple-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60 hover:text-white/90 transition-colors duration-200 focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-full h-full" />
                          ) : (
                            <Eye className="w-full h-full" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Enhanced Error Alert */}
              {loginError && (
                <Alert 
                  variant="destructive" 
                  className="border-red-400/50 bg-red-500/20 backdrop-blur-sm rounded-2xl animate-slide-down"
                >
                  <AlertCircle className="h-5 w-5 text-red-300" />
                  <AlertDescription className="text-red-200 font-medium">
                    Invalid credentials. Please check your username and password.
                  </AlertDescription>
                </Alert>
              )}

              {/* Enhanced Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6 mr-3" />
                    Access Lab System
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Enhanced Footer */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">College QR Inventory System</span>
            </div>
            <div className="text-center mt-4">
              <p className="text-white/60 text-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Secure authentication required
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

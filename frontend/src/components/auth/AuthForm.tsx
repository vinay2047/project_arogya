'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userAuthStore } from '@/store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'signup';
  userRole: 'doctor' | 'patient';
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// A simple logo component. You can replace this with your actual <Logo />
const Logo = () => (
  <Link href="/" className="inline-block">
    <h1 className="text-3xl font-extrabold text-[#1e6190] tracking-tight drop-shadow-md">
      Arogya<span className="text-[#52b69a]">+</span>
    </h1>
  </Link>
);

const AuthForm = ({ type, userRole }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    registerPatient,
    registerDoctor,
    loginPatient,
    loginDoctor,
    loading,
    error,
  } = userAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'signup' && !agreeToTerms) return;

    try {
      if (type === 'signup') {
        if (userRole === 'doctor') {
          await registerDoctor(formData);
        } else {
          await registerPatient(formData);
        }
        router.push(`/onboarding/${userRole}`);
      } else {
        if (userRole === 'doctor') {
          await loginDoctor(formData.email, formData.password);
          router.push('/doctor/dashboard');
        } else {
          await loginPatient(formData.email, formData.password);
          router.push('/patient/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${BASE_URL}/auth/google?type=${userRole}`;
  };

  const isSignup = type === 'signup';
  const title = isSignup ? 'Create your Account' : 'Welcome Back!';
  const buttonText = isSignup ? 'Create Account' : 'Sign in';
  const altLinkText = isSignup
    ? 'Already have an account?'
    : "Don't have an account?";
  const altLinkAction = isSignup ? 'Sign in' : 'Sign up';
  const altLinkPath = isSignup ? `/login/${userRole}` : `/signup/${userRole}`;

  return (
    // We wrap the form in a full-height, centered container with a gradient
    <div className="flex flex-col justify-center items-center w-full bg-white px-4 py-8">
      <div className="w-full max-w-md p-8 md:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-left">
          {title}
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border border-teal-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl py-3"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black/80 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-[#52b69a]/50 focus:border-[#52b69a]/50 focus:ring-[#52b69a]/50 rounded-lg py-3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border border-[#52b69a]/50 focus:border-[#52b69a]/50 focus:ring-[#52b69a]/50 rounded-lg pr-10 py-3"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isSignup && (
            <div className="flex items-start space-x-2 text-sm pt-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
                className="mt-1"
              />
              <label htmlFor="terms" className="text-gray-600 leading-5">
                I agree to the{' '}
                <Link
                  href="#"
                  className="text-[#1e6190] hover:underline font-medium"
                >
                  Terms
                </Link>{' '}
                and{' '}
                <Link
                  href="#"
                  className="text-[#1e6190] hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          )}

          {/* --- MODIFIED BUTTON ALIGNMENT --- */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#1e6190] hover:bg-[#52b69a] text-white font-semibold py-3 px-8 rounded-full transition-all"
              disabled={loading || (isSignup && !agreeToTerms)}
            >
              {loading ? `${isSignup ? 'Creating' : 'Signing'}...` : buttonText}
            </Button>
          </div>
        </form>

        {/* --- SEPARATOR & GOOGLE AUTH --- */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/30"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/70 backdrop-blur-sm px-2 text-black/70">
                or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3"
              onClick={handleGoogleAuth}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isSignup ? 'Sign up' : 'Sign in'} with Google
            </Button>
          </div>
        </div>

        {/* --- MODIFIED ALT LINK ALIGNMENT --- */}
        <div className="mt-8 text-center text-sm">
          <span className="text-black/80 mr-1">{altLinkText}</span>
          <Link
            href={altLinkPath}
            className="text-[#1e6190] hover:underline font-medium"
          >
            {altLinkAction}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

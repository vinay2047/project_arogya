'use client';
import { userAuthStore } from '@/store/authStore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
export function Providers({ children }: { children: React.ReactNode }) {
  const { fetchProfile, token } = userAuthStore();
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  return <Elements stripe={stripePromise}>{children}</Elements>;
}

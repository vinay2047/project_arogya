'use client'
import { userAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
export function Providers({children} : {children:React.ReactNode}) {
    const {fetchProfile,token} =  userAuthStore();
    useEffect(() => {
        if(token){
            fetchProfile();
        }
    },[token,fetchProfile]);

 return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
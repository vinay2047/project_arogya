"use client";
import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { userAuthStore } from '@/store/authStore';

const LandingHero = () => {
  const { isAuthenticated } = userAuthStore();
  const router = useRouter();

  // Unified function for redirection logic
  const handleProtectedAction = (pathIfAuthenticated: string) => {
    if (isAuthenticated) {
      router.push(pathIfAuthenticated);
    } else {
      // Directs unauthenticated users to sign up
      router.push('/signup/patient');
    }
  };

  const handleBookConsultation = () => {
    handleProtectedAction('/doctor-list');
  };

  const handleCategoryClick = (categoryTitle: string) => {
    handleProtectedAction(`/doctor-list?category=${categoryTitle}`);
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-32 bg-white">
      {/* Background Gradient & Shape Overlay for Modern Look */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-teal-100),_transparent_60%)]"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Main Headline - More Impactful and Clear */}
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            The Future of <br className="hidden sm:inline"/>
            <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Accessible Healthcare
            </span>
            <br className="hidden sm:inline"/> is Here.
          </h1>

          {/* Subheading - Professional and Trustworthy */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto font-light">
            **Jivika** connects you with certified doctors for video consultations, 
            providing accessible, affordable, and compassionate care from your home.
          </p>

          {/* Action Buttons - Distinct and Inviting */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={handleBookConsultation}
              size="lg"
              className="group relative overflow-hidden bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-10 py-7 text-xl font-semibold shadow-2xl shadow-teal-500/50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <span className="relative z-10">Book a Consultation Now</span>
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </Button>
            <Link href="/login/doctor">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-teal-500 text-teal-600 hover:bg-teal-50 rounded-xl px-10 py-7 text-xl font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Are you a Doctor? Login
              </Button>
            </Link>
          </div>
          

         
          
        </div>
        
        {/* Placeholder for a hero image/illustration on the side (commented out) */}
        {/* <div className="hidden lg:block lg:w-1/2">
          <Image src="/hero-illustration.svg" alt="Online Consultation" width={600} height={400} className="w-full h-auto" />
        </div> */}
      </div>
    </section>
  );
};

// Simple component for clean presentation of trust indicators
const Indicator = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center space-x-2 p-2 rounded-full bg-teal-50/50 backdrop-blur-sm">
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </div>
);

export default LandingHero;
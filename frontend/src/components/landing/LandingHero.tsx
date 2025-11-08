"use client";
import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { useRouter } from 'next/navigation';
import { userAuthStore } from '@/store/authStore';

const LandingHero = () => {
  const { isAuthenticated } = userAuthStore();
  const router = useRouter();

  // Unified function for redirection logic (no change, this is good)
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
      {/* Background Gradient & Shape Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-teal-100),_transparent_60%)]"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        
        {/* NEW: Two-column layout, inspired by your image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* --- LEFT COLUMN: Image --- */}
          <div className="w-full md:pl-10 lg:w-5/12">
            {/* TODO: Add your illustration here. 
              Create an 'images' folder in 'public' (i.e., public/images/hero-illustration.svg)
            */}
            <Image 
              src="/hero.jpg" // Replace with your image path
              alt="Jivika - Online doctor consultation"
              width={500}
              height={500}
              className="w-full rounded-3xl h-auto max-w-md mx-auto lg:max-w-none"
              priority // Makes the hero image load faster
            />
          </div>

          {/* --- RIGHT COLUMN: Text Content --- */}
          <div className="w-full lg:w-7/12 text-center lg:text-left">
            
            {/* Main Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Empowering you to stay<br className="hidden sm:inline"/>
              <span className="text-[#52b69a]">
                one step ahead
              </span>
              <br className="hidden sm:inline"/> of your health.
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto lg:mx-0 font-light">
              With Jivika, managing your health has never been easier. Connect with verified doctors, and schedule appointments, all through one intelligent, secure platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleBookConsultation}
                size="lg"
                className="group relative overflow-hidden bg-[#1e6190] hover:bg-[#52b69a] text-white rounded-full px-10 py-7 text-xl font-semibold transition-all duration-300 transform hover:scale-[1.02]"
              >
                <span className="relative z-10">Get Started Now</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </Button>
              <Link href="/login/doctor">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#1e6190] text-[#1e6190] hover:border-[#52b69a] hover:text-[#52b69a] rounded-full px-10 py-7 text-xl font-medium transition-colors"
                >
                  Continue as Doctor
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

// Removed the 'Indicator' component as it wasn't used in your hero's return function.
// If you'd like to add it back (e.g., under the buttons), let me know!

export default LandingHero;
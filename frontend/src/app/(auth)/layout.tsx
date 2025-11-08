'use client'
import { userAuthStore } from '@/store/authStore';
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react'
import Image from 'next/image'; // Import Next.js Image component
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const sliderContent = [
  {
    key: 'slide1',
    imgSrc: '/1.jpg',
    title: 'Welcome to Jivika',
    description: 'Your health, our priority. Connecting you with certified providers.',
  },
  {
    key: 'slide2',
    imgSrc: '/2.jpg', // Example: /images/secure-data.jpg
    title: 'Secure & Confidential',
    description: 'Your medical data is safe with our end-to-end encryption.',
  },
  {
    key: 'slide3',
    imgSrc: '/3.jpg', // Example: /images/easy-booking.jpg
    title: 'Book Appointments Easily',
    description: 'Find the right doctor and book your slot in just a few clicks.',
  },
]

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated, user } = userAuthStore();

  // --- No changes to your core auth logic ---
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.isVerified) {
        redirect(`/onboarding/${user.type}`)
      } else {
        if (user.type === 'doctor') {
          redirect('/doctor/dashboard')
        } else {
          redirect('/patient/dashboard')
        }
      }
    }
  }, [isAuthenticated, user])

  // --- Embla Carousel Hook ---
  // We use the Autoplay plugin, looping, with a 4-second delay
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])

  return (
    <div className='min-h-screen flex bg-white'>

      {/* --- LEFT SIDE: Image Slider --- */}
      <div className='hidden lg:block w-1/2 relative overflow-hidden' ref={emblaRef}>
        <div className='flex h-full'>
          {sliderContent.map((slide) => (
            // Each slide
            <div
              className='flex-[0_0_100%] min-w-0 h-full relative'
              key={slide.key}
            >
              {/* Background Image */}
              <Image
                src={slide.imgSrc}
                alt={slide.title}
                fill
                style={{ objectFit: 'cover' }}
                className='z-0'
                priority={slide.key === 'slide1'} // Load the first image faster
              />
              {/* Gradient overlay from bottom for readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10" />

              {/* Text Content */}
              <div className='relative z-20 flex flex-col justify-end h-full text-white p-16'>
                <div className='max-w-md'>
                  <h2 className='text-4xl font-bold mb-4'>{slide.title}</h2>
                  <p className='text-xl opacity-90'>{slide.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: Auth Form --- */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto'>
        {/* We add a max-width to the form for better readability on large screens */}
        <div className='w-full max-w-md'>
          {children}
        </div>
      </div>

    </div>
  )
}

export default Layout;
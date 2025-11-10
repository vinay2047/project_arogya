'use client'
import { userAuthStore } from '@/store/authStore'
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
    const {isAuthenticated} = userAuthStore();

    useEffect(() => {
        if(!isAuthenticated){
            redirect('/login/patient')
        }
    },[isAuthenticated])

    if(!isAuthenticated) return null;
  return (
    <div
        className="min-h-screen flex flex-col"
        style={{
            background: 'linear-gradient(180deg, rgba(82,182,154,0.12) 0%, rgba(82,182,154,0.02) 100%)',
        }}
    >
        <header className="bg-white border-b px-6 py-4">
            <div className="max-w-full flex-row mx-auto">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img src="/logo.png" alt="Arogya logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-2xl font-bold">Arogya</div>
                </div>
            </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
            {children}
        </main>
    </div>
  )
}

export default layout
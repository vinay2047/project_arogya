import Loader from '@/components/Loader'
import DoctorListPage from '@/components/patient/DoctorListPage'
import { DashboardSidebar } from '@/components/patient/DashboardSidebar'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 pl-0 md:pl-64">
        <Suspense fallback={<Loader/>}>
          <DoctorListPage/>
        </Suspense>
      </div>
    </div>
  )
}

export default page
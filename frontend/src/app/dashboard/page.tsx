"use client"
import React from 'react'
import Header from '@/components/landing/Header'

const StatCard: React.FC<{label:string, value:string, accent?:string}> = ({label,value,accent}) => {
  return (
    <div className="dashboard-card flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="stat-card-number mt-2">{value}</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 text-white">
          {/* icon placeholder */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2v4h6v-4c0-1.105-1.343-2-3-2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1"></path></svg>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showDashboardNav/>

      <div className="pt-16 container mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="dashboard-sidebar hidden lg:block">
            <div className="sticky top-20">
              <div className="dashboard-card mb-4">
                <h3 className="text-lg font-semibold">Dashboard</h3>
                <p className="text-sm text-gray-500 mt-2">Overview & quick stats</p>
              </div>

              <nav className="space-y-2">
                <a className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100" href="#">Overview</a>
                <a className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100" href="#">Patients</a>
                <a className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100" href="#">Doctors</a>
                <a className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100" href="#">Reports</a>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard label="Today's Patients" value="159" />
              <StatCard label="Our Doctors" value="18" />
              <StatCard label="Our Beds" value="18" />
              <StatCard label="Today's Operation" value="10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="dashboard-card mb-6">
                  <h4 className="text-lg font-semibold mb-4">Patient History</h4>
                  <div className="chart-placeholder"></div>
                </div>

                <div className="dashboard-card">
                  <h4 className="text-lg font-semibold mb-4">Total Patient Per Day</h4>
                  <div className="chart-placeholder"></div>
                </div>
              </div>

              <aside>
                <div className="dashboard-card mb-6">
                  <h4 className="text-lg font-semibold mb-4">Top Diseases</h4>
                  <div className="chart-placeholder h-40"></div>
                </div>

                <div className="dashboard-card">
                  <h4 className="text-lg font-semibold mb-4">Top Doctors</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="font-medium">Charlotte</div>
                          <div className="text-sm text-gray-500">Gynecologist</div>
                        </div>
                      </div>
                      <div className="text-yellow-400">★★★★★</div>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="font-medium">Isabella Ava</div>
                          <div className="text-sm text-gray-500">Medicine Specialist</div>
                        </div>
                      </div>
                      <div className="text-yellow-400">★★★★★</div>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

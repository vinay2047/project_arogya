"use client";
import React, { useEffect, useState } from "react";
import { userAuthStore } from "@/store/authStore";
import { DashboardSidebar } from "./DashboardSidebar";
import { Appointment, useAppointmentStore } from "@/store/appointmentStore";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { FileUploadDialog } from "./FileUploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { getStatusColor } from "@/lib/constant";
import PrescriptionViewModal from "../doctor/PrescriptionViewModal";
import { Separator } from "@radix-ui/react-dropdown-menu";

const PatientDashboardContent = () => {
  const { user } = userAuthStore();
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [tabCounts, setTabCounts] = useState({
    upcoming: 0,
    past: 0,
  });

  useEffect(() => {
    if (user?.type === "patient") {
      fetchAppointments("patient", activeTab);
    }
  }, [user, activeTab, fetchAppointments]);

  useEffect(() => {
    const now = new Date();
    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.slotStartIso);
      return (
        (aptDate >= now || apt.status === "In Progress") &&
        (apt.status === "Scheduled" || apt.status === "In Progress")
      );
    });

    const pastAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.slotStartIso);
      return (
        aptDate < now ||
        apt.status === "Completed" ||
        apt.status === "Cancelled"
      );
    });

    setTabCounts({
      upcoming: upcomingAppointments.length,
      past: pastAppointments.length,
    });
  }, [appointments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return appointmentDate.toDateString() === today.toDateString();
  };

  const canJoinCall = (appointment: Appointment) => {
    const appointmentTime = new Date(appointment.slotStartIso);
    const now = new Date();
    const diffMinutes = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);

    return (
      isToday(appointment.slotStartIso) &&
      diffMinutes <= 15 &&
      diffMinutes >= -120 &&
      (appointment.status === "Scheduled" ||
        appointment.status === "In Progress")
    );
  };

  if (!user) return null;

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="rounded-3xl border border-gray-100 overflow-hidden">
      <CardContent className="px-6">
        {/* --- 1. Avatar (Top & Centered) --- */}
        <div className="flex justify-center relative">
          {isToday(appointment.slotStartIso) && (
            <div className="absolute top-1 right-1">
              <Badge className="bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-semibold">
                TODAY
              </Badge>
            </div>
          )}
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={appointment.doctorId?.profileImage}
              alt={appointment.doctorId?.name}
            />
            <AvatarFallback className="bg-[#52b69a]/10 text-[#52b69a] text-3xl font-bold">
              {appointment.doctorId?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* --- 2. Doctor Info (Centered) --- */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-semibold text-black">
            {appointment.doctorId?.name
              ? appointment.doctorId.name.charAt(0).toUpperCase() + appointment.doctorId.name.slice(1)
              : ""}
          </h3>
          <p className="text-black/80">
            {appointment.doctorId?.specialization}
          </p>
        </div>

        {/* --- 3. Status (Centered) --- */}
        <div className="mt-4 flex flex-col items-center space-y-2">
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        <Separator className="my-6" />

        {/* --- 4. Appointment Details (Grid) --- */}
        <div className="flex-col">
          {/* Date Info */}
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-4 h-4 text-[#52b69a] flex-shrink-0" />
            <span className="text-sm text-black">
              {formatDate(appointment.slotStartIso) }
            </span>
          </div>

          {/* Consultation Type */}
          <div className="flex items-center space-x-3 mb-2  ">
            {appointment.consultationType === "Video Consultation" ? (
              <Video className="w-4 h-4 text-[#52b69a] flex-shrink-0" />
            ) : (
              <Phone className="w-4 h-4 text-[#52b69a] flex-shrink-0" />
            )}
            <span className="text-sm text-black">
              {appointment.consultationType}
            </span>
          </div>

          <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-[#52b69a] flex-shrink-0" />
            <span className="text-sm text-black">
              {appointment.doctorId?.hospitalInfo?.name}
            </span>
          </div>

          {/* Fee Info */}
          <div className="flex justify-end space-x-3 mt-2">
            <span className="text-lg font-semibold text-[#52b69a]">
              ₹{appointment.doctorId?.fees}
            </span>
          </div>

          {/* Symptoms Info */}
          {/* {appointment.symptoms && (
            <div className="flex items-start space-x-3 sm:col-span-2">
              <span className="text-sm font-semibold text-gray-600 w-16">
                Symptoms:
              </span>
              <p className="text-sm text-gray-800 line-clamp-2">
                {appointment.symptoms}
              </p>
            </div>
          )} */}
        </div>

        {/* --- 5. Actions & Rating (Bottom) --- */}
        
      </CardContent>
    </Card>
  );

  const EmptyState = ({ tab }: { tab: string }) => {
    const emptyStates = {
      upcoming: {
        icon: Clock,
        title: "No Upcoming Appointments",
        description: "You have no upcoming appointments scheduled.",
        showBookButton: true,
      },
      past: {
        icon: FileText,
        title: "No Past Appointments",
        description: "Your completed consultations will appear here.",
        showBookButton: false,
      },
    };

    const state = emptyStates[tab as keyof typeof emptyStates];
    const Icon = state.icon;
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {state.title}
          </h3>
          <p className="text-gray-600 mb-6">{state.description}</p>

          {state.showBookButton && (
            <Link href="/doctor-list">
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Book Your First Appointment
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 pl-0 md:pl-64">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-md md:text-3xl font-bold text-black">
                My Appointments
              </h1>
              <p className="text-xs md:text-lg pt-2 text-black/80">
                Manage your healthcare appointments
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/doctor-list">
                <Button className="rounded-full bg-[#1e6190] hover:bg-[#52b69a]">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book <span className="hidden md:block">New Appointment</span>
                </Button>
              </Link>
              <FileUploadDialog />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
            <TabsList className="w-full md:w-1/3 mx-auto grid grid-cols-2 h-14 rounded-full gap-4 justify-center items-center">
              <TabsTrigger value="upcoming" className="flex items-center rounded-full justify-center space-x-2">
                <Clock className="w-4 h-4 text-[#52b69a]" />
                <span>Upcoming ({tabCounts.upcoming})</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center justify-center rounded-full space-x-2">
                <Calendar className="w-4 h-4 text-[#52b69a]" />
                <span>Past ({tabCounts.past})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <EmptyState tab="upcoming" />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <EmptyState tab="past" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardContent;

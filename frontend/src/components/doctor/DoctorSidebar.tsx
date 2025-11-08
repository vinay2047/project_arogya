"use client";

import { cn } from "@/lib/utils";
import { userAuthStore } from "@/store/authStore";
import { Calendar, FileText, Home, LogOut, Menu, Users, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

const links: SidebarLink[] = [
  { name: "Dashboard", href: "/(dashboard)/doctor/dashboard", icon: Home },
  { name: "Appointments", href: "/(dashboard)/doctor/appointments", icon: Calendar },
  { name: "Patients", href: "/(dashboard)/doctor/patients", icon: Users },
  { name: "Prescriptions", href: "/(dashboard)/doctor/prescriptions", icon: FileText },
  { name: "Profile", href: "/(dashboard)/doctor/profile", icon: User },
];

export function DoctorSidebar() {
  const { user, logout } = userAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-teal-600">Jivika</h1>
        </div>

        <Separator />

        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-teal-100 text-teal-600">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="p-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              logout();
              try {
                localStorage.removeItem("auth-storage");
                localStorage.removeItem("token");
              } catch (e) {}
              setIsMobileMenuOpen(false);
              router.push("/");
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}

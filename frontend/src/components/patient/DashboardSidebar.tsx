"use client";

import { cn } from "@/lib/utils";
import { userAuthStore } from "@/store/authStore";
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

const links: SidebarLink[] = [
  { name: "Appointments", href: "/patient/dashboard", icon: Calendar },
  { name: "Find Doctors", href: "/doctor-list", icon: Users },
  { name: "Profile", href: "/patient/profile", icon: UserCircle },
  {name:"Medical Graph", href:"/graph/graph_1731125000_demo_full", icon:FileText},
];

export function DashboardSidebar() {
  const { user, logout } = userAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [graphId, setGraphId] = useState<string | null>(null);

  // read graphId from localStorage so sidebar can show Graph route when available
  useEffect(() => {
    try {
      const id = localStorage.getItem('graphId');
      setGraphId(id);
    } catch (e) {
      setGraphId(null);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'graphId') setGraphId(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* App Logo */}
        <div className="p-6 flex-row items-center space-x-2 flex border-b">
          <div className="w-8 h-8 flex items-center justify-center">
              <img src={
                "/logo.png"
              }/>
            </div>
          <h1 className="text-2xl font-bold text-black">Jivika</h1>
        </div>

        <Separator />

        {/* User Profile Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-[#52b69a]/10 font-semibold text-[#52b69a]">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Links */}
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
                  isActive
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-600 hover:bg-gray-100"
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

        {/* Logout Button */}
        <div className="p-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              // Clear auth state and persisted storage, then redirect to landing
              logout();
              try {
                localStorage.removeItem("auth-storage");
                localStorage.removeItem("token");
              } catch (e) {
                // ignore if running in environments without localStorage
              }
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
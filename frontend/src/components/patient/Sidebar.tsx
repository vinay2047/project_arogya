"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Calendar,
  FileText,
  Home,
  Layout,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { userAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
}) => (
  <Link href={href}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = userAuthStore();

  if (!user) return null;

  const links = [
    
    {
      href: "/patient/profile",
      icon: UserCircle,
      label: "Profile",
    },
    {
      href: "/doctor-list",
      icon: Users,
      label: "Find Doctors",
    },
    {
      href: "/patient/prescriptions",
      icon: FileText,
      label: "Prescriptions",
    },
    {
      href: "/patient/dashhboard",
      icon: Calendar,
      label: "Appointments",
    },
  ];

  return (
    <div className="min-h-screen w-64 border-r bg-background px-4 py-8">
      {/* App Logo & Name */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">MedConnect</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="mb-8 flex items-center gap-3 rounded-lg border p-3">
        <Avatar>
          <AvatarImage src={user.profileImage} />
          <AvatarFallback className="bg-primary/10">
            {user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        {links.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={pathname === link.href}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-8">
        <Button variant="ghost" className="gap-2" onClick={() => logout()}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
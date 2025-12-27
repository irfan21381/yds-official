"use client";

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon, UserCircle } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white text-slate-800 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          YDS – Yasin Digital Solutions
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full">
                  <UserCircle className="h-6 w-6 text-slate-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Role: {user?.role}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/student/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-6 flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/student/dashboard" className="text-lg">
                      Dashboard
                    </Link>
                    <Link to="/student/profile" className="text-lg">
                      Profile
                    </Link>

                    {hasRole(["SUPER_ADMIN"]) && (
                      <Link to="/admin/dashboard" className="text-lg">
                        Admin Dashboard
                      </Link>
                    )}

                    <Button onClick={logout} className="mt-4 bg-red-600 hover:bg-red-700">
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Import all static components
import Hero from "../components/company/Hero";
import EduAI from "../components/company/EduAI";
import About from "../components/company/About";
import Services from "../components/company/Services";
import Products from "../components/company/Products";
import Internships from "../components/company/Internships";
import Partners from "../components/company/Partners";
import Stats from "../components/company/Stats";
import Testimonials from "../components/company/Testimonials";
import Contact from "../components/company/Contact";
import Footer from "../components/company/Footer";

const HomePage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      let redirectPath = "/student";

      switch (user.role) {
        case "SUPER_ADMIN":
          redirectPath = "/admin/dashboard";
          break;
        case "MANAGER":
          redirectPath = "/manager/dashboard";
          break;
        case "TEACHER":
          redirectPath = "/teacher/dashboard";
          break;
        case "EMPLOYEE":
          redirectPath = "/employee/dashboard";
          break;
        case "STUDENT":
        case "PUBLIC_STUDENT":
        default:
          redirectPath = "/student";
      }

      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Checking session...
      </div>
    );
  }

  // Public homepage
  return (
    <div className="pt-20 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
      <Hero />
      <EduAI />
      <About />
      <Services />
      <Products />
      <Internships />
      <Partners />
      <Stats />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;

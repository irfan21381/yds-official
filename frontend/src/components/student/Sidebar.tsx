// src/components/student/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200"
    }`;

  // External link kosam oka saadharana class
  const externalLinkClass = "block px-4 py-3 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white dark:bg-gray-900 border-r dark:border-gray-700">
      
      <div className="p-4 border-b dark:border-gray-800">
        <h1 className="text-xl font-bold text-blue-600"><b>🌟YDS🌟</b></h1>
        <p className="text-xs text-gray-500">Student Portal</p>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink to="/student" className={linkClass} end>Dashboard</NavLink>
        <NavLink to="/student/profile" className={linkClass}>Profile</NavLink>
        <NavLink to="/student/courses" className={linkClass}>Courses</NavLink>
        <NavLink to="/student/internships" className={linkClass}>Internships</NavLink>
        <NavLink to="/student/payments" className={linkClass}>Payments</NavLink>
        
        {/* Ikkada NavLink ni <a> tag ga marchamu */}
        <a 
          href="https://yasindigitalsolutions.online/" 
          className={externalLinkClass}
          target="_blank" 
          rel="noopener noreferrer"
        >
          AI Assistant
        </a>
      </nav>
    </aside>
  );
}

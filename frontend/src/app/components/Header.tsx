"use client"

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Header(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
      const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };
    return(
      <div>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <button
          className="text-white"
          onClick={toggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex-grow text-center">
          <span className="font-bold">Chat App</span>
        </div>

      </header>
      </div>);
}
"use client"

import { useState } from 'react';
import ChatArea from '../components/ChatArea';
import Header from '../components/Header';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      
      

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header/> 

        {/* Chat Area */}
        <ChatArea />
      </div>
    </div>
  );
}

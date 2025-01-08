"use client";
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaComments, FaCog, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [userName, setUserName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Replace with your logic to retrieve the stored token
        const token = localStorage.getItem('authToken');

        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/getUserProfile', {
          
          headers: {  Authorization: `Bearer ${token}` },
        });
        

        const { name, profilePic } = response.data;
        setUserName(name);
        setProfilePic(profilePic || null); // Set profile picture if available
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={toggleSidebar}
    >
      <div
        className={`bg-white w-64 h-full p-4 transition-transform duration-300 ${
          isOpen ? "transform translate-x-0" : "transform -translate-x-64"
        }`}
      >
        {/* Profile Section */}
        <div className="flex items-center space-x-3 mb-6">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                    {/* Placeholder with initials if no image */}
                    {userName.charAt(0).toUpperCase()}
                  </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{userName}</h2>
            <p className="text-sm text-gray-500">Active</p>
          </div>
        </div>

        {/* Other Sidebar Options */}
        <a href="/dashboard">
          <div className="mb-6">
            <ul>
              <li className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded-md">
                <FaComments className="text-lg text-gray-600" />
                <span>Chats</span>
              </li>
            </ul>
          </div>
        </a>
        <div className="mb-6">
          <ul>
            <li className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
              <FaUserCircle className="text-lg text-gray-600" />
              <span>My Profile</span>
            </li>
          </ul>
        </div>
        <a href="/settings">
          <div className="mb-6">
            <ul>
              <li className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded-md">
                <FaCog className="text-lg text-gray-600" />
                <span>Settings</span>
              </li>
            </ul>
          </div>
        </a>
        <a href="/login">
          <div className="mb-6">
            <ul>
              <li
                className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={toggleSidebar}
              >
                <FaSignOutAlt className="text-lg text-gray-600" />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;

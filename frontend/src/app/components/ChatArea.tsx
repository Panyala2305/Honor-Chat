"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface User {
  _id: string;
  name: string;
  userid: string;
  email: string;
  profilePic: string;
}

interface Message {
  senderId: string | null;
  recipientId: string;
  content: string;
  timestamp: Date;
}



const socket = io("http://localhost:5000");

const ChatArea = () => {
  // State for selected user
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // State for message input
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);


  const curUser_id = localStorage.getItem('user_id')
  console.log(curUser_id);



  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === "") {
        setFilteredUsers([]); // Clear users when search is empty
        return;
      }

      setLoading(true); // Show loading state

      try {
        const response = await fetch(`http://localhost:5000/api/search?query=${searchQuery}`);
        const data = await response.json();

        if (response.ok) {
          setFilteredUsers(data); // Set the users in state
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Hide loading state after request is complete
      }
    };

    searchUsers();
  }, [searchQuery]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      if (message.senderId === selectedUser?._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedUser]);

  useEffect(() => {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]); // Scroll whenever the messages change



  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleUserSelection = async (user: User) => {
    setSelectedUser(user);
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages?userId=${curUser_id}&recipientId=${user._id}`
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data); // Set chat messages
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      const newMessage = {
        senderId: curUser_id,
        recipientId: selectedUser._id,
        content: message,
        timestamp: new Date(),
      };

      socket.emit('sendMessage', newMessage);

      // Optimistically update the chat UI
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(''); // Clear the input
    }
  };





  return (
    <div className="flex h-screen">
      {/* Left Section - List of users */}
      <div className="w-2/5 bg-gray-100 p-4 overflow-y-auto">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border rounded-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <div>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded"
                onClick={() => handleUserSelection(user)} // Select user when clicked
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {/* Profile Picture */}
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                      {/* Placeholder with initials if no image */}
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.userid}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      </div>

      {/* Right Section - Chat with the selected user */}
      <div className="w-3/5 bg-gray-50 p-4">
        {selectedUser ? (
          <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
            {/* User's Profile Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedUser.name}</p>
                <p className="text-gray-500 text-sm">{selectedUser.userid}</p>
              </div>
            </div>

            {/* Chat Messages Section  */}

            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded-lg ${msg.senderId === curUser_id ? 'bg-blue-100 self-end' : 'bg-gray-100'
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
            



            {/* Message Input Section */}
            <div className="flex items-center mb-10">
              <input
                type="text"
                onKeyDown={handleKeyDown}
                className="w-full p-2 border rounded-lg shadow-sm"
                placeholder="Type a message..."
                value={message}
                onChange={handleMessageChange}
              />
              <button
                className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Select a user to start a chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;

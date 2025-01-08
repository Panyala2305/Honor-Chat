"use client";
import { useEffect, useState } from 'react';
import Header from '../components/Header';

const SettingsPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(''); // Store user name state

  useEffect(() => {
    // Get the user name from localStorage (or wherever it's stored)
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName); // Update the state with the stored name
    }
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
    } else {
      setProfilePic(null);
    }
  };

  // Convert file to base64 string
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  // Handle form submission to update profile
  // Handle form submission to update profile
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  let profilePicBase64 = '';
  // Only convert the profile picture to base64 if it's changed
  if (profilePic) {
    try {
      profilePicBase64 = await convertToBase64(profilePic);
    } catch (error) {
      setError('Error converting image.');
      setLoading(false);
      return;
    }
  }

  // Build the profile data object, including only the changed fields
  const profileData: { [key: string]: any } = {};

  if (name) profileData.name = name;
  if (password) profileData.password = password;
  if (profilePicBase64) profileData.profilePic = profilePicBase64;

  // If there are no changes, don't send anything
  if (Object.keys(profileData).length === 0) {
    setError('No changes made.');
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/updateProfile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(profileData), // Send only the changed data as JSON
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess(data.message);
    } else {
      setError(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    setError('An error occurred while updating your profile.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <Header />
      {/* Flex container to center everything */}
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        {/* Title placed above the white box, centered */}
        <h2 className="text-2xl font-semibold text-center mb-6">Profile Settings</h2>

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
          {success && <div className="text-green-500 mb-4 text-center">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <div className="mb-4 text-center">
              {/* Round profile picture */}
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gray-300">
                {profilePic ? (
                  <img
                    src={URL.createObjectURL(profilePic)} // Display the uploaded image as a preview
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xl">
                    {/* Placeholder with initials if no image */}
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <label className="block text-sm font-semibold mb-2">{userName}</label>
              <input
                type="file"
                className="border p-2 rounded-lg w-full text-sm"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Change Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Change Password</label>
              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

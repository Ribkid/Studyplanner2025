import React from 'react';
import { LogOut, User, Medal } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 border border-gray-700">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-[var(--matrix-color)]/20 flex items-center justify-center">
          <User className="h-5 w-5 text-[var(--matrix-color)]" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-300">Welcome,</p>
        <p className="text-[var(--matrix-color)] font-medium">{user.username}</p>
      </div>
      <button 
        onClick={handleLogout}
        className="p-1.5 rounded-full hover:bg-gray-700"
        title="Logout"
      >
        <LogOut className="h-4 w-4 text-gray-400 hover:text-gray-200" />
      </button>
    </div>
  );
};

export default UserProfile;
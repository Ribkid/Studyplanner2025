import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface UserLoginFormProps {
  onLogin: () => void;
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await login(username.trim());
      if (user) {
        onLogin();
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cyber-card p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold matrix-text mb-4 flex items-center">
        <User className="mr-2 h-6 w-6" /> Enter Username
      </h2>
      <p className="text-gray-300 mb-4">
        Please enter a username to track your quiz progress and scores.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-[var(--matrix-color)] focus:ring focus:ring-[var(--matrix-color)]/20 focus:outline-none"
            placeholder="Enter a username"
          />
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-md border border-[var(--matrix-color)] 
                    bg-[var(--matrix-color)]/10 text-[var(--matrix-color)] 
                    hover:bg-[var(--matrix-color)]/20 transition-all duration-300
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default UserLoginForm;
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Custom-Auth': 'true'
    }
  }
});

// Add an interceptor to set the user ID in request headers for RLS policies
const originalFetch = supabase.rest.fetcher;
supabase.rest.fetcher = async (url, options) => {
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user && user.id) {
        // Add user ID to headers for RLS
        options.headers = {
          ...options.headers,
          'X-User-ID': user.id
        };
      }
    } catch (error) {
      console.error('Error parsing user for request:', error);
    }
  }
  
  return originalFetch(url, options);
};

// Database types
export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  subject: string;
  difficulty: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}
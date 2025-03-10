/// <reference types="vite/client" />

// OpenAI API response types
interface OpenAIMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
      annotations: any[];
    };
  }>;
  file_ids: string[];
  assistant_id: string | null;
  run_id: string | null;
  metadata: Record<string, any>;
}

// OpenAI file types
interface OpenAIFile {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
}

// OpenAI Vector Store types
interface OpenAIVectorStore {
  id: string;
  object: string;
  created_at: number;
  name: string;
  file_counts: {
    total: number;
    completed: number;
    in_progress: number;
    failed: number;
  };
}
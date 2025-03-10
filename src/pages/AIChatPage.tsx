import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader, Bot, User, AlertTriangle, ChevronsDown, Sparkles, RotateCcw, FileUp, FileText, X } from 'lucide-react';
import { createThread, sendMessage, streamMessage, getMessages } from '../services/deepseek-service';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import FileUpload from '../components/FileUpload';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string[];
  createdAt: Date;
}

interface Attachment {
  id: string;
  filename: string;
}

const AIChatPage: React.FC = () => {
  const { user } = useUser();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiProvider, setApiProvider] = useState('DeepSeek AI');

  // Initialize thread on component mount
  useEffect(() => {
    const initializeThread = async () => {
      try {
        setInitializing(true);
        console.log('Initializing DeepSeek thread...');
        const threadId = await createThread();
        setThreadId(threadId);
        console.log('Thread initialized:', threadId);
        
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: [
              `👋 Welcome to the Networking Expert Teacher! I'm powered by ${apiProvider} and I'm here to help with your networking, cybersecurity, and programming questions.`,
              "Some topics I can assist with:",
              "• OSI and TCP/IP models\n• Network protocols and architecture\n• Cybersecurity concepts and best practices\n• Python programming for network automation\n• Pseudocode development",
              "📁 You can also upload documents and I'll use them to help answer your questions."
            ],
            createdAt: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error initializing thread:', error);
        setError('Failed to initialize chat. Please try refreshing the page.');
      } finally {
        setInitializing(false);
      }
    };

    initializeThread();
  }, [apiProvider]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetChat = async () => {
    setMessages([]);
    setError(null);
    setLoading(true);
    setAttachments([]);
    setStreamedMessage('');
    
    try {
      console.log('Resetting chat and creating new thread...');
      const newThreadId = await createThread();
      setThreadId(newThreadId);
      console.log('New thread created:', newThreadId);
      
      // Add welcome message
      setMessages([
        {
          id: 'welcome-new',
          role: 'assistant',
          content: [
            `👋 Chat reset! I'm powered by ${apiProvider} and ready to help with new questions about networking, cybersecurity, or programming.`
          ],
          createdAt: new Date()
        }
      ]);
    } catch (err) {
      console.error('Error resetting chat:', err);
      setError('Failed to reset chat. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (fileId: string, filename: string) => {
    console.log('File uploaded:', filename, fileId);
    setAttachments(prev => [...prev, { id: fileId, filename }]);
    setShowFileUpload(false);
  };

  const removeAttachment = (id: string) => {
    console.log('Removing attachment:', id);
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && attachments.length === 0) || !threadId || loading) return;
    
    const userMessage = newMessage.trim();
    setNewMessage('');
    
    console.log('Sending message to DeepSeek API:', userMessage);
    
    // Add user message immediately with any file attachments
    const attachmentText = attachments.length > 0 
      ? `\n\n[Attached ${attachments.length} file${attachments.length > 1 ? 's' : ''}: ${attachments.map(a => a.filename).join(', ')}]` 
      : '';
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: [userMessage + attachmentText],
        createdAt: new Date()
      }
    ]);
    
    setLoading(true);
    setError(null);
    
    try {
      // Send message to DeepSeek with any file attachments
      const fileAttachments = attachments.map(attachment => ({
        fileId: attachment.id
      }));
      
      // Clear attachments after sending
      setAttachments([]);
      
      // Use streaming API for real-time responses
      setIsStreaming(true);
      setStreamedMessage('');
      
      console.log('Starting streaming response...');
      
      // Stream the message response
      await streamMessage(
        threadId, 
        userMessage, 
        fileAttachments,
        {
          onStart: () => {
            console.log('Stream started');
          },
          onText: (text) => {
            // Update streamed message as text comes in
            setStreamedMessage(prev => prev + text);
          },
          onToolCall: (toolCall) => {
            // Handle tool calls - for example, file search
            console.log('Tool call:', toolCall);
          },
          onEnd: (content) => {
            console.log('Stream completed with content length:', content.length);
            // Streaming finished, add the complete message
            setMessages(prev => [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: [content],
                createdAt: new Date()
              }
            ]);
            setStreamedMessage('');
            setIsStreaming(false);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Streaming error:', error);
            setError('Unable to get a response. Please try again or reset the chat.');
            setIsStreaming(false);
            setStreamedMessage('');
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Unable to get a response. Please try again or reset the chat.');
      setIsStreaming(false);
      setStreamedMessage('');
      setLoading(false);
    } finally {
      messageInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  const SuggestedQuestions = () => {
    const questions = [
      "Explain the OSI model layers",
      "What's the difference between TCP and UDP?",
      "How does SSL/TLS encryption work?",
      "What are common network security threats?",
      "Help me understand subnetting"
    ];

    const handleQuestionClick = (question: string) => {
      setNewMessage(question);
      messageInputRef.current?.focus();
    };

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-[var(--matrix-color)]" />
          Suggested Questions
        </h3>
        <div className="flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(question)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-full transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center">
            <Link to="/" className="text-gray-400 hover:text-gray-200 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center">
              <Bot className="h-6 w-6 text-[var(--matrix-color)] mr-2" />
              <span className="matrix-text">Networking</span> Expert Teacher
              <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                Powered by {apiProvider}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetChat}
              disabled={loading || initializing}
              className="text-gray-400 hover:text-gray-200 flex items-center text-sm py-1 px-2 rounded-md hover:bg-gray-700"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </button>
            <div className="text-sm text-gray-400">
              {user ? `Logged in as ${user.username}` : 'Not logged in'}
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-900" 
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {initializing ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--matrix-color)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-300">Initializing chat with {apiProvider}...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 1 && <SuggestedQuestions />}
              
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-[var(--matrix-color)]/10 border border-[var(--matrix-color)]/20 text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === 'assistant' ? (
                        <Bot className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                      ) : (
                        <User className="h-5 w-5 text-white mr-2" />
                      )}
                      <div className="text-sm font-medium">
                        {message.role === 'assistant' ? 'Networking Expert' : 'You'}
                      </div>
                    </div>
                    <div className="message-content prose prose-invert max-w-none">
                      {message.content.map((text, index) => (
                        <ReactMarkdown key={index}>
                          {text}
                        </ReactMarkdown>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Streaming Message */}
              {isStreaming && streamedMessage && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center mb-2">
                      <Bot className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                      <div className="text-sm font-medium text-gray-200">Networking Expert</div>
                    </div>
                    <div className="message-content prose prose-invert max-w-none">
                      <ReactMarkdown>{streamedMessage}</ReactMarkdown>
                    </div>
                    <div className="text-[var(--matrix-color)] text-xs animate-pulse mt-2">
                      Generating via {apiProvider}...
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading Indicator (only show if not streaming) */}
              {loading && !isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 text-[var(--matrix-color)] mr-2" />
                      <div className="text-sm font-medium text-gray-200">Networking Expert</div>
                    </div>
                    <div className="mt-3 flex items-center text-gray-400">
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-[var(--matrix-color)]/70 animate-bounce [animation-delay:0ms]"></div>
                        <div className="h-2 w-2 rounded-full bg-[var(--matrix-color)]/70 animate-bounce [animation-delay:150ms]"></div>
                        <div className="h-2 w-2 rounded-full bg-[var(--matrix-color)]/70 animate-bounce [animation-delay:300ms]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-center text-red-400">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p>{error}</p>
                      <button 
                        onClick={resetChat} 
                        className="text-red-300 underline text-sm mt-1 hover:text-red-200"
                      >
                        Reset the conversation
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
              
              {messages.length > 3 && (
                <div className="flex justify-center">
                  <button 
                    onClick={scrollToBottom} 
                    className="cyber-button px-3 py-2 flex items-center text-sm"
                  >
                    <ChevronsDown className="h-4 w-4 mr-1" />
                    Scroll to bottom
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Upload Panel */}
      {showFileUpload && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-300 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-[var(--matrix-color)]" />
                Upload Files
              </h3>
              <button 
                onClick={() => setShowFileUpload(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
            <p className="text-xs text-gray-400 mt-2">
              Files will be processed and searchable by the AI to help answer your questions.
            </p>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map(attachment => (
                <div 
                  key={attachment.id}
                  className="bg-gray-700 rounded-full py-1 px-3 flex items-center text-sm text-gray-300"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-[var(--matrix-color)]" />
                  <span className="truncate max-w-[150px]">{attachment.filename}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="ml-1.5 text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about networking, cybersecurity, or programming..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pr-24 text-white placeholder-gray-400 focus:border-[var(--matrix-color)] focus:ring focus:ring-[var(--matrix-color)]/20 focus:outline-none transition-all duration-200"
              rows={2}
              disabled={loading || initializing || !threadId}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                disabled={loading || initializing || !threadId}
                className={`rounded-full p-2 ${
                  loading || initializing || !threadId
                    ? 'text-gray-500 bg-gray-600 cursor-not-allowed'
                    : 'text-gray-300 bg-gray-600 hover:bg-gray-500'
                } transition-all duration-200`}
                title="Attach files"
              >
                <FileUp className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={loading || initializing || (!newMessage.trim() && attachments.length === 0) || !threadId}
                className={`rounded-full p-2 ${
                  loading || initializing || (!newMessage.trim() && attachments.length === 0) || !threadId
                    ? 'text-gray-500 bg-gray-600 cursor-not-allowed'
                    : 'text-[var(--matrix-color)] bg-[var(--matrix-color)]/10 hover:bg-[var(--matrix-color)]/20'
                } transition-all duration-200`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send. Shift+Enter for a new line. Powered by {apiProvider}.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
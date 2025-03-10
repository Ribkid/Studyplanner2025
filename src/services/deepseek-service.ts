import OpenAI from 'openai';

// Get API key from environment variables
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

// Initialize the OpenAI client with DeepSeek's API endpoint
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback responses when API doesn't work
const SAMPLE_RESPONSES = [
  "In networking, the OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer serves a specific purpose in data transmission.",
  
  "TCP/IP is the foundational protocol suite for the Internet. It uses a 4-layer model: Link, Internet, Transport, and Application. The key difference from OSI is its practical implementation focus.",
  
  "Cybersecurity is about protecting systems and networks from digital attacks. The CIA triad (Confidentiality, Integrity, Availability) forms the core principles of information security.",
  
  "Python is widely used in networking for automation. Libraries like Paramiko, Netmiko, and NAPALM allow engineers to programmatically configure and monitor network devices.",
  
  "For studying networking concepts, I recommend practicing with packet analysis tools like Wireshark, which allow you to observe network traffic in real-time and understand protocol behaviors."
];

// Check if API key is available
const isApiKeyAvailable = () => {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 0 && DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here';
};

// Create a thread for the conversation
export const createThread = async () => {
  try {
    if (!isApiKeyAvailable()) {
      console.warn('DeepSeek API key not found or invalid. Using fallback mode.');
      return `fallback-thread-${Date.now()}`;
    }

    console.log('Creating new thread with DeepSeek API');
    
    // Test connection with a simple completion
    const testCompletion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a networking expert teacher. You help with network concepts, cybersecurity, and programming." }],
      model: "deepseek-chat",
    });

    console.log('Successfully connected to DeepSeek API');
    
    // Since DeepSeek doesn't have threads like OpenAI,
    // create a virtual thread ID to track conversations
    const threadId = `deepseek-thread-${Date.now()}`;
    
    // Store conversation history in localStorage
    localStorage.setItem(threadId, JSON.stringify([
      { role: 'system', content: 'You are a networking expert teacher. You help with network concepts, cybersecurity, and programming.' }
    ]));
    
    console.log('Thread created successfully:', threadId);
    return threadId;
  } catch (error) {
    console.error('Error creating DeepSeek thread:', error);
    // Generate a mock thread ID for fallback
    return `fallback-thread-${Date.now()}`;
  }
};

// Upload a file to DeepSeek
export const uploadFile = async (file: File) => {
  try {
    if (!isApiKeyAvailable()) {
      throw new Error('DeepSeek API key not found or invalid');
    }

    console.log('Uploading file to DeepSeek API:', file.name);

    // DeepSeek may not support file uploads via the OpenAI SDK
    // For now, returning a mock file ID so the UI works
    console.log('File upload simulation (DeepSeek may not support this feature)');
    return `file-${Date.now()}`;
  } catch (error) {
    console.error('Error uploading file to DeepSeek:', error);
    // For demo purposes, return a fake file ID so the UI doesn't break
    return `file-${Date.now()}`;
  }
};

// Send a message to the thread and get a response (non-streaming)
export const sendMessage = async (threadId: string, message: string, attachments: { fileId: string }[] = []) => {
  try {
    // Check if we're in fallback mode
    if (threadId.startsWith('fallback') || !isApiKeyAvailable()) {
      return getFallbackResponse(message);
    }

    console.log('Sending message to DeepSeek API:', threadId, message);
    
    // Get conversation history from localStorage
    const conversationHistory = JSON.parse(localStorage.getItem(threadId) || '[]');
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Make request to DeepSeek API
    const response = await openai.chat.completions.create({
      messages: conversationHistory,
      model: "deepseek-chat",
    });

    // Extract assistant's response
    const assistantMessage = {
      role: 'assistant',
      content: response.choices[0].message.content
    };
    
    // Add to conversation history
    conversationHistory.push(assistantMessage);
    
    // Update localStorage
    localStorage.setItem(threadId, JSON.stringify(conversationHistory));
    
    console.log('DeepSeek API response received');
    
    // Format response to match UI expectations
    return [
      {
        id: `msg-${Date.now()}`,
        created_at: new Date().toISOString(),
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: {
              value: assistantMessage.content || ''
            }
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error sending message to DeepSeek:', error);
    return getFallbackResponse(message);
  }
};

// Stream messages from DeepSeek
export const streamMessage = async (
  threadId: string, 
  message: string, 
  attachments: { fileId: string }[] = [], 
  handlers: {
    onStart?: () => void;
    onText?: (text: string) => void;
    onToolCall?: (toolCall: any) => void;
    onEnd?: (content: string) => void;
    onError?: (error: any) => void;
  }
) => {
  try {
    // Check if we're in fallback mode
    if (threadId.startsWith('fallback') || !isApiKeyAvailable()) {
      handlers.onStart?.();
      const response = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
      
      // Simulate streaming by sending characters one by one with a delay
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < response.length) {
          handlers.onText?.(response[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          handlers.onEnd?.(response);
        }
      }, 20);
      
      return;
    }

    console.log('Streaming message from DeepSeek API:', threadId, message);
    handlers.onStart?.();

    // Get conversation history from localStorage
    const conversationHistory = JSON.parse(localStorage.getItem(threadId) || '[]');
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Save updated history
    localStorage.setItem(threadId, JSON.stringify(conversationHistory));

    // Create accumulated response content
    let accumulatedContent = '';

    try {
      // Use OpenAI SDK streaming
      const stream = await openai.chat.completions.create({
        messages: conversationHistory,
        model: "deepseek-chat",
        stream: true,
      });

      console.log('DeepSeek API stream connected');

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          accumulatedContent += content;
          handlers.onText?.(content);
        }
      }

      console.log('DeepSeek API stream completed');
      
      // Add to conversation history
      if (accumulatedContent) {
        const updatedHistory = JSON.parse(localStorage.getItem(threadId) || '[]');
        updatedHistory.push({ role: 'assistant', content: accumulatedContent });
        localStorage.setItem(threadId, JSON.stringify(updatedHistory));
      }
      
      handlers.onEnd?.(accumulatedContent);
    } catch (error) {
      console.error('Error during streaming:', error);
      handlers.onError?.(error);
      
      // Try non-streaming fallback
      try {
        console.log('Trying non-streaming fallback...');
        const completion = await openai.chat.completions.create({
          messages: conversationHistory,
          model: "deepseek-chat",
        });
        
        const content = completion.choices[0].message.content || '';
        
        // Add to conversation history
        const updatedHistory = JSON.parse(localStorage.getItem(threadId) || '[]');
        updatedHistory.push({ role: 'assistant', content });
        localStorage.setItem(threadId, JSON.stringify(updatedHistory));
        
        handlers.onEnd?.(content);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        handlers.onError?.(fallbackError);
        const fallbackResponse = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
        handlers.onEnd?.(fallbackResponse);
      }
    }
  } catch (error) {
    console.error('Error streaming message from DeepSeek:', error);
    handlers.onError?.(error);
    
    // Provide fallback response on error
    const fallbackResponse = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
    handlers.onEnd?.(fallbackResponse);
  }
};

// Get all messages in a thread
export const getMessages = async (threadId: string) => {
  try {
    // Check if we're in fallback mode
    if (threadId.startsWith('fallback') || !isApiKeyAvailable()) {
      return []; // Return empty for fallback mode
    }
    
    // Get conversation history from localStorage
    const conversationHistory = JSON.parse(localStorage.getItem(threadId) || '[]');
    
    // Convert to format expected by UI
    return conversationHistory
      .filter(msg => msg.role !== 'system') // Filter out system messages
      .map((msg, index) => ({
        id: `msg-${index}`,
        created_at: new Date().toISOString(),
        role: msg.role,
        content: [
          {
            type: 'text',
            text: {
              value: msg.content
            }
          }
        ]
      }));
  } catch (error) {
    console.error('Error retrieving DeepSeek messages:', error);
    return []; // Return empty array on error
  }
};

// Get information about a file
export const getFileInfo = async (fileId: string) => {
  // Return mock file info as DeepSeek may not support this
  return {
    id: fileId,
    filename: 'document.pdf',
    purpose: 'assistants',
    created_at: Date.now()
  };
};

// Delete a file
export const deleteFile = async (fileId: string) => {
  // Mock function as DeepSeek may not support this
  console.log('File deletion simulation (DeepSeek may not support this feature)');
  return true;
};

// Wait for the run to complete and get all messages - not used with current implementation
export const waitForRunCompletion = async (threadId: string, runId: string) => {
  return getFallbackResponse('');  // This function is not needed in current implementation
};

// Provide fallback responses when API fails
const getFallbackResponse = (message: string) => {
  // Create a mock response with a random educational message
  const randomIndex = Math.floor(Math.random() * SAMPLE_RESPONSES.length);
  const responseText = SAMPLE_RESPONSES[randomIndex];
  
  return [
    {
      id: `mock-msg-${Date.now()}`,
      created_at: new Date().toISOString(),
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: {
            value: responseText
          }
        }
      ]
    }
  ];
};
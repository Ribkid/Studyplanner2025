import OpenAI from 'openai';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable in browser usage
});

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID;

// File search configuration
const FILE_SEARCH_CONFIG = {
  maxChunkSize: 800,
  chunkOverlap: 400,
  maxResults: 20,
  ranking: {
    ranker: 'auto',
    score_threshold: 0.7
  }
};

// Sample response for demo/fallback in case API doesn't work
const SAMPLE_RESPONSES = [
  "In networking, the OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer serves a specific purpose in data transmission.",
  
  "TCP/IP is the foundational protocol suite for the Internet. It uses a 4-layer model: Link, Internet, Transport, and Application. The key difference from OSI is its practical implementation focus.",
  
  "Cybersecurity is about protecting systems and networks from digital attacks. The CIA triad (Confidentiality, Integrity, Availability) forms the core principles of information security.",
  
  "Python is widely used in networking for automation. Libraries like Paramiko, Netmiko, and NAPALM allow engineers to programmatically configure and monitor network devices.",
  
  "For studying networking concepts, I recommend practicing with packet analysis tools like Wireshark, which allow you to observe network traffic in real-time and understand protocol behaviors."
];

// Create a thread for the conversation
export const createThread = async () => {
  try {
    console.log('Creating new OpenAI thread');
    const thread = await openai.beta.threads.create();
    console.log('Thread created successfully:', thread.id);
    return thread.id;
  } catch (error) {
    console.error('Error creating OpenAI thread:', error);
    // Generate a mock thread ID for fallback
    return `fallback-thread-${Date.now()}`;
  }
};

// Upload a file to OpenAI
export const uploadFile = async (file: File) => {
  try {
    console.log('Uploading file to OpenAI:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'assistants');

    // Use fetch for file upload since OpenAI SDK doesn't support browser file uploads well
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('File uploaded successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error uploading file to OpenAI:', error);
    throw error;
  }
};

// Create a vector store
export const createVectorStore = async (name: string, fileIds: string[]) => {
  try {
    const vectorStore = await openai.beta.vectorStores.create({
      name,
      file_ids: fileIds
    });
    
    return vectorStore.id;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
};

// Send a message to the thread and get the assistant's response
// Non-streaming version
export const sendMessage = async (threadId: string, message: string, attachments: { fileId: string }[] = []) => {
  try {
    // Check if we're in fallback mode
    if (threadId.startsWith('fallback')) {
      return getFallbackResponse(message);
    }

    console.log('Sending message to OpenAI thread:', threadId, message);

    // Prepare message content with file attachments if any
    const messageParams: any = {
      role: 'user',
      content: message
    };

    // Add attachments if provided
    if (attachments.length > 0) {
      messageParams.attachments = attachments.map(attachment => ({
        file_id: attachment.fileId,
        tools: [{ type: 'file_search' }]
      }));
    }

    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, messageParams);

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID || 'asst_hHwMyzddEoW4ckYy20oti1ne',
      tools: [{
        type: 'file_search',
        max_results: FILE_SEARCH_CONFIG.maxResults,
        ranking_options: {
          ranker: FILE_SEARCH_CONFIG.ranking.ranker,
          score_threshold: FILE_SEARCH_CONFIG.ranking.score_threshold
        }
      }]
    });

    // Poll for the run to complete
    const response = await waitForRunCompletion(threadId, run.id);
    return response;
  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    return getFallbackResponse(message);
  }
};

// Send a message and stream the response
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
    if (threadId.startsWith('fallback')) {
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

    console.log('Streaming message from OpenAI thread:', threadId, message);

    // Prepare message content with file attachments if any
    const messageParams: any = {
      role: 'user',
      content: message
    };

    // Add attachments if provided
    if (attachments.length > 0) {
      messageParams.attachments = attachments.map(attachment => ({
        file_id: attachment.fileId,
        tools: [{ type: 'file_search' }]
      }));
    }

    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, messageParams);

    // Create accumulated response content
    let accumulatedContent = '';

    // Stream the assistant's response
    handlers.onStart?.();
    
    const stream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: ASSISTANT_ID || 'asst_hHwMyzddEoW4ckYy20oti1ne',
      tools: [{
        type: 'file_search',
        max_results: FILE_SEARCH_CONFIG.maxResults,
        ranking_options: {
          ranker: FILE_SEARCH_CONFIG.ranking.ranker,
          score_threshold: FILE_SEARCH_CONFIG.ranking.score_threshold
        }
      }]
    });

    console.log('OpenAI stream connected');

    stream
      .on('textCreated', (text) => {
        // Text message has been created
        console.log('Text message created');
      })
      .on('textDelta', (textDelta, snapshot) => {
        // Text is being streamed
        if (textDelta.value) {
          accumulatedContent += textDelta.value;
          handlers.onText?.(textDelta.value);
        }
      })
      .on('toolCallCreated', (toolCall) => {
        // Tool call has been created
        console.log('Tool call created:', toolCall.type);
        handlers.onToolCall?.(toolCall);
      })
      .on('toolCallDelta', (toolCallDelta, snapshot) => {
        // Tool call is being updated
        if (toolCallDelta.type === 'file_search') {
          // Handle file search tool call
          console.log('File search tool call updated');
        }
      })
      .on('messageDone', (message) => {
        // Message is complete
        console.log('Message completed');
        handlers.onEnd?.(accumulatedContent);
      })
      .on('error', (error) => {
        // Handle errors
        console.error('Stream error:', error);
        handlers.onError?.(error);
      });

    // Start the stream
    await stream.done();

  } catch (error) {
    console.error('Error streaming message from OpenAI:', error);
    handlers.onError?.(error);
    
    // Try fallback non-streaming approach
    try {
      console.log('Trying non-streaming fallback...');
      const { data: messages } = await openai.beta.threads.messages.list(threadId);
      if (messages && messages.length > 0) {
        // Format text content from the latest assistant message
        const assistantMessage = messages.find(m => m.role === 'assistant');
        if (assistantMessage && assistantMessage.content) {
          const contentText = assistantMessage.content
            .filter(content => content.type === 'text')
            .map(content => content.text.value)
            .join('\n');
          
          handlers.onEnd?.(contentText);
          return;
        }
      }
      throw new Error('No message content found in fallback');
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      const fallbackResponse = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
      handlers.onEnd?.(fallbackResponse);
    }
  }
};

// Wait for the run to complete and get all messages
export const waitForRunCompletion = async (threadId: string, runId: string) => {
  let run;
  let attempts = 0;
  const maxAttempts = 30; // Maximum polling attempts (30 seconds)
  
  do {
    try {
      // Wait for 1 second before checking status
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check the run status
      run = await openai.beta.threads.runs.retrieve(threadId, runId, {
        include: ['step_details.tool_calls[*].file_search.results[*].content']
      });

      attempts++;
      console.log(`Run status (attempt ${attempts}): ${run.status}`);

      // Log file search results if available
      if (run.step_details?.tool_calls) {
        run.step_details.tool_calls.forEach(toolCall => {
          if (toolCall.type === 'file_search' && toolCall.file_search?.results) {
            console.log('File search results:', toolCall.file_search.results);
          }
        });
      }
      
      // Break if taking too long
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out');
      }
    } catch (error) {
      console.error('Error checking run status:', error);
      throw error;
    }
  } while (run.status === 'queued' || run.status === 'in_progress');

  // If run completed successfully, get the messages
  if (run.status === 'completed') {
    try {
      const messages = await openai.beta.threads.messages.list(threadId);
      return messages.data;
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw error;
    }
  } else {
    // Handle error cases
    console.error(`Run ended with status: ${run.status}`);
    throw new Error(`Run ended with status: ${run.status}`);
  }
};

// Get all messages in a thread
export const getMessages = async (threadId: string) => {
  try {
    // Check if we're in fallback mode
    if (threadId.startsWith('fallback')) {
      return []; // Return empty for fallback mode
    }
    
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
  } catch (error) {
    console.error('Error retrieving OpenAI messages:', error);
    return []; // Return empty array on error
  }
};

// Get information about a file
export const getFileInfo = async (fileId: string) => {
  try {
    const file = await openai.files.retrieve(fileId);
    return file;
  } catch (error) {
    console.error('Error retrieving file info:', error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (fileId: string) => {
  try {
    await openai.files.del(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
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

import type { NextPage } from "next";
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat_openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: input }]
        }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const reader = response.body?.getReader();
      let currentMessage = { role: "assistant", content: "" };
      setMessages(prev => [...prev, currentMessage]);

      const decoder = new TextDecoder();
      let buffer = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmedLine.slice(5));
                if (data.error) throw new Error(data.error);
                if (data.content) {
                  currentMessage.content += data.content;
                  setMessages(prev => [...prev.slice(0, -1), { ...currentMessage }]);
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }
        
        if (buffer.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.trim().slice(5));
            if (data.content) {
              currentMessage.content += data.content;
              setMessages(prev => [...prev.slice(0, -1), { ...currentMessage }]);
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-10 box-border min-h-screen flex flex-col">
      <Head>
        <title>💁‍♀️ Kate Klips 📋</title>
        <meta name="description" content="💁‍♀️ Kate Klips 📋" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col items-center w-full">
        <h1 className="text-2xl mb-2.5">💁‍♀️ Kate Klips 📋</h1>
        
        <div className="w-full max-w-3xl h-[75vh] overflow-y-auto border border-gray-200 rounded-lg p-3 my-2">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`m-4 p-4 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-blue-50 ml-auto' 
                  : 'bg-gray-100 mr-auto'
              }`}
            >
              <ReactMarkdown 
                className="prose prose-sm max-w-none"
                components={{
                  p: ({children}) => <p className="my-2">{children}</p>,
                  code: ({children}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{children}</code>,
                  pre: ({children}) => <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{children}</pre>,
                  ul: ({children}) => <ul className="my-2 pl-6">{children}</ul>,
                  ol: ({children}) => <ol className="my-2 pl-6">{children}</ol>,
                  h1: ({children}) => <h1 className="my-2">{children}</h1>,
                  h2: ({children}) => <h2 className="my-2">{children}</h2>,
                  h3: ({children}) => <h3 className="my-2">{children}</h3>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className="text-center p-4 text-gray-600">Loading...</div>}
          {error && <div className="bg-red-50 text-red-800 p-4 my-4 rounded border border-red-200">{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-200 rounded text-base"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default Home;


import type { NextPage } from "next";
import React, { useState } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
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
          
          // Keep the last partial line in the buffer
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
        
        // Process any remaining data in the buffer
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
    <div className={styles.container}>
      <Head>
        <title>💁‍♀️ Kate Klips 📋</title>
        <meta name="description" content="💁‍♀️ Kate Klips 📋" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>💁‍♀️ Kate Klips 📋</h1>
        
        <div className={styles.chatContainer}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className={styles.loading}>Loading...</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={isLoading}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default Home;

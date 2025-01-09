
import type { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: input }]
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
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
        <title>Groq Chat Interface</title>
        <meta name="description" content="Chat with LLaMA using Groq" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Chat with LLaMA</h1>
        
        <div className={styles.chatContainer}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className={styles.loading}>Loading...</div>}
          {error && <div className={styles.error}>{error}</div>}
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

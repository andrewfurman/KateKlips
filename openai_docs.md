Integrating the ChatGPT API into your Next.js application enables you to build interactive AI-powered features. Below is a step-by-step guide to help you set up this integration:

**1. Obtain an OpenAI API Key**

- **Sign Up**: Create an account on the OpenAI platform.
- **Generate API Key**: After logging in, navigate to the API Keys section and create a new secret key. Ensure you store this key securely, as it will not be displayed again. ([Adam Fard UX Studio](https://adamfard.com/blog/how-to-use-chatgpt-api?utm_source=chatgpt.com))

**2. Set Up Your Next.js Project**

- **Initialize the Project**: Use the following command to create a new Next.js project:

  ```bash
  npx create-next-app@latest your-project-name
  ```

- **Navigate to the Project Directory**:

  ```bash
  cd your-project-name
  ```

**3. Install Required Dependencies**

- **OpenAI Node.js Library**: Install the OpenAI library to facilitate API interactions:

  ```bash
  npm install openai
  ```

**4. Configure Environment Variables**

- **Create Environment File**: In the root of your project, create a `.env.local` file.
- **Add API Key**: Insert your OpenAI API key into the `.env.local` file:

  ```env
  OPENAI_API_KEY=your_openai_api_key
  ```

**5. Develop the API Route**

Next.js allows the creation of API routes to handle server-side logic.

- **Create API Directory**: Inside the `pages` directory, create a folder named `api`.
- **Create API File**: Within the `api` folder, create a file named `chat.js`.
- **Implement the API Logic**: Add the following code to handle requests to the ChatGPT API:

  ```javascript
  // pages/api/chat.js
  import { Configuration, OpenAIApi } from 'openai';

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      });

      const assistantMessage = response.data.choices[0].message.content;
      res.status(200).json({ message: assistantMessage });
    } catch (error) {
      res.status(500).json({ message: 'Error communicating with OpenAI', error: error.message });
    }
  }
  ```

**6. Create the Frontend Component**

Develop a simple interface to interact with the API.

- **Modify the Home Page**: Update `pages/index.js` with the following code:

  ```javascript
  // pages/index.js
  import { useState } from 'react';

  export default function Home() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setResponse(data.message);
    };

    return (
      <div>
        <h1>Chat with AI</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here"
          />
          <button type="submit">Send</button>
        </form>
        {response && (
          <div>
            <h2>Response:</h2>
            <p>{response}</p>
          </div>
        )}
      </div>
    );
  }
  ```

**7. Run the Application**

- **Start the Development Server**:

  ```bash
  npm run dev
  ```

- **Access the Application**: Open your browser and navigate to `http://localhost:3000` to interact with your ChatGPT-powered Next.js app.

**8. Deployment Considerations**

When deploying your application, ensure that environment variables like the OpenAI API key are securely managed. Platforms such as Vercel or Netlify offer seamless integration with Next.js and support environment variables, which are required to store your OpenAI API key securely. ([GitHub](https://github.com/jakeprins/nextjs-chatgpt-tutorial?utm_source=chatgpt.com))

By following these steps, you can successfully integrate the ChatGPT API into your Next.js application, enabling dynamic AI-driven interactions. 
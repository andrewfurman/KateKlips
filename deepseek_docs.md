Your First API Call
The DeepSeek API uses an API format compatible with OpenAI. By modifying the configuration, you can use the OpenAI SDK or softwares compatible with the OpenAI API to access the DeepSeek API.

PARAM	VALUE
base_url *       	https://api.deepseek.com
api_key	apply for an API key
* To be compatible with OpenAI, you can also use https://api.deepseek.com/v1 as the base_url. But note that the v1 here has NO relationship with the model's version.

* The deepseek-chat model has been upgraded to DeepSeek-V3. The API remains unchanged. You can invoke DeepSeek-V3 by specifying model='deepseek-chat'.

* deepseek-reasoner is the latest reasoning model, DeepSeek-R1, released by DeepSeek. You can invoke DeepSeek-R1 by specifying model='deepseek-reasoner'.

Invoke The Chat API
Once you have obtained an API key, you can access the DeepSeek API using the following example scripts. This is a non-stream example, you can set the stream parameter to true to get stream response.

curl
python
nodejs
// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: '<DeepSeek API Key>'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();

Models & Pricing
The prices listed below are in unites of per 1M tokens. A token, the smallest unit of text that the model recognizes, can be a word, a number, or even a punctuation mark. We will bill based on the total number of input and output tokens by the model.

Pricing Details
USD
CNY
MODEL(1)	CONTEXT LENGTH	MAX COT TOKENS(2)	MAX OUTPUT TOKENS(3)	1M TOKENS
INPUT PRICE
(CACHE HIT) (4)	1M TOKENS
INPUT PRICE
(CACHE MISS)	1M TOKENS
OUTPUT PRICE
deepseek-chat	64K	-	8K	$0.07(5)
$0.014	$0.27(5)
$0.14	$1.10(5)
$0.28
deepseek-reasoner	64K	32K	8K	$0.14	$0.55	$2.19 (6)
(1) The deepseek-chat model has been upgraded to DeepSeek-V3. deepseek-reasoner points to the new model DeepSeek-R1.
(2) CoT (Chain of Thought) is the reasoning content deepseek-reasoner gives before output the final answer. For details, please refer to Reasoning Model。
(3) If max_tokens is not specified, the default maximum output length is 4K. Please adjust max_tokens to support longer outputs.
(4) Please check DeepSeek Context Caching for the details of Context Caching.
(5) The form shows the the original price and the discounted price. From now until 2025-02-08 16:00 (UTC), all users can enjoy the discounted prices of DeepSeek API. After that, it will recover to full price. DeepSeek-R1 is not included in the discount.
(6) The output token count of deepseek-reasoner includes all tokens from CoT and the final answer, and they are priced equally.
Deduction Rules
The expense = number of tokens × price. The corresponding fees will be directly deducted from your topped-up balance or granted balance, with a preference for using the granted balance first when both balances are available.

Product prices may vary and DeepSeek reserves the right to adjust them. We recommend topping up based on your actual usage and regularly checking this page for the most recent pricing information.

Rate Limit
DeepSeek API does NOT constrain user's rate limit. We will try out best to serve every request.

However, please note that when our servers are under high traffic pressure, your requests may take some time to receive a response from the server. During this period, your HTTP request will remain connected, and you may continuously receive contents in the following formats:

Non-streaming requests: Continuously return empty lines
Streaming requests: Continuously return SSE keep-alive comments (: keep-alive)
These contents do not affect the parsing of the JSON body by the OpenAI SDK. If you are parsing the HTTP responses yourself, please ensure to handle these empty lines or comments appropriately.

If the request is still not completed after 30 minutes, the server will close the connection.


Error Codes
When calling DeepSeek API, you may encounter errors. Here list the causes and solutions.

                    CODE                    	DESCRIPTION
400 - Invalid Format	Cause: Invalid request body format.
Solution: Please modify your request body according to the hints in the error message. For more API format details, please refer to DeepSeek API Docs.
401 - Authentication Fails	Cause: Authentication fails due to the wrong API key.
Solution: Please check your API key. If you don't have one, please create an API key first.
402 - Insufficient Balance	Cause: You have run out of balance.
Solution: Please check your account's balance, and go to the Top up page to add funds.
422 - Invalid Parameters	Cause: Your request contains invalid parameters.
Solution: Please modify your request parameters according to the hints in the error message. For more API format details, please refer to DeepSeek API Docs.
429 - Rate Limit Reached	Cause: You are sending requests too quickly.
Solution: Please pace your requests reasonably. We also advise users to temporarily switch to the APIs of alternative LLM service providers, like OpenAI.
500 - Server Error	Cause: Our server encounters an issue.
Solution: Please retry your request after a brief wait and contact us if the issue persists.
503 - Server Overloaded	Cause: The server is overloaded due to high traffic.
Solution: Please retry your request after a brief wait.
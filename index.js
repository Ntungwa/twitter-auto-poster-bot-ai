// By VishwaGauravIn (https://itsvg.in)

const OpenAI = require("openai");
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

// Initialize the client to point to Vercel AI Gateway
const gateway = new OpenAI({
  baseURL: 'https://ai-gateway.vercel.sh/v1', // Vercel AI Gateway endpoint
  apiKey: SECRETS.AI_GATEWAY_API_KEY,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const prompt = "generate bayern munich content, tips and tricks or something new or some rant or some advice as a tweet, it should not be vague and should be unique; under 280 characters and should be plain text, you can use emojis";

  let maxRetries = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      console.log(`Attempt ${attempt + 1}: Requesting content via Vercel AI Gateway...`);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000)
      );

      const apiCall = gateway.chat.completions.create({
        model: "deepseek/deepseek-v4-flash", // Vercel model ID
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 1.3,
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.choices[0].message.content;
      
      console.log("Generated Tweet:\n", text);
      
      await sendTweet(text);
      success = true; 
      
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= maxRetries) {
        console.error("Max retries reached. Could not get a response from Vercel AI Gateway.");
      } else {
        console.log("Retrying in 5 seconds...");
        await delay(5000); 
      }
    }
  }
}

run();

async function sendTweet(tweetText) {
  try {
    await twitterClient.v2.tweet(tweetText);
    console.log("Tweet sent successfully!");
  } catch (error) {
    console.error("Error sending tweet:", error);
  }
        }

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

// Initialize DeepSeek using the OpenAI SDK
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: SECRETS.DEEPSEEK_API_KEY,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  // Your prompt, untouched
  const prompt = "generate bayern munich content, tips and tricks or something new or some rant or some advice as a tweet, it should not be vague and should be unique; under 280 characters and should be plain text, you can use emojis";

  let maxRetries = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      console.log(`Attempt ${attempt + 1}: Requesting content from DeepSeek...`);
      
      // 30-second timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000)
      );

      // Call DeepSeek API with the correct current model
      const apiCall = deepseek.chat.completions.create({
        model: "deepseek-flash", // Updated to the correct current model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 1.3, // DeepSeek recommends higher temp for creative/rant content
      });

      // Race the API call against the timeout
      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.choices[0].message.content;
      
      console.log("Generated Tweet:\n", text);
      
      await sendTweet(text);
      success = true; 
      
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= maxRetries) {
        console.error("Max retries reached. Could not get a response from DeepSeek.");
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

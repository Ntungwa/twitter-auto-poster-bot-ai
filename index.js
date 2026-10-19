// By VishwaGauravIn (https://itsvg.in)

const { GoogleGenAI } = require("@google/genai"); 
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const ai = new GoogleGenAI({ apiKey: SECRETS.GEMINI_API_KEY });

// Helper function to pause execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const prompt =
    "generate bayern munich content, tips and tricks or something new or some rant or some advice as a tweet, it should not be vague and should be unique; under 280 characters and should be plain text, you can use emojis";

  let maxRetries = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      console.log(`Attempt ${attempt + 1}: Requesting content from Gemini...`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          maxOutputTokens: 400,
        }
      });

      const text = response.text;
      console.log("Generated Tweet:\n", text);
      
      await sendTweet(text);
      success = true; // Breaks the loop if successful
      
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= maxRetries) {
        console.error("Max retries reached. Google's servers are too busy right now.");
      } else {
        console.log("Server busy (503 error). Waiting 5 seconds before retrying...");
        await delay(5000); // Wait 5 seconds before trying again
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

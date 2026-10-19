// By VishwaGauravIn (https://itsvg.in)

const { GoogleGenAI } = require("@google/genai"); // Changed to new SDK
const { TwitterApi } = require("twitter-api-v2");
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

// Initialize the new SDK client
const ai = new GoogleGenAI({ apiKey: SECRETS.GEMINI_API_KEY });

async function run() {
  // Write your prompt here
  const prompt =
    "generate bayern munich content, tips and tricks or something new or some rant or some advice as a tweet, it should not be vague and should be unique; under 280 characters and should be plain text, you can use emojis";

  try {
    // New SDK syntax for generating content
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 400,
      }
    });

    const text = response.text;
    console.log(text);
    await sendTweet(text);
  } catch (error) {
    console.error("Error generating content:", error);
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

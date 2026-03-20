import OpenAI from "openai";

const endpoint = "https://azureopen-ai-digital.openai.azure.com/openai/v1/";
const modelName = "gpt-4o";
const deployment_name = "gpt-4o";
const api_key = process.env.AZURE_OPENAI_KEY;

const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
       {
                "role": "user",
                "content": "I am going to Paris, what should I see?"
            },
            {
                "role": "assistant",
                "content": "Paris, the capital of France, is known for its stunning architecture, art museums, historical landmarks, and romantic atmosphere. Here are some of the top attractions to see in Paris:\n\n1. The Eiffel Tower: The iconic Eiffel Tower is one of the most recognizable landmarks in the world and offers breathtaking views of the city.\n2. The Louvre Museum: The Louvre is one of the worlds largest and most famous museums, housing an impressive collection of art and artifacts, including the Mona Lisa.\n3. Notre-Dame Cathedral: This beautiful cathedral is one of the most famous landmarks in Paris and is known for its Gothic architecture and stunning stained glass windows.\n\nThese are just a few of the many attractions that Paris has to offer. With so much to see and do, its no wonder that Paris is one of the most popular tourist destinations in the world."
            },
            {
                "role": "user",
                "content": "What is so great about #1?"
            }
    ],
    model: deployment_name,
  });

  console.log(completion.choices[0]);
}

main();
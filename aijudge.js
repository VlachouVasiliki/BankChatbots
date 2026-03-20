//require('dotenv').config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { setGlobalDispatcher, ProxyAgent } = require("undici");
import OpenAI from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deployment_name = "gpt-4o";
const api_key = process.env.AZURE_OPENAI_KEY;

const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key,
});


async function compareAnswers(resultsArray) {
        const myPrompt = `
        Σύγκρινε τις παρακάτω απαντήσεις από 4 τράπεζες και ανάδειξε την πιο συμφέρουσα επιλογή.
        
        ΔΕΔΟΜΕΝΑ:
        ${JSON.stringify(resultsArray, null, 2)}
        
        ΟΔΗΓΙΕΣ:
        1. Απάντησε στα Ελληνικά.
        2. Χρησιμοποίησε bullet points.
        3. Αν κάποια τράπεζα δεν δίνει σαφή στοιχεία, επισήμανέ το.
        4. Στο τέλος, δώσε μια "Πρόταση Συμβούλου" με μία πρόταση.`;
try {
        const completion = await client.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": "Είσαι ένας έμπειρος τραπεζικός αναλυτής."
                },
                {
                    "role": "user",
                    "content": myPrompt
                }
            ],
            model: deployment_name,
        });

        // Επιστρέφουμε το κείμενο της απάντησης
        return completion.choices[0].message.content;

    } catch (err) {
        console.error("Σφάλμα στην compareAnswers:", err);
        return "Δυστυχώς δεν μπόρεσα να ολοκληρώσω τη σύγκριση.";
    }
        
}

export { compareAnswers };
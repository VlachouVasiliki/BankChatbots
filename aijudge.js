const { GoogleGenerativeAI } = require("@google/generative-ai");

async function compareAnswers(resultsArray) {
    // resultsArray: [{bank: 'alpha', text: '...'}, {bank: 'nbg', text: '...'}, κτλ]
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Είσαι ειδικός τραπεζικός σύμβουλος. Σου δίνω 4 απαντήσεις από chatbots τραπεζών.
    Σύγκρινέ τις και πες μου ποια προσφέρει το καλύτερο επιτόκιο ή όρο για την ερώτηση.
    
    ΔΕΔΟΜΕΝΑ:
    ${JSON.stringify(resultsArray, null, 2)}
    
    Απάντησε στα Ελληνικά, σύντομα και με bullets.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { compareAnswers };
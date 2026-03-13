const { compareAnswers } = require('../aijudge');

module.exports = async function (context, req) {
    context.log('Ξεκινάει η τελική σύγκριση από το AI...');

    // Το Power App θα στέλνει ένα array με τις 4 απαντήσεις
    const { answers } = req.body; 

    if (!answers || !Array.isArray(answers)) {
        context.res = { status: 400, body: "Λείπουν οι απαντήσεις για σύγκριση" };
        return;
    }

    try {
        const analysis = await compareAnswers(answers);
        context.res = {
            status: 200,
            body: { finalAnalysis: analysis }
        };
    } catch (error) {
        context.log.error(error);
        context.res = { status: 500, body: "Το AI απέτυχε: " + error.message };
    }
};
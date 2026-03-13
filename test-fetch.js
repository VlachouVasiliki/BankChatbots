const { fetch, Agent } = require('undici');

async function test() {
    try {
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=ΤΟ_ΚΛΕΙΔΙ_ΣΟΥ', {
            dispatcher: new Agent({ connect: { timeout: 10000 } })
        });
        const data = await res.json();
        console.log("Success:", data);
    } catch (e) {
        console.log("Fetch still fails:", e.message);
    }
}
test();
module.exports = {
    alpha: {
        url: 'https://www.alpha.gr',
        //cookieText: 'Αποδέχομαι',
        cookieBtn:'button:has-text("Αποδέχομαι"), #all_cookies_btn, .cookie-accept-btn',
        iframe: 'iframe[id^=moveo]', //iframe[src*="moveo"]',
        botBtn: '.launcher-btn',
        startBtn: null,
        checkbox: 'div[role="checkbox"]',
        checkboxAttr:'aria-checked',
        continueBtn: 'button:has-text("Συνέχεια")',
        input: 'textarea, [role="textbox"], input[placeholder*="γράψτε"]',
        //response: '.message-content, [class*="ChatMessage"], .bot-message, .quick-replies-container'
        response: '.markdown p, .markdown span, [data-event-type="brain_message"] p, .message-content'
    },
    // Εδώ θα προσθέσεις τις υπόλοιπες με την ίδια λογική
    euro: {
        url: 'https://www.eurobank.gr',
        cookieBtn: '#onetrust-accept-btn-handler', 
        iframe:null ,
        botBtn: 'button#open-converse, #open-converse',
        startBtn: null,
        checkbox: 'div.checkbox-container:has(#input-accept-terms-eva-chat-bot)',
        checkboxAttr:'class',
        continueBtn: '.convButtonCheckbox', 
        input: '#user-input',
        response: '.message-text'
    },
    nbg: {
        url: 'https://www.nbg.gr', 
        cookieBtn: '#onetrust-accept-btn-handler, button:has-text("Αποδοχή όλων")',
        iframe:null ,
        botBtn: 'div.chat-widget-root, .chat-widget-root img, [alt="Chat"]', //botBtn: 'div.chat-widget-root',
        startBtn: 'button:has-text("Ας ξεκινήσουμε!")',
        checkbox: '#chat-widget-root div.chat-widget-container div:nth-child(2) > div > svg',
        checkboxAttr:'disabled-link',
        continueBtn: 'button:has-text("Συνέχεια")', 
        input: 'textarea.chat-input, textarea[placeholder*="μήνυμα"]',
        response: 'div[style*="rgb(247, 247, 247)"]'
    },
        piraeus: {
        url: 'https://www.piraeusbank.gr', 
        cookieBtn: '#onetrust-accept-btn-handler, button:has-text("Αποδοχή όλων των cookies")',
        iframe:null ,
        botBtn: null, //botBtn: 'div.chat-widget-root',
        startBtn: null,
        checkbox: 'p:has-text("Συμφωνώ με τους όρους")',
        checkboxAttr:null,
        continueBtn: null, 
        input:  'textarea#chatbotInput:visible',//'textarea.chat-input, textarea[placeholder*="μήνυμα"],
        response: ".pb-chatbot-answer"
    }
};
   
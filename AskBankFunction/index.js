//const express = require('express');
const { chromium } = require('playwright');
//const path = require('path');
const banks = require('../bots'); 

module.exports = async function (context, req) {
// 1. Παίρνουμε το όνομα της τράπεζας από το URL
context.log("εισαι μεσα στο function");
    const bankName = (context.bindingData.bankName || "").toLowerCase();
    //const bankName = context.bindingData.bankName;
    // 2. Παίρνουμε την ερώτηση από το σώμα του request (από το Power App)
    const { question } = req.body;
    
    const config = banks[bankName];
    if (!config) {
        context.res = { status: 400, body: "Τράπεζα δεν βρέθηκε" };
        return;
    }

    let browser;
    let page;

    try {
        browser = await chromium.launch({ 
        headless: false, // Δοκίμασέ το έτσι τώρα
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled' // Κρύβει ότι ελέγχεται από script
        ]
        });
        const browserContext = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });
        page = await browserContext.newPage(); 
        context.log(`Άνοιξε νέο tab για: ${bankName}`);

        await page.goto(config.url, { waitUntil: 'load', timeout: 60000 });
        
        // --- ΚΑΘΑΡΙΣΜΟΣ ΓΙΑ ΝΑ ΕΙΝΑΙ ΤΟ BOT "ΦΡΕΣΚΟ" ---
        const client = await page.context().newCDPSession(page);
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
        // Καθαρίζουμε και το Local Storage μέσω JavaScript
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        await page.reload({ waitUntil: 'load' });
        context.log(`Το ιστορικό για την ${bankName} καθαρίστηκε.`);
        await page.bringToFront();
        
        context.log(`--- Έναρξη διαδικασίας για ${bankName} ---`);
        await page.waitForTimeout(1000);
        try {
            context.log("Αναμονή για το banner των cookies...");
            //const cookieBtn = page.locator('button:has-text("Αποδέχομαι"), #all_cookies_btn, .cookie-accept-btn').first();
            const cookieBtn = page.locator(config.cookieBtn).first();
            // Περιμένουμε το κουμπί να εμφανιστεί στο DOM (attached)
            await cookieBtn.waitFor({ state: 'attached', timeout: 15000 });

            if (await cookieBtn.isVisible()) {
                await cookieBtn.click();//{ force: true }
                context.log("Τα cookies πατήθηκαν με επιτυχία.");
            } else {
                context.log("Το κουμπί cookies υπάρχει αλλά δεν είναι ορατό (ίσως κρυμμένο).");
            }
        } catch (e) {
            context.log("Το banner των cookies δεν βρέθηκε ή είναι ήδη κλειστό.");
        }

        let target;
        if (config.iframe) {
            context.log(`Αναζήτηση στο iframe: ${config.iframe}`);
            target = page.frameLocator(config.iframe);
        } else {
            context.log("Αναζήτηση απευθείας στην κεντρική σελίδα...");
            target = page;
        }

        // 3. ΕΝΤΟΠΙΣΜΟΣ ΚΑΙ ΠΑΤΗΜΑ ΚΟΥΜΠΙΟΥ
        // const botButton = target.locator(config.botBtn).first();
        // context.log(botButton);
        // try {
        //     await botButton.waitFor({ state: 'visible', timeout: 15000 });
        //     await botButton.focus();
        //     await botButton.click();//{ force: true }
        //     context.log("Ο ψηφιακός βοηθός άνοιξε.");
        // } catch (err) {
        //     context.log.error("Δεν βρέθηκε το κουμπί του bot:", err.message);
        //     throw new Error("Bot button not found");
        // }
        
        // await page.waitForTimeout(1000); // Χρόνος για να ανοίξει
        if (bankName !== 'piraeus') {
            context.log("Περιμένω τη σελίδα να ησυχάσει...");
            await page.waitForLoadState('networkidle'); // Περιμένει να σταματήσουν τα πολλά downloads
        //BOT BUTTON
            const botButton = target.locator(config.botBtn).first();

            // 1. Περιμένουμε να είναι attached στο DOM
            await botButton.waitFor({ state: 'attached', timeout: 10000 });

            // 2. Δοκιμάζουμε να το πατήσουμε κανονικά
            try {
                // Scroll για να έρθει στο οπτικό πεδίο αν είναι κρυμμένο
                await botButton.scrollIntoViewIfNeeded();
                
                // Αν είναι η Εθνική (που ξέρουμε ότι έχει interceptor), 
                // δοκιμάζουμε το click() αλλά με μικρό timeout
                await botButton.click({ timeout: 5000 }); 
            } catch (e) {
                context.log("Το κανονικό κλικ απέτυχε, δοκιμάζω evaluate click...");
                // 3. Το "Safe" Bypass: Κλικ μέσω JavaScript (δουλεύει παντού και δεν το σταματάει κανένα div overlay)
                await botButton.evaluate(node => node.click());
            }
            
            //Αν έχει ένα έξτρα button για να ξεκινησει η συνομιλια
            if (config.startBtn) {
                context.log("Πατάω το 'Ας ξεκινήσουμε'...");
                // Περιμένουμε λίγο να εμφανιστεί το κουμπί μετά το άνοιγμα του chat
                await page.waitForSelector(config.startBtn, { visible: true, timeout: 5000 });
                await page.click(config.startBtn);
                context.log("Start button clicked!");
            }
            await page.waitForTimeout(2000);
            // 3. Checkbox & Συνέχεια (Προαιρετικό Check)
            try {
                const checkbox = target.locator(config.checkbox);
                context.log(checkbox);
                //await checkbox.waitFor({ state: 'attached', timeout: 10000 });
                await checkbox.waitFor({ state: 'visible', timeout: 10000 });

                let isChecked = false;
                context.log(config.checkboxAttr);
                // 1. Έλεγχος για Eurobank (έλεγχος κλάσης "checked")
                if (config.checkboxAttr === 'class') {
                    const classValue = await checkbox.getAttribute('class') || "";
                    const isChecked = classValue.split(' ').includes('checked');
                    context.log(`Περιέχει την κλάση checked; ${isChecked}`);
                } 
                // 2. Έλεγχος για Alpha (έλεγχος aria-checked)
                else if (config.checkboxAttr === 'aria-checked') {
                    const ariaValue = await checkbox.getAttribute('aria-checked');
                    isChecked = (ariaValue === 'true');
                }
                else if (config.checkboxAttr === 'disabled-link') {
                    const continueBtn = target.locator(config.continueBtn);
                    // Αν το κουμπί ΔΕΝ έχει disabled attribute, τότε θεωρούμε ότι το "checkbox" είναι Checked
                    const isDisabled = await continueBtn.getAttribute('disabled');
                    isChecked = (isDisabled === null); // Αν είναι null, το attribute δεν υπάρχει -> άρα είναι enabled/checked
                }

                context.log(`Τράπεζα: ${bankName}, Checked: ${isChecked}`);

                if (!isChecked) {
                    context.log("Το checkbox δεν είναι πατημένο. Το πατάω τώρα...");
                    await checkbox.click(); //{ force: true }
                    context.log("Οι όροι είναι αποδεκτοί.")
                    //await page.waitForTimeout(40000); // Wait for greeting
                }
                const continueBtn = target.locator(config.continueBtn);
                await continueBtn.click();//{ force: true }
            } catch (e) {
                context.log("Το checkbox δεν εμφανίστηκε ή είναι ήδη πατημένο, προχωράω στην ερώτηση...");
                // Αν το checkbox δεν βρεθεί σε 5'', το catch θα "πιάσει" το error και θα πάει κατευθείαν στο Βήμα 4
            }
        
            // 4. Ερώτηση
            const inputField = target.locator(config.input).first();
            context.log(inputField);
            await inputField.waitFor({ state: 'visible', timeout: 10000 });
            await inputField.fill(question);
            await page.keyboard.press('Enter');

            context.log("Η ερώτηση στάλθηκε.");
        }
        else {
            context.log("Πειραιώς: Στέλνω την πρώτη ερώτηση για να εμφανιστεί το chat...");
                const inputField = target.locator(config.input).first();
                context.log(inputField);
                await inputField.waitFor({ state: 'visible', timeout: 10000 });
                await inputField.click();
                await inputField.pressSequentially(question, { delay: 100 });
                await page.keyboard.press('Enter');
                
                context.log("Περιμένω να πεταχτεί το παράθυρο των όρων...");
                const checkbox = target.locator(config.checkbox);
                context.log(checkbox);
                //await checkbox.waitFor({ state: 'attached', timeout: 10000 });
                await checkbox.waitFor({ state: 'visible', timeout: 10000 });
                context.log("Το checkbox δεν είναι πατημένο για την Πειραιώς. Το πατάω τώρα...");
                await checkbox.click();
                // Τώρα το υπάρχον checkbox logic σου θα δουλέψει γιατί το checkbox θα είναι ορατό!
            }

        // 5. Απάντηση
        context.log("Περιμένω το bot να ολοκληρώσει τη σύνταξη...");
        // 1. Περιμένουμε να εμφανιστεί το ΤΕΛΕΥΤΑΙΟ μήνυμα (για να σιγουρευτούμε ότι ξεκίνησε η απάντηση)
        try {
            await target.locator(config.response).last().waitFor({ state: 'visible', timeout: 20000 });
        } catch (e) {
            context.log("Timeout περιμένοντας την απάντηση.");
        }
        // 2. Μικρή αναμονή για να προλάβει να "γράψει" όλο το κείμενο (ειδικά η Πειραιώς που κάνει stream)
        await page.waitForTimeout(15000); 
        // 3. Παίρνουμε ΟΛΑ τα μηνύματα
        const allTexts = await target.locator(config.response).allInnerTexts();

        // 4. Φιλτράρουμε τα κενά
        const cleanedTexts = allTexts.filter(t => t.trim().length > 0);

        // 5. Παίρνουμε τα τελευταία μηνύματα (π.χ. τα τελευταία 3) για να είμαστε σίγουροι ότι έχουμε την τρέχουσα απάντηση
        // Στην Πειραιώς συνήθως είναι 1 μεγάλο bubble, στην Εθνική μπορεί να είναι 2-3 μικρά.
        let botResponse = cleanedTexts.slice(-3).join('\n\n'); 

        if (!botResponse || botResponse.trim().length === 0) {
            botResponse = "Δεν μπόρεσα να διαβάσω το κείμενο. Μήπως το bot αργεί πολύ να απαντήσει;";
        }

        context.log("Απάντηση λήφθηκε επιτυχώς!");
        // await page.waitForTimeout(15000);
        // const messageElements = target.locator(config.response);
        // context.log(messageElements);
        
        // // Μαζεύουμε όλα τα κείμενα που υπάρχουν αυτή τη στιγμή
        // const allTexts = await messageElements.allInnerTexts();
        
        // // Φιλτράρουμε για να μην έχουμε κενά και παίρνουμε τα τελευταία μηνύματα
        // const cleanedTexts = allTexts.filter(t => t.trim().length > 0);
        
        // // Ενώνουμε τα τελευταία μηνύματα (σε περίπτωση που η απάντηση είναι σε πολλές παραγράφους)
        // let botResponse = cleanedTexts.slice(-5).join('\n'); 

        // if (!botResponse) {
        //     botResponse = "Δεν μπόρεσα να διαβάσω το κείμενο. Μήπως είναι ακόμα σε loading;";
        // }

        // context.log("Απάντηση λήφθηκε!");

        context.res = {
                    status: 200,
                    body: { reply: botResponse }
                };

            // context.res = {
            //         status: 200,
            //         body: { reply: "SUCK MY KISS" }
            //     };

    } catch (error) {
        context.log.error(error);
        context.res = { status: 500, body: error.message };
    }
    finally {
        if (page) {
            // Κλείνουμε μόνο το συγκεκριμένο tab, όχι όλο τον browser!
            context.log(`Κλείσιμο tab για: ${bankName}`);
            await page.close().catch(() => {}); 
        }
        if (browser) await browser.close(); // Αποσύνδεση χωρίς κλείσιμο του Chrome
    }
};


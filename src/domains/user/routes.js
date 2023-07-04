const express = require("express");
const { createNewUser, authenticateUser } = require("./controller");
const router = express.Router();
const auth = require("../../middleware/auth")
const fetch = require('node-fetch');

//InfoBip API
const API_KEY= '701b7dd3b082cb8db88756d6331d5ae5-9a441e5f-e1f9-4f5f-9719-fadc10fb9f44'
const API_BASE_URL = 'https://4mygzm.api.infobip.com'


const SENDER = 'Tashus';
const randomPIN = Math.floor(1000 + Math.random() * 9000); //generate 4 digit PIN
const MESSAGE_TEXT = `Your PIN in ${randomPIN}`; //Message body

//protected route
router.get("/private_data", auth, (req, res) => {
    res.status(200)
        .send(`You're in the private territory of ${req.currentUser.phone}`)
})

//Signin
router.post("/", async (req, res) => {
    try {
        let { phone, password } = req.body;
        phone = phone.trim();
        password = password.trim();

        if (!(phone && password)) {
            throw Error("Empty credentials")
        }
        const authenticatedUser = await authenticateUser({ phone, password });
        res.status(200).json(authenticatedUser);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//Signup
//signup succesfully working but infobip api not working due to unauthorized error // please ignore
router.post("/signup", async (req, res) => {
    try {
        let { name, phone, password } = req.body;
        name = name.trim();
        phone = phone.trim();
        password = password.trim();

        if (!(name && phone && password)) {
            throw Error("Empty input fileds!");
        } else if (!/^[a-zA-Z]*$/.test(name)) {
            throw Error("Invalid Name entered");
        } else if (!(/^\d{7,}$/).test(phone.replace(/[\s()+\-\.]|ext/gi, ''))) {
            throw Error("Invalid Phone number");
        } else if (password.length < 8) {
            throw Error("Password is too short");
        } else {
            //good credentials
            //create new user
            const newUser = await createNewUser({
                name,
                phone,
                password,
            })
            

            // Call Infobip API to create a new 2FA application
            const infobipSettings = {
                method: 'POST',
                headers: {
                    'Authorization': process.env.API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: '2fa SMS demo application',
                    enabled: true,
                    configuration: {
                        pinAttempts: 5,
                        allowMultiplePinVerifications: true,
                        pinTimeToLive: '10m',
                        verifyPinLimit: '2/4s',
                        sendPinPerApplicationLimit: '5000/12h',
                        sendPinPerPhoneNumberLimit: '2/1d'
                    }
                })
            };
            const response = await fetch(process.env.API_2FA_BASE_URL, infobipSettings);
            console.log({response, API_2FA_BASE_URL, infobipSettings});
            const data = await response.json();
            
            const applicationId = data.id; // Get the application ID from Infobip API response
            console.log(`Application ID: ${applicationId}`)
            
            // message template
            
            const messageTemplateSettings = {
                method: 'POST',
                headers: {
                    'Authorization': process.env.API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    pinType: 'NUMERIC',
                    messageText: 'Your pin is {{pin}}',
                    pinLength: 4,
                    language: 'en',
                    senderId: 'Infobip 2FA',
                    repeatDTMF: '1#',
                    speechRate: 1
                })
            };

            const messageTemplateResponse = await fetch(processe.env.API_2FA_BASE_URL +`/${applicationId}/messages`, messageTemplateSettings);
            const messageTemplateData = await messageTemplateResponse.json();
            const messageId = messageTemplateData.id;
            console.log(`Message ID: ${messageId}`)

            const sendPINSettings = {
                method: 'POST',
                headers: {
                    'Authorization': process.env.API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    applicationId: applicationId,
                    messageId: messageId,
                    from: 'InfoBib SMS TEST PIN :0',
                    to: '8801881715214',
                    placeholders: {
                        firstName: 'LISA'
                    }
                })
            }
            const sendPinResponse = await fetch(prcoess.env.API_PIN_URL + '?ncNeeded=false', sendPINSettings);
            const sendPinData = await sendPinResponse.json();
            console.log(sendPinData);

            res.status(200).json(newUser);
        }
    } catch (error) {
        //console.log(error)
        res.status(400).send(error.message)
    }
});

//send SMS to mobile

router.post("/test/sendSMS", async (req, res) => {
    const phoneNumber = '8801881715214'; //phone number to send SMS to
    const randomPIN = Math.floor(1000 + Math.random() * 9000); //generate 4 digit PIN
    const MESSAGE_TEXT = `Your PIN in ${randomPIN}`; //Message body
    try {
        console.log("Test");
        const configuration = {
            basePath: API_BASE_URL,
            apiKeyPrefix: 'App',
            apiKey: API_KEY
        };
        const smsMessage = {
            from: SENDER,
            destinations: [{ to: phoneNumber }],
            text: `Your PIN is ${Math.floor(1000 + Math.random() * 9000)}`
        };
        const smsRequest = {
            messages: [smsMessage]
        };

        const response = await fetch(`${API_BASE_URL}/sms/1/text/advanced`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `App ${API_KEY}`
            },
            body: JSON.stringify(smsRequest)
        });

        const data = await response.json();
        const pinResponse = {
            response: data.messages[0],
            pin: smsMessage.text // Include the randomly generated PIN in the response
          };
      
          res.json(pinResponse);

        // res.json({ response: data.messages[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log('Not Working :(');
    }
});




module.exports = router;
const { authenticateUser } = require("../user/controller");
const { createNewUser} = require("./controller");
const User = require("./model")
const axios = require('axios');

const BASE_URL = 'https://4mygzm.api.infobip.com';
const API_KEY = 'a453a92601c398337dbcae752ea531e6-7efdeaff-a455-4e4d-995a-493ca5dc1bd9';
const SENDER = 'InfoSMS';
const RECIPIENT = '8801881715214';
const MESSAGE_TEXT = 'This is a sample message';

async function sendSms() {
  try {
    const response = await axios.post(`${BASE_URL}/sms/2/text/advanced`, {
      messages: [
        {
          from: SENDER,
          destinations: [
            {
              to: createNewUser.phone
            }
          ],
          text: MESSAGE_TEXT
        }
      ]
    }, {
      headers: {
        Authorization: `App ${API_KEY}`
      }
    });

    console.log('Response:', response.data.messages[0]);
  } catch (error) {
    console.log('Error occurred!');
    console.log('\tMessage:', error.response.data);
    console.log('\tError content:', error.response.data.error);
  }
}

sendSms();

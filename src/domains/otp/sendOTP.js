const axios = require('axios');

const BASE_URL = 'https://4mygzm.api.infobip.com';
const API_KEY = 'a453a92601c398337dbcae752ea531e6-7efdeaff-a455-4e4d-995a-493ca5dc1bd9';
const APPLICATION_ID = 'your_application_id'; 
const MESSAGE_TEMPLATE_ID = 'This is a custom SMS'; 


async function sendPin(phone, pin) {
  try {
    const response = await axios.post(`${BASE_URL}/sms/send`, {
      applicationId: APPLICATION_ID,
      messageTemplateId: MESSAGE_TEMPLATE_ID,
      phoneNumber: phone,
      messageParams: [pin]
    }, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    console.log('PIN sent successfully!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error occurred while sending PIN!');
    console.log('\tMessage:', error.response.data);
    console.log('\tError code:', error.response.data.errorCode);
  }
}

// Function to generate a random PIN
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000); // 4-digit random PIN
}

// Example usage
const phoneNumber = '8801881715214'; 
const pin = generatePin();
sendPin(phoneNumber, pin);

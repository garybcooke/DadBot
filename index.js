const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCESS_TOKEN = 'EAAWp1ceVqRcBRDzXYw59QVbUWfZAP6sAnG6oRPyszYvaGe8NUKkbsQYpitmyxsHp2J3AVBCL4h97ZAlYfwl9wo7RlHOTYAYZCEz6NsGZAjoFiMD1FQqVUn0YiJeZAeKgovKC5QZBhDl0kUouZAbdJeFmnBGUlHw8YlZBUjJ4SLr1ybjRAdVcKiFS2uFJYWxhgHY3awZDZD';
const PHONE_NUMBER_ID = '1112246875295249';
const VERIFY_TOKEN = 'dadbot123'; // you can change this to anything';

// Send a WhatsApp message
async function sendMessage(to, message) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    },
    {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    }
  );
}

// Handle incoming messages
function getReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes('where are you') || msg.includes('where r u')) {
    return "I'm at work — should be back around 6pm 🏠";
  }
  if (msg.includes('training') || msg.includes('football')) {
    return "Training is Tuesday 6pm, match Saturday 10am ⚽ Don't be late!";
  }
  if (msg.includes('dinner') || msg.includes('food') || msg.includes('tea')) {
    return "Not sure yet — text Mum! 🍝";
  }
  if (msg.includes('pocket money') || msg.includes('money') || msg.includes('cash')) {
    return "Nice try 😄 Ask me when I get home!";
  }
  if (msg.includes('help')) {
    return "Hi! Dad Bot here 🤖 Try asking:\n• Where are you?\n• Training tonight?\n• What's for dinner?\n• Pocket money?";
  }

  return "Hey! Dad Bot here 🤖 I didn't understand that — try asking 'help' to see what I can do!";
}

// Webhook verification (Meta checks this when you register the webhook)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive incoming messages
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text') {
      const from = message.from; // sender's number
      const text = message.text.body;
      console.log(`Message from ${from}: ${text}`);

      const reply = getReply(text);
      await sendMessage(from, reply);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log('Dad Bot running on port 3000 🤖'));


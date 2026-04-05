const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCESS_TOKEN = 'EAAWp1ceVqRcBROc0ZB5idPJBRnmZBJogp4g1pzhSlY2ZACZCllHcoY51YpEyDiMMAn11VdtYGeOX5UhZA6M1N7wz46Etn3cZA8L1ZBRQ1PCO0Dn00P7kDG0CxrsT2HBW9hULGqT1TmA3fP73LV3h6ViTLnjOYKig6ZAD3yhKZBznPmpif2NNlTOZAIZCdNfIPmGlD94j0RV5QvXtHcZBFZBcnmHFtGe4fNt5UAFjD3CIVAZCGoX7jdJVWWKnLJsk500hVkv1bsZCb1RFiJY7PtrashhTWe8dG8ZD';
const PHONE_NUMBER_ID = '1112246875295249';
const VERIFY_TOKEN = 'dadbot123';

const KNOWN_USERS = {
  '447885668209': 'Gracie',
  '447701073177': 'Sam',
  '447809736254': 'Boss Man'
};

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

async function getReply(message, name) {
  const msg = message.toLowerCase();

  if (msg.includes('joke') || msg.includes('dad joke')) {
    const response = await axios.get('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json' }
    });
    return response.data.joke;
  }
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
    return `Hey ${name}! Dad Bot here 🤖 Try asking:\n• Where are you?\n• Training tonight?\n• What's for dinner?\n• Pocket money?\n• Tell me a joke!`;
  }

  return `Hey ${name}! Dad Bot here 🤖 I didn't understand that — try asking 'help' to see what I can do!`;
}

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

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text') {
      const from = message.from;
      const text = message.text.body;
      const name = KNOWN_USERS[from] || 'there';
      console.log(`Message from ${name} (${from}): ${text}`);

      const reply = await getReply(text, name);
      await sendMessage(from, reply);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log('Dad Bot running on port 3000 🤖'));

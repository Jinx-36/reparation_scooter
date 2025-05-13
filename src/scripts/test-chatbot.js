const fetch = require('node-fetch');

async function testChatbot() {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "deepseek-v2",
      messages: [
        { 
          role: "system", 
          content: "Vous êtes un expert en scooters. Répondez uniquement sur ce sujet." 
        },
        { 
          role: "user", 
          content: "Mon scooter fait un bruit de claquement" 
        }
      ]
    })
  });

  console.log(await response.json());
}

testChatbot();
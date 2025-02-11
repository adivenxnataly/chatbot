### Chatbot
![banner](https://github.com/adivenxnataly/chatbot/blob/main/files/chatbotbanner.png)

for using this chatbot, clone this repository with :

    git clone https://github.com/adivenxnataly/chatbot.git

if you don't have nodejs package, then install first with :

    pkg install nodejs
    
enter the clone, with `cd chatbot/deepseek` then :

    npm install axios body-parser cors express socket.io

then, running the server with :

    node .

you will get output `localhost:3000`, open a browser then go to `localhost:3000`
done.
 
#### Configuration
Simple API configuration example (without API keys) :
```javascript
const axios = require('axios');

const url = 'https://api.blackbox.ai/api/chat';
const data = {
  messages: [
    {
      content: 'make a simple python function',
      role: 'user'
    }
  ],
  model: 'deepseek-ai/DeepSeek-V3',
  max_tokens: '1024'
};

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

axios.post(url, data, config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### Source
Blackbox.AI: [API](blackbox.ai)

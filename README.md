### Chatbot
Project is closed, because the API has been deleted.
>however, you can use API keys for alternative

- DeepSeek API [Docs.](https://api-docs.deepseek.com/)
- [API keys](https://platform.deepseek.com/api_keys)

#### Configuration with API Keys
first, install OpenAI module:

    npm install openai

configuration server-side with API Keys:
```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com';
    apiKey: 'your_api_keys';
});

io.on('connection', function (socket) {
    socket.on('prompt', async function (data) {
        console.log('Received Prompt', data);
        try {
            let message = data.text;
            let image = null;
            let history;

            const completion = await openai.chat.completions.create({
                message: messages,
                model: 'deepseek-chat',
            });
        }
    });
});
```

**Models:**
- DeepSeek-V3:  `deepseek-chat`
- DeepSeek-R1:  `deepseek-reasoner`

#### Configuration (without API keys)
Simple API configuration example :
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

#### Using this Chatbot
for using this chatbot, clone this repository with :

    git clone https://github.com/adivenxnataly/chatbot.git

if you don't have nodejs package, then install first with :

    pkg install nodejs
    
enter the clone, with `cd chatbot/deepseek` then :

    npm install axios body-parser cors express socket.io

then, running the server with :

    node .

and server running in `localhost:3000`, open a browser then go to `localhost:3000`

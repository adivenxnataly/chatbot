const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { OpenAI } = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.API_KEY,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

app.use(bodyParser.json());
app.use(cors());

io.on('connection', (socket) => {
  socket.on('newuser', (username) => {
    console.log('New user:', username);
  });

  socket.on('prompt', async (data) => {
    console.log('Prompt received:', data.text);
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: data.text,
          },
        ],
        max_tokens: 256,
      });

      const botReply = completion.choices[0]?.message?.content || 'sorry, i cant process your request!';

      socket.emit('chatbot', {
        username: 'bot',
        text: botReply,
      });

    } catch (err) {
      console.error('API Error:', err);
      socket.emit('chatbot', {
        username: 'bot',
        text: 'an error occurred, try again later..',
      });
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
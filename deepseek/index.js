const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());

io.on('connection', function (socket) {
  socket.on('newuser', function (username) {
    console.log(username);
  });

  socket.on('prompt', async function (data) {
    console.log(data);
    try {
      const url = 'https://api.blackbox.ai/api/chat';
      const requestData = {
        messages: [
          {
            content: data.text,
            role: 'user',
          },
        ],
        model: 'deepseek-ai/DeepSeek-V3',
        max_tokens: 256,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(url, requestData, config);

      console.log('Response from Blackbox.AI:', response.data);

      const message = typeof response.data === 'string' ? response.data : 'Sorry, I could not process your request.';

      socket.emit('chatbot', {
        username: 'bot',
        text: message,
      });
    } catch (err) {
      console.error('Error:', err.response ? err.response.data : err.message);
      socket.emit('chatbot', {
        username: 'bot',
        text: 'An error occurred. Please try again later.',
      });
    }
  });
});

server.listen(3000, () => console.log('Server berjalan di localhost:3000'));
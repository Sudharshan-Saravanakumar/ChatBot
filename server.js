import express from 'express';
import cors from 'cors';
import openai from './config/open-ai.js';
import colors from 'colors';
import bodyParser from 'body-parser';

// const express = require("express");
// const bodyParser = require('body-parser');
// const cors = require('cors');


const app = express();
const port = 200; 

// Middleware for parsing JSON requests
app.use(bodyParser.json());
app.use(cors());


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


// Create an array to store all conversation history
const chatHistory = [];

const initialMessage = {
  role: "system",
  content: "You are a helpful and friendly AI assistant that can answer any question on any topic."
};

chatHistory.push(["system", initialMessage.content]);

app.post('/bot', async (req, res) => {
    const userInput = req.body.userInput;
  
    try {
      // Constructing messages by iterating over the history
      const messages = chatHistory.map(([role, content]) => ({ role, content }));
  
      // Adding the latest user input to the message history
      messages.push({ role: 'user', content: userInput });
  
      // Calling the OpenAI API with the user's input
      const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',  // change here to GPT-4o
      messages: messages,
      });

  
      const completionText = chatCompletion.choices[0].message.content;
  
      // Exiting
      if (userInput.toLowerCase() === 'exit') {
        chatHistory.push(['user', userInput]);
        chatHistory.push(['assistant', completionText]);
        console.log(colors.blue('Bot: ') + completionText);
        return res.json({ message: completionText });
      }
  
      // Update history with user input and assistant response
      chatHistory.push(['user', userInput]);
      chatHistory.push(['assistant', completionText]);
      console.log(colors.blue('Bot: ') + completionText);
  
      return res.json({ message: completionText });
    } catch (error) {
      console.error(colors.magenta(error));
      return res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
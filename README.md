# Claude AI assistant
<br>

## About

This AI assistant runs on Claude 3.5 Haiku. The AI assistant is mainly used to interact with the [User assignment app](https://github.com/ishankorde/Users-assignment-app) via the app's MCP server. This prototype demonstrates an interactive MCP UI experience with UI components that are pushed by the MCP server and rendered by the AI assistant.

**Try it!**

Fork the repo and set up the environment along with your Anthropic API Key. Ask the AI assistant to give a list of user. The AI assistant will render a interactive Table UI component.
- Note 1: Currently, only the list_users API is configured to pass UI (JSON) to the AI Asssistant. Other APIs (e.g. Show apps) will work but the results will be displayed in text.
- Note 2: To get the prototype working, you will also need to fork the [Users-assignment-app](https://github.com/ishankorde/Users-assignment-app) repo which is the SaaS app running on Supabase with a list of Users, Applications and User <> App assignment.
<br>

## What technologies are used for this project?

This project is built with:

- Cursor IDE: Used to built the AI assistant and the custom MCP server
- Claude 3.5 Haiku LLM model
<br>

## How does this work?

**The complete flow**



# Claude AI assistant

## Project info

This is a custom built AI assistant running on Claude 3.5 Haiku. The AI assistant can be used to interact with the <app name> via the app's MCP server. This prototype shows what an interactive UI experience could look like when UI elements and components are pushed by the MCP server and rendered by the AI assistant.

**Try it!**
After forking the repo and setting up the environment along with your Anthropic API Key, you can ask the the chatbot to show a list of user. The chatbot will render a interactive table UI. Currently only the list_users API is configured to pass UI (JSON) to the AI Asssistant. Other APIs (e.g. Show apps) will work but the results will be displayed in text.

Note: You will also need to fork the repo <link> which is the SaaS app used for Users and Apps list.


## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ea865b72-3ca2-4242-bbb9-8dd24cbabe8b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
# Copy the example environment file and fill in your credentials
cp .env.example .env
# Edit .env and add your:
# - VITE_ANTHROPIC_API_KEY (from https://console.anthropic.com/)
# - VITE_SUPABASE_URL (from your Supabase project settings)
# - VITE_SUPABASE_SERVICE_ROLE_KEY (from your Supabase project settings)

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 🔐 Environment Variables

This project requires the following environment variables to be set in a `.env` file:

- `VITE_ANTHROPIC_API_KEY`: Your Anthropic API key (get it from [console.anthropic.com](https://console.anthropic.com/))
- `VITE_SUPABASE_URL`: Your Supabase project URL (from your Supabase project settings)
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (from your Supabase project settings)

**Important**: Never commit your `.env` file to version control! The `.env` file is already in `.gitignore`.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ea865b72-3ca2-4242-bbb9-8dd24cbabe8b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

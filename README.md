# Zeta AI Assistant

A modern, multi-model AI chat assistant with web search capabilities, built with React 19 and TypeScript.

![Zeta AI](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple)

## Features

### Multi-Model Support
- **Gemini 3 Flash/Pro** - Google's latest with native thinking and tool support
- **Kimi K2** - Fast inference via Groq with Exa search tools
- **Groq Compound** - Built-in web search, code execution, and Wolfram Alpha
- **DeepSeek V3.1** - Fast model with tool calling via OpenRouter

### AI Capabilities
- 🔍 **Web Search** - Real-time search via Exa API with source citations
- 🧠 **Thinking Mode** - See the model's reasoning process (Gemini, DeepSeek)
- 📎 **File Attachments** - Upload images, PDFs, Word docs, Excel files
- 💬 **Chat History** - Persistent conversations with local storage
- ⚡ **Streaming Responses** - Real-time token streaming with animated markdown

### UI/UX
- Claymorphism design with smooth animations (Framer Motion)
- Responsive layout (mobile + desktop)
- Animated markdown rendering with [flowtoken](https://github.com/flowtoken/flowtoken)
- Search timeline with image galleries
- Model picker with capability indicators

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/zeta-ai.git
cd zeta-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with your API keys:

```env
# Gemini API Keys (https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY_1=your_key_here
VITE_GEMINI_API_KEY_2=your_key_here  # Optional, for rotation

# Groq API Key (https://console.groq.com/keys)
VITE_GROQ_API_KEY=your_key_here

# OpenRouter API Key (https://openrouter.ai/keys)
VITE_OPENROUTER_API_KEY=your_key_here

# Exa Search API Key (https://dashboard.exa.ai/api-keys)
VITE_EXA_API_KEY=your_key_here
```

## Project Structure

```
├── components/
│   ├── atoms/          # Basic UI components (buttons, inputs, icons)
│   ├── molecules/      # Composite components (message bubbles, cards)
│   ├── organisms/      # Complex components (sidebar, chat input)
│   └── templates/      # Page layouts (chat interface)
├── services/
│   ├── geminiService.ts    # Google Gemini API integration
│   ├── groqService.ts      # Groq/Kimi K2 API integration
│   ├── openRouterService.ts # OpenRouter API integration
│   ├── exaService.ts       # Exa web search API
│   ├── modelConfig.ts      # Model capabilities configuration
│   └── prompts.ts          # System prompts
├── hooks/
│   ├── useChatHistory.ts   # Chat persistence
│   ├── useChatMessages.ts  # Message state management
│   └── useStreamHandler.ts # Streaming response handler
├── contexts/
│   └── AuthContext.tsx     # Authentication state
└── types.ts                # TypeScript interfaces
```

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom claymorphism theme
- **Animations**: Framer Motion
- **Markdown**: react-markdown + flowtoken for animated streaming
- **Math**: KaTeX via rehype-katex
- **Document Parsing**: PDF.js, Mammoth (Word), SheetJS (Excel)

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Model Capabilities

| Model | Provider | Tools | Thinking | Images | Free |
|-------|----------|-------|----------|--------|------|
| Gemini 3 Flash | Google | ✅ Exa | ✅ Native | ✅ | ❌ |
| Gemini 3 Pro | Google | ✅ Exa | ✅ Native | ✅ | ❌ |
| Kimi K2 | Groq | ✅ Exa | ✅ Tags | ❌ | ✅ |
| Compound | Groq | ✅ Built-in | ❌ | ❌ | ✅ |
| DeepSeek V3.1 | OpenRouter | ✅ Exa | ✅ Tags | ❌ | ✅ |

## License

MIT

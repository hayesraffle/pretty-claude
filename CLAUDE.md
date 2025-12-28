# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pretty-code** is a web-based GUI wrapper for Claude Code CLI. It creates a beautiful, modern browser interface to make AI-assisted coding accessible and less intimidating - designed for both developers and users learning to code.

Core principle: Code should feel like reading a well-designed article, not staring at a scary terminal.

## Architecture

```
Browser (React + TailwindCSS)
    │
    │ WebSocket (real-time streaming)
    ▼
Local Server (FastAPI/Python)
    │
    │ subprocess
    ▼
Claude Code CLI
```

## Tech Stack

**Frontend:** React, TailwindCSS v4, Vite, react-markdown, prism-react-renderer, Lucide React
**Fonts:** Inter (prose), JetBrains Mono (code)
**Backend:** FastAPI with WebSocket support (Python)

## Build & Run Commands

```bash
# Frontend (port 5173)
cd frontend && npm install && npm run dev

# Backend (port 8000) - separate terminal
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --index-url https://pypi.org/simple/ -r requirements.txt
python main.py
```

## Project Structure

```
frontend/src/
  components/
    Chat.jsx              # Message list + empty state with quick actions
    Message.jsx           # User/AI message bubbles
    CodeBlock.jsx         # Syntax highlighting with copy, line numbers
    MarkdownRenderer.jsx  # Custom markdown styling
    InputBox.jsx          # Textarea with keyboard hints
    TypingIndicator.jsx   # Animated typing dots
  hooks/
    useWebSocket.js       # WebSocket connection management
    useDarkMode.js        # Dark mode toggle with localStorage

backend/
  main.py                 # FastAPI server with WebSocket endpoint
  claude_runner.py        # Claude Code subprocess wrapper
```

## Features Implemented

- Real-time streaming from Claude Code CLI via WebSocket
- Beautiful markdown rendering with GFM support
- Syntax highlighting (light/dark themes)
- Dark mode toggle (persisted to localStorage)
- Copy button on code blocks with line numbers
- Quick action buttons on empty state
- Stop generation button
- Clear chat button
- Connection status indicator
- Keyboard shortcut hints

## Design Guidelines

- **Colors:** Soft, not high-contrast. Uses CSS custom properties for theming.
- **Typography:** 16px body (Inter), 14px code (JetBrains Mono)
- **Dark mode:** Uses `.dark` class on `<html>` element

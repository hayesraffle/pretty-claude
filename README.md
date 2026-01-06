# Pretty Claude

A beautiful, browser-based GUI for [Claude Code](https://claude.ai/code). Makes AI-assisted coding accessible and less intimidating - designed for both developers and people learning to code.

![Pretty Claude Screenshot](screenshot.png)

## Why Pretty Claude?

Claude Code is powerful, but the terminal can feel intimidating. Pretty Claude wraps it in a modern, friendly interface:

- **Visual tool calls** - See file reads, edits, and commands in a clean UI instead of raw terminal output
- **Permission controls** - Approve, reject, or auto-allow actions with one click
- **Drag & drop images** - Share screenshots and diagrams directly with Claude
- **Conversation history** - Your chats are saved and searchable
- **Dark mode** - Easy on the eyes

## Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and authenticated (`npm install -g @anthropic-ai/claude-code`)
- Python 3.10+
- Node.js 18+

### Option 1: One-Click Launch (macOS)

1. Clone this repo
2. Double-click `Pretty Claude.app` or `Resources/start.command`
3. Browser opens automatically

### Option 2: Manual Setup

```bash
# Terminal 1: Backend
cd Resources/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Terminal 2: Frontend
cd Resources/frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Features

### Permission Modes

Control how much autonomy Claude has:

| Mode | Description |
|------|-------------|
| **Autopilot** | Auto-approve everything (for trusted tasks) |
| **Review Some** | Auto-approve reads, prompt for writes |
| **Plan Mode** | Claude proposes a plan, you approve before execution |
| **Review All** | Prompt for every action |

### Pretty Claude View

Code is displayed with semantic typography - keywords, functions, and values are styled for readability. Hover for inline documentation.

![Code View](docs/code-view.png)

### Dark Mode

Full dark mode support, automatically saved to your preferences.

![Dark Mode](docs/dark-mode.png)

### Conversation Management

- Automatic saving to `~/.pretty-claude/conversations/`
- Sidebar to browse and switch conversations
- Export to Markdown or JSON
- File browser to change working directory

## Architecture

```
Browser (React + TailwindCSS)
    │
    │ WebSocket (real-time streaming)
    ▼
FastAPI Server (Python)
    │
    │ claude-agent-sdk
    ▼
Claude Code
```

See [CLAUDE.md](Resources/CLAUDE.md) for detailed architecture and component documentation.

## Development

```bash
# Run frontend with hot reload
cd Resources/frontend && npm run dev

# Run backend
cd Resources/backend && source venv/bin/activate && python main.py
```

The frontend is React + TailwindCSS v4 + Vite. The backend is FastAPI with WebSocket support.

## Configuration

Pretty Claude stores data in:
- `~/.pretty-claude/config.json` - Settings
- `~/.pretty-claude/conversations/` - Saved conversations
- `~/pretty-claude-projects/` - Default sandbox for new users

## Contributing

Contributions welcome! This project uses Claude Code for development - feel free to use it to explore the codebase and make changes.

## License

MIT

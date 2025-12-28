import asyncio
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from claude_runner import ClaudeCodeRunner

app = FastAPI(title="pretty-code backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections and their runners
active_connections: dict[WebSocket, ClaudeCodeRunner] = {}


@app.get("/")
async def root():
    return {"status": "ok", "message": "pretty-code backend is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Get working directory from query params or use current
    working_dir = websocket.query_params.get("cwd", os.getcwd())
    runner = ClaudeCodeRunner(working_dir=working_dir)
    active_connections[websocket] = runner

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data.get("type") == "message":
                user_message = message_data.get("content", "")

                # Send start indicator
                await websocket.send_json({
                    "type": "start",
                    "content": ""
                })

                # Stream Claude's response
                full_response = ""
                async for chunk in runner.run(user_message):
                    full_response += chunk
                    await websocket.send_json({
                        "type": "chunk",
                        "content": chunk
                    })

                # Send completion indicator
                await websocket.send_json({
                    "type": "complete",
                    "content": full_response
                })

            elif message_data.get("type") == "stop":
                await runner.stop()
                await websocket.send_json({
                    "type": "stopped",
                    "content": ""
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "content": str(e)
            })
        except:
            pass
    finally:
        await runner.stop()
        if websocket in active_connections:
            del active_connections[websocket]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

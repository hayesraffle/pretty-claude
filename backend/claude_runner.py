import asyncio
import json
import subprocess
from typing import AsyncGenerator, Optional, Callable


class ClaudeCodeRunner:
    """Manages a Claude Code CLI subprocess with bidirectional JSON streaming."""

    def __init__(self, working_dir: str = ".", permission_mode: str = "default"):
        self.working_dir = working_dir
        self.permission_mode = permission_mode
        self.process: Optional[asyncio.subprocess.Process] = None
        self._stdin_lock = asyncio.Lock()

    async def run(self, message: str) -> AsyncGenerator[dict, None]:
        """
        Run Claude Code with bidirectional JSON streaming.
        Yields parsed JSON events as they arrive.
        """
        cmd = [
            "claude",
            "--print",
            "--input-format", "stream-json",
            "--output-format", "stream-json",
            "--verbose",
            "--permission-mode", self.permission_mode,
        ]

        try:
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.working_dir,
            )

            # Send the initial user message as JSON
            initial_message = {
                "type": "user",
                "message": {
                    "role": "user",
                    "content": message
                }
            }
            await self._write_json(initial_message)

            # Stream output line by line (each line is a JSON object)
            while True:
                if self.process.stdout is None:
                    break

                line = await self.process.stdout.readline()
                if not line:
                    break

                try:
                    text = line.decode("utf-8", errors="replace").strip()
                    if text:
                        event = json.loads(text)
                        yield event

                        # Check if this is the final result
                        if event.get("type") == "result":
                            break
                except json.JSONDecodeError as e:
                    # Yield raw text as a system message if JSON parsing fails
                    yield {
                        "type": "system",
                        "subtype": "raw",
                        "content": text,
                        "error": str(e)
                    }

            # Wait for process to complete
            await self.process.wait()

        except FileNotFoundError:
            yield {
                "type": "system",
                "subtype": "error",
                "content": "Claude Code CLI not found. Make sure 'claude' is installed and in your PATH."
            }
        except Exception as e:
            yield {
                "type": "system",
                "subtype": "error",
                "content": f"Error running Claude Code: {str(e)}"
            }
        finally:
            self.process = None

    async def _write_json(self, data: dict):
        """Write a JSON message to the CLI's stdin."""
        if self.process and self.process.stdin:
            async with self._stdin_lock:
                json_str = json.dumps(data) + "\n"
                self.process.stdin.write(json_str.encode("utf-8"))
                await self.process.stdin.drain()

    async def send_permission_response(self, tool_use_id: str, allowed: bool):
        """Send a permission response back to the CLI."""
        response = {
            "type": "permission_response",
            "tool_use_id": tool_use_id,
            "allowed": allowed
        }
        await self._write_json(response)

    async def send_question_response(self, answers: dict):
        """Send question/survey answers back to the CLI."""
        response = {
            "type": "question_response",
            "answers": answers
        }
        await self._write_json(response)

    async def send_continue(self):
        """Send a continue signal to resume processing."""
        await self._write_json({"type": "continue"})

    async def stop(self):
        """Stop the running process if any."""
        if self.process:
            self.process.terminate()
            try:
                await asyncio.wait_for(self.process.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                self.process.kill()
            self.process = None

    def is_running(self) -> bool:
        """Check if the process is currently running."""
        return self.process is not None and self.process.returncode is None

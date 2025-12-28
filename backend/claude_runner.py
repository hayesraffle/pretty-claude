import asyncio
import subprocess
import sys
from typing import AsyncGenerator, Optional


class ClaudeCodeRunner:
    """Manages a Claude Code CLI subprocess with streaming output."""

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.process: Optional[asyncio.subprocess.Process] = None

    async def run(self, message: str) -> AsyncGenerator[str, None]:
        """
        Run Claude Code with the given message and stream output.
        Yields chunks of output as they become available.
        """
        # Build the command
        cmd = ["claude", "--print", message]

        try:
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                cwd=self.working_dir,
            )

            # Stream output line by line
            while True:
                if self.process.stdout is None:
                    break

                line = await self.process.stdout.readline()
                if not line:
                    break

                # Decode and yield the line
                text = line.decode("utf-8", errors="replace")
                yield text

            # Wait for process to complete
            await self.process.wait()

        except FileNotFoundError:
            yield "Error: Claude Code CLI not found. Make sure 'claude' is installed and in your PATH.\n"
        except Exception as e:
            yield f"Error running Claude Code: {str(e)}\n"
        finally:
            self.process = None

    async def stop(self):
        """Stop the running process if any."""
        if self.process:
            self.process.terminate()
            try:
                await asyncio.wait_for(self.process.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                self.process.kill()
            self.process = None

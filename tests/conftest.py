# tests/conftest.py
import pytest
import subprocess
import time
import os
import signal

# Using a different port to avoid potential conflicts
PORT = 8020

@pytest.fixture(scope="session", autouse=True)
def start_server():
    """Starts a local web server for the C14 app for the entire test session."""
    # Kill any process that might be running on the port
    try:
        pid_bytes = subprocess.check_output(["lsof", "-t", f"-i:{PORT}"], stderr=subprocess.DEVNULL)
        pid = pid_bytes.decode().strip()
        if pid:
            os.kill(int(pid), signal.SIGKILL)
            time.sleep(1) # Give OS time to free up port
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass # No process running, or lsof not found

    command = ["python3", "-m", "http.server", str(PORT), "--directory", "C14"]
    server_process = subprocess.Popen(command, preexec_fn=os.setsid, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1) # Give server time to start
    yield f"http://localhost:{PORT}"
    # Use process group kill to ensure the server and any children are terminated
    os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
    server_process.wait()


import asyncio
import http.server
import socketserver
import threading
import os
import time
import socket

def run_server(port, directory):
    # Use a standard TCPServer, which defaults to IPv4, to avoid IPv6 issues.
    Handler = http.server.SimpleHTTPRequestHandler

    # Change to the target directory before starting the server
    os.chdir(directory)

    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"Serving at port {port} from directory {os.getcwd()}")
        httpd.serve_forever()

async def run_test_server_and_check(port, test_func, directory):
    # Store the original directory to restore it later
    original_directory = os.getcwd()

    server_thread = threading.Thread(target=run_server, args=(port, directory))
    server_thread.daemon = True
    server_thread.start()
    time.sleep(1)

    try:
        await test_func()
    finally:
        # The server thread is a daemon, so it will be terminated automatically.
        # We need to restore the original working directory.
        os.chdir(original_directory)
        print(f"Restored working directory to {os.getcwd()}")

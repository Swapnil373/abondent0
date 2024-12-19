import asyncio
import websockets
import socket
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

# Maintain a set of connected clients
connected_clients = set()

async def handle_message(websocket, path):
    # Add client to the set of connected clients
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # Broadcast the received message to all connected clients
            for client in connected_clients:
                if client != websocket and client.open:
                    await client.send(message)
    finally:
        # Remove client from the set of connected clients when they disconnect
        connected_clients.remove(websocket)

# Function to get the local IP address
def get_local_ip():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return local_ip

# Start the WebSocket server
async def start_websocket_server():
    local_ip = get_local_ip()
    port = 8000
    print(f"WebSocket server running at ws://{local_ip}:{port}")
    async with websockets.serve(handle_message, "0.0.0.0", port):
        await asyncio.Future()  # Keep the server running

# Start the HTTP server for serving the HTML
class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress logging to the console

def start_http_server():
    local_ip = get_local_ip()
    port = 8080
    print(f"HTTP server running at http://{local_ip}:{port}")
    handler = CustomHTTPRequestHandler
    httpd = TCPServer(("0.0.0.0", port), handler)
    return httpd

# Main function to run both servers
async def main():
    http_server = start_http_server()
    loop = asyncio.get_event_loop()
    try:
        await asyncio.gather(
            loop.run_in_executor(None, http_server.serve_forever),
            start_websocket_server()
        )
    finally:
        http_server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())

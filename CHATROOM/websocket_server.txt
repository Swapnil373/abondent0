import asyncio
import websockets

# Maintain a set of connected clients
connected_clients = set()

async def handle_message(websocket, path):
    # Add client to the set of connected clients
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # Broadcast the received message to all connected clients
            for client in connected_clients:
                await client.send(message)
    finally:
        # Remove client from the set of connected clients when they disconnect
        connected_clients.remove(websocket)

# Start the WebSocket server
start_server = websockets.serve(handle_message, "0.0.0.0", 8000)  # Change the IP and port as needed

# Run the event loop
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

# client.py

import asyncio
import websockets

print("Starting ws client...")

async def time_client():
    uri = "ws://localhost:5678"
    async with websockets.connect(uri) as websocket:
        while True:
            time_message = await websocket.recv()
            print(f"Received: {time_message}")

asyncio.get_event_loop().run_until_complete(time_client())
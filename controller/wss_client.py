# wss_client.py

import asyncio
import websockets
import ssl

ssl_context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

print("Starting wss client...")

async def time_receiver():
    uri = "wss://localhost:8765"
    async with websockets.connect(uri, ssl=ssl_context) as websocket:
        while True:
            time_received = await websocket.recv()
            print(f"Time Received: {time_received}")

asyncio.get_event_loop().run_until_complete(time_receiver())

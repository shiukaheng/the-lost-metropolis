# server.py

import asyncio
import websockets
import datetime

async def time_server(websocket, path):
    while True:
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        await websocket.send(now)
        await asyncio.sleep(1)  # send time every 1 second

start_server = websockets.serve(time_server, 'localhost', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

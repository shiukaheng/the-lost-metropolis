# wss_server.py

import asyncio
import datetime
import websockets
import ssl

print("Starting wss server...")

async def time_sender(websocket, path):
    while True:
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        await websocket.send(now)
        await asyncio.sleep(1)

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(certfile="./certs/certificate.pem", keyfile="./certs/private_key.pem")

start_server = websockets.serve(time_sender, "localhost", 8765, ssl=ssl_context)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

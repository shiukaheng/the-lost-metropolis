# wss_server.py

import asyncio
import datetime
import websockets
import ssl
import json

# print("Starting wss server...")

# async def time_sender(websocket, path):
#     while True:
#         now = datetime.datetime.utcnow().isoformat() + 'Z'
#         await websocket.send(now)
#         await asyncio.sleep(1)

# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain(certfile="./certs/certificate.pem", keyfile="./certs/private_key.pem")

# start_server = websockets.serve(time_sender, "localhost", 8765, ssl=ssl_context)

# asyncio.get_event_loop().run_until_complete(start_server)
# asyncio.get_event_loop().run_forever()

class StateBroadcaster():
    def __init__(self, host="localhost", port=8765, update_rate=30):
        self.host = host
        self.port = port
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        self.ssl_context.load_cert_chain(certfile="./certs/certificate.pem", keyfile="./certs/private_key.pem")
        self.start_server = websockets.serve(self._send_broadcast, self.host, self.port, ssl=self.ssl_context)
        self.update_rate = update_rate
        self.state = {}
    def run(self):
        asyncio.get_event_loop().run_until_complete(self.start_server)
        asyncio.get_event_loop().run_forever()
    def broadcast(self, state_object):
        self.state = state_object
    async def _send_broadcast(self, websocket, path):
        while True:
            try:
                await websocket.send(json.dumps(self.state))
                await asyncio.sleep(1 / self.update_rate)
            except Exception as e:
                print(f"Warning: {e}")

if __name__ == "__main__":
    broadcaster = StateBroadcaster()
    broadcaster.run()
    
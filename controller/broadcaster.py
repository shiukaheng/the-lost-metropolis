# wss_server.py

import asyncio
import datetime
import websockets
import ssl
import json
import threading

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

class ThreadedStateBroadcaster():
    def __init__(self, host="localhost", port=8765):
        self.host = host
        self.port = port
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        self.ssl_context.load_cert_chain(certfile="./certs/certificate.pem", keyfile="./certs/private_key.pem")
        self.listeners = set()
        self.state = {}
        self.server_thread = None
        self.loop = None
        self.server = None

    def start(self):
        self.server_thread = threading.Thread(target=self._run)
        self.server_thread.start()

    def stop(self):
        if self.loop is not None:
            self.loop.call_soon_threadsafe(self.loop.stop)
            
    def _run(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.server = self.loop.run_until_complete(websockets.serve(self.handler, self.host, self.port, ssl=self.ssl_context))
        self.loop.run_forever()

    def broadcast(self, state_object):
        self.state = state_object
        for listener in list(self.listeners):
            asyncio.run_coroutine_threadsafe(self._send_to_listener(listener), self.loop)

    async def _send_to_listener(self, listener):
        try:
            await listener.send(json.dumps(self.state))
        except:
            # If sending fails, remove the listener
            self.listeners.remove(listener)

    async def handler(self, websocket, path):
        self.listeners.add(websocket)
        try:
            # This handler can be expanded if we want to handle incoming messages from clients
            async for _ in websocket:
                pass
        finally:
            try:
                self.listeners.remove(websocket)
            except:
                pass


class BadThreadedStateBroadcaster():
    def __init__(self, host="localhost", port=8765, update_rate=30):
        self.state_broadcaster = StateBroadcaster(host=host, port=port, update_rate=update_rate)
        self.thread = threading.Thread(target=self.state_broadcaster.run)
    def start(self):
        self.thread.start()
    def stop(self):
        self.thread.join()
    def broadcast(self, state_object):
        self.state_broadcaster.broadcast(state_object)

# if __name__ == "__main__":
#     broadcaster = StateBroadcaster()
#     broadcaster.run()
    

if __name__ == "__main__":
    # Let's test ThreadedStateBroadcaster
    import time

    print("Creating broadcaster...")
    broadcaster = ThreadedStateBroadcaster()
    print("Starting broadcaster...")
    broadcaster.start()
    while True:
        print("Broadcasting...")
        broadcaster.broadcast({"time": time.time()})
        time.sleep(1)
import socketio
import eventlet
import threading
import logging

logging.basicConfig(level=logging.WARNING)

class SocketIoService:
    def __init__(self):
        self.sio = socketio.Server(cors_allowed_origins="*")
        self.app = socketio.WSGIApp(self.sio)
        self.thread = None
        self.running = False
        self.server = None  # to keep a reference to the eventlet server object

    def _run_server(self):
        if not self.server:
            self.server = eventlet.listen(('localhost', 5000))
        while self.running:
            try:
                eventlet.wsgi.server(self.server, self.app)
            except Exception as e:
                logging.warning(f"Server error: {e}")

    def start_server(self):
        if not self.thread:
            self.running = True
            self.thread = threading.Thread(target=self._run_server)
            self.thread.start()

    def stop_server(self):
        if self.thread and self.running:
            self.running = False
            if self.server:
                self.server.close()
            self.thread.join()
            self.thread = None

    def broadcast(self, state_object):
        try:
            self.sio.emit('state_update', state_object)
        except Exception as e:
            logging.warning(f"Failed to send state: {e}")

if __name__ == "__main__":
    service = SocketIoService()
    service.start_server()

    try:
        while service.running:
            eventlet.sleep(1)  # Sleep to avoid busy-waiting
    except KeyboardInterrupt:
        service.stop_server()

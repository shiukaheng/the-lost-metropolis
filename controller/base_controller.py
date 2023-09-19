import pyaudio
import numpy as np
import threading
import time
from dmx import Dmx
import serial

def get_serial():
    # Assume only one serial device is connected
    ports = list(serial.tools.list_ports.comports())
    if len(ports) == 0:
        print("No serial devices found")
        return None
    elif len(ports) > 1:
        print("Multiple serial devices found, using the first one")
    return ports[0].device

class BaseController:
    def __init__(self, dmx_port='COM1', rate=44100, chunk_size=1024, dmx_refresh_rate=30, port="COM1", input_device_index=None):
        print("Using serial port: {}".format(dmx_port))
        self.rate = rate
        self.chunk_size = chunk_size
        self.audio_stream = None
        self.dmx_port = dmx_port
        self.dmx_refresh_rate = dmx_refresh_rate
        self.dmx_thread = None
        self.audio_thread = None
        self.dmx_values = np.zeros(512, dtype=np.uint8)  # Using numpy uint8 array
        self.stop_event = threading.Event()  # Added event to handle stopping of threads
        self.port = port
        self.input_device_index = input_device_index
        self.dmx = Dmx(self.port)

    def _audio_callback(self, in_data, frame_count, time_info, status):
        audio_data = np.frombuffer(in_data, dtype=np.int16)
        self.dmx_values = self.animation_loop(audio_data, frame_count, time_info)
        return (in_data, pyaudio.paContinue)

    def animation_loop(self, audio_data, frame_count, time_info):
        self.dmx_values[0] = np.clip(int(np.mean(audio_data) * 255), 0, 255)
        return self.dmx_values

    def update_dmx(self):
        self.dmx.setUniverse(self.dmx_values)
        self.dmx.render()

    def dmx_animation_loop(self):
        while not self.stop_event.is_set():
            self.update_dmx()
            time.sleep(1 / self.dmx_refresh_rate)

    def start(self):
        self.audio_thread = threading.Thread(target=self._start_audio)
        self.audio_thread.daemon = True
        self.audio_thread.start()

        self.dmx_thread = threading.Thread(target=self.dmx_animation_loop)
        self.dmx_thread.daemon = True
        self.dmx_thread.start()

    def _start_audio(self):
        p = pyaudio.PyAudio()
        self.audio_stream = p.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.rate,
            frames_per_buffer=self.chunk_size,
            input=True,
            input_device_index=self.input_device_index,
            stream_callback=self._audio_callback,
        )
        self.audio_stream.start_stream()

        self.stop_event.wait()  # Replaced busy-waiting with event waiting

    def stop(self):
        self.stop_event.set()  # Signal threads to stop

        if self.audio_stream:
            self.audio_stream.stop_stream()
            self.audio_stream.close()
            self.audio_stream = None

        if self.dmx_thread:
            self.dmx_thread.join()
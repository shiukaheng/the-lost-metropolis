from base_controller import BaseController
import numpy as np
import time
from bell_detector import BellDetector
from broadcaster import ThreadedStateBroadcaster
from scene_manager import *
from scene_defs import scenes

def get_scene(state):
    # Wrap whole thing in try except so we don't crash in case of error, and return "idle"
    scene = "idle"
    try:       
        # Set to state["scenes"]["current_scene"] if it exists
        if state["scenes"] is not None and state["scenes"]["current_scene"] is not None:
            scene = state["scenes"]["current_scene"]
        # If idle, then overwrite with "idle"
        if state["scenes"]["idle"]:
            scene = "idle"
        # Now, handle the error such that it is logged
    except Exception as e:
        print(state)
        print(f"Error getting scene: {e}")
    return scene

class Controller(BaseController):
    def __init__(self, dmx_port='COM1', rate=44100, chunk_size=1024, dmx_refresh_rate=30, input_device_index=None):
       
        super().__init__(dmx_port=dmx_port, rate=rate, chunk_size=chunk_size, dmx_refresh_rate=dmx_refresh_rate, input_device_index=input_device_index)
        self.value = 0
        self.envelope_decay = 0.993
        self.random_light_decay = 0.95

        # Float array [0, 1]
        self.draft_dmx_values = np.zeros(512, dtype=np.float32) 
        self.max_dmx_values = np.zeros(512, dtype=np.float32)
        self.sound_sensitive_float_dmx = np.zeros(512, dtype=np.float32)
        self.functional_light_source_mask = np.zeros(512, dtype=np.float32)
        self.functional_light_source_mask[1] = 1
        self.functional_light_source_mask[10] = 1
        self.bell_detector = BellDetector(rate=rate, chunk=chunk_size, target_freq=2600, relative_amplitude_growth_threshold=1.3, absolute_amplitude_threshold=0.3, cooldown_time=5)
        # Scene management
        self.scene_man = scenes
        self.broadcaster = ThreadedStateBroadcaster()

        self.dings = 0
        self.time = time.time()

        self.last_state = None

        self.idle = 1
        self.dampened_idle = 1

    def update_sound_sensitive_float_dmx(self):
        self.value *= self.envelope_decay
        self.draft_dmx_values = np.random.rand(512) ** 6 * 0.1
        # Update max values with draft values if draft values are greater
        self.max_dmx_values = np.maximum(self.max_dmx_values, self.draft_dmx_values)
        # Decay max values
        self.max_dmx_values *= self.random_light_decay
        # Multiply max_dmx_values with value, then store in float_dmx_values
        self.sound_sensitive_float_dmx = self.max_dmx_values * self.value

    def get_audio_reactive_state(self):
        return {
            "ding_envelope": self.value,
            "ding_count": self.dings,
        }
    
    def get_state(self):
        # Join get_audio_reactive_state, and get_scene_state
        return {
            "audio_reactive": self.get_audio_reactive_state(),
            "scenes": self.scene_man.get_scene_state()
        }

    def animation_loop(self, audio_data, frame_count, time_info):
        self.time = time.time()
        if self.bell_detector.detect_bell(audio_data):
            self.value = 4
            self.scene_man.bell_trigger()
            self.dings += 1
            print("Ding!")
        self.update_sound_sensitive_float_dmx()
        self.functional_light_source_mod()
        self.dmx_values = float_to_uint8(self.sound_sensitive_float_dmx)
        self.scene_man.update(1 / self.rate * self.chunk_size)
        state = self.get_state()
        self.broadcast_if_changed(state)
        if self.idle == 1:
            self.dampened_idle += 0.05
            self.dampened_idle = min(self.dampened_idle, 1)
        else:
            self.dampened_idle -= 0.05
            self.dampened_idle = max(self.dampened_idle, 0)
        return self.dmx_values
    
    def broadcast_if_changed(self, state):
        # Get scene from state and last_state
        scene = get_scene(state)
        if scene == "idle":
            self.idle = 1
        else:
            self.idle = 0
        last_scene = get_scene(self.last_state)
        # If scene has changed, broadcast
        if scene != last_scene:
            self.broadcaster.broadcast(state)
        # Update last_state
        self.last_state = state

    def functional_light_source_mod(self):
        # Scale values by 0.75, then inverse [0, 1] to [1, 0] for indices in functional_light_source_mask
        self.sound_sensitive_float_dmx[self.functional_light_source_mask == 1] = (1 - self.sound_sensitive_float_dmx[self.functional_light_source_mask == 1]) * 0.25

    def start(self):
        self.broadcaster.start()
        super().start()

    def stop(self):
        self.broadcaster.stop()
        super().stop()

def float_to_uint8(float_arr):
    return np.clip(float_arr * 255, 0, 255).astype(np.uint8)

if __name__ == "__main__":
    audio_visualizer = Controller(dmx_port='COM7', rate=44100, chunk_size=1024, dmx_refresh_rate=60)
    audio_visualizer.start()

    try:
        while not audio_visualizer.stop_event.is_set():  # replaced the busy-wait with an event check
            time.sleep(0.1)  # Sleep so we're not constantly polling the event
    except KeyboardInterrupt:
        audio_visualizer.stop()

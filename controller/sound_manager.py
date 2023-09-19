# Use PyGame to play sounds

from dataclasses import dataclass
import pygame
import time
import threading

@dataclass
class Sound():
    front_lr_file: str
    back_lr_file: str or None

class SoundManaager():
    def __init__(self, front_lr_device_index, back_lr_device_index = None, sample_rate=44100):
        # Allow users to define quadraphonic sound setup. Stereo is fine too but then back_lr_device_index is None
        self.front_lr_device_index = front_lr_device_index
        self.back_lr_device_index = back_lr_device_index
        if back_lr_device_index is None:
            self.is_quadraphonic = False
        self.sample_rate = sample_rate

    def add_stereo_sound(self, id, file):
        # Add stereo sound to sound manager
        pass
    def add_quad_sound(self, id, file_front, file_back):
        # Add quad sound to sound manager, hacking together two stereo files
        pass
    def start_ambient(self, id, overlap = 1):
        # Start id sound in ambient mode (seamless looping) if not already playing
        # Two instances of sound are played. Initially, we fade in the first instance with a linear ramp of overlap seconds.
        # Then, when first instance is overlap seconds from the end, we start the second instance, and fade out the first instance. (Crossfade)
        # When the first instance is done, we start the first instance again, and fade out the second instance.
        # We probably need some animation loop to handle this in the class instance
        pass
    def stop_ambient(self, id, fade = 1):
        # Gracefully stop id sound in ambient mode (seamless looping) if playing with fade seconds fade out
        pass
    def play_sound(self, id):
        # Play id sound once
        pass
    # In general, if we have a stereo file, we upmix it to quadraphonic by duplicating the stereo file and playing it on the back speakers
    # On the other hand, if we have a quadraphonic file and only two speakers, we downmix it to stereo by playing both files at half volume
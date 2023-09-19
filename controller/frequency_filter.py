import numpy as np

class AudioFrequencyFilter:
    def __init__(self, rate=44100):
        self.rate = rate

    def get_frequency_magnitude(self, data, target_freq):
        # Perform the FFT
        fft_vals = np.fft.fft(data)
        frequencies = np.fft.fftfreq(len(fft_vals), 1/self.rate)
        
        # # Find the nearest matching index for the target frequency
        # target_index = np.abs(frequencies - target_freq).argmin()

        # Instead, find the nearest index first, then on both left and right, use two more indices to get a better average
        target_index = np.abs(frequencies - target_freq).argmin()
        left_index = target_index - 1
        right_index = target_index + 1
        # Now sum the magnitudes of the three indices
        target_index = np.abs(fft_vals[left_index]) + np.abs(fft_vals[target_index]) + np.abs(fft_vals[right_index])
        return target_index

    def get_frequency_loudness(self, chunk, target_freq=2600):
        np_data = np.frombuffer(chunk, dtype=np.int16) / 32768.0
        magnitude_at_target_freq = self.get_frequency_magnitude(np_data, target_freq)
        return magnitude_at_target_freq
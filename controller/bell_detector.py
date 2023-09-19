import numpy as np
from scipy.signal import butter, lfilter
from scipy.fftpack import fft

class BellDetector:
    def __init__(self, rate=44100, chunk=1024, target_freq=2600, relative_amplitude_growth_threshold=2,
                 absolute_amplitude_threshold=1, cooldown_time=0.5):
        self.rate = rate
        self.chunk = chunk
        self.target_freq = target_freq
        self.relative_amplitude_growth_threshold = relative_amplitude_growth_threshold
        self.absolute_amplitude_threshold = absolute_amplitude_threshold
        self.cooldown_time = cooldown_time
        
        self.last_amplitude = 0
        self.time_since_last_trigger = 0

    def bandpass_filter(self, data, lowcut, highcut, order=5):
        nyq = 0.5 * self.rate
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        y = lfilter(b, a, data)
        return y

    def detect_bell(self, audio_data):
        filtered = self.bandpass_filter(audio_data, self.target_freq - 100, self.target_freq + 100)
        
        freqs = np.fft.rfftfreq(self.chunk, 1.0/self.rate)
        spectrum = np.abs(fft(audio_data)[:len(freqs)])
        filtered_spectrum = np.abs(fft(filtered)[:len(freqs)])
        residual_spectrum = spectrum - filtered_spectrum
        
        bell_amplitude = np.mean(filtered_spectrum) / np.mean(residual_spectrum)
        # print(bell_amplitude)
        sound_conditions = (bell_amplitude > self.last_amplitude * self.relative_amplitude_growth_threshold) and (bell_amplitude > self.absolute_amplitude_threshold)
        time_conditions = (self.time_since_last_trigger > self.cooldown_time)
        if sound_conditions and time_conditions:
            self.time_since_last_trigger = 0
            self.last_amplitude = bell_amplitude
            return True
        else:
            if sound_conditions:
                self.time_since_last_trigger = 0
            else:
                self.time_since_last_trigger += 1 / self.rate * self.chunk
            self.last_amplitude = bell_amplitude
            return False

    def reset(self):
        self.last_amplitude = 0
        self.time_since_last_trigger = 0

# Example usage:
if __name__ == "__main__":
    import pyaudio
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=44100, input=True, frames_per_buffer=1024)
    detector = BellDetector()

    try:
        while True:
            data = np.frombuffer(stream.read(1024), dtype=np.int16)
            if detector.detect_bell(data):
                print("Bell detected!")

    except KeyboardInterrupt:
        pass

    stream.stop_stream()
    stream.close()
    audio.terminate()


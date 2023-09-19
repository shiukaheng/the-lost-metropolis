import numpy as np
import serial, sys, time


DMXOPEN = bytes([126])
DMXCLOSE = bytes([231])
DMXINTENSITY = bytes([6]) + bytes([1]) + bytes([2])				
DMXINIT1 = bytes([3]) + bytes([2]) + bytes([0]) + bytes([0]) + bytes([0])
DMXINIT2 = bytes([10]) + bytes([2]) + bytes([0]) + bytes([0]) + bytes([0])


class Dmx:
	def __init__(self, serialPort):
		try:
			self.serial = serial.Serial(serialPort, baudrate=57600)
		except:
			print("Error: could not open Serial Port")
			sys.exit(0)
		self.serial.write(DMXOPEN + DMXINIT1 + DMXCLOSE)
		self.serial.write(DMXOPEN + DMXINIT2 + DMXCLOSE)
		
		self.dmxData = [bytes([0])] * 513   #128 plus "spacer".
		
		
	def setChannel(self, chan, intensity):
		if chan > 512: chan = 512
		if chan < 0: chan = 0
		if intensity > 255: intensity = 255
		if intensity < 0: intensity = 0
		self.dmxData[chan] = bytes([intensity])
		
		
	def blackout(self):
		for i in range(1, 512, 1):
			self.dmxData[i] = bytes([0])
		
		
	def render(self):
		sdata = b''.join(self.dmxData)
		self.serial.write(DMXOPEN + DMXINTENSITY + sdata + DMXCLOSE)

	def setUniverse(self, dataArray):
		"""
			Sets the DMX universe with data from a numpy uint8 array.

			Parameters:
			- dataArray: A numpy uint8 array of size 512.
			"""

		if not isinstance(dataArray, np.ndarray):
			print('Error: Input should be a numpy array.')
			return

		if dataArray.size != 512:
			print('Error: Array should be of size 512.')
			return

		for idx in range(512):
			self.dmxData[idx + 1] = bytes([dataArray[idx]])

if __name__ == "__main__":
	dmx = Dmx('COM7')
	dmx.setUniverse(np.random.randint(0, 255, 512, dtype=np.uint8))
	dmx.render()
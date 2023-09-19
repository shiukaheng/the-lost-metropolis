from dataclasses import dataclass

import numpy as np

@dataclass
class Scene():
    id: str
    duration: float

class SceneManager():
    def __init__(self):
        self.scenes = []
        self.current_scene = None
        self.idle = True
        self.remaining_scene_time = 0
        self.current_scene_order = []
    def update(self, dt):
        if self.idle:
            self.remaining_scene_time -= dt
            if self.remaining_scene_time <= 0:
                self.idle = True
    def bell_trigger(self):
        # If current scene order is empty, fill it with a random permutation of scene
        if len(self.current_scene_order) == 0:
            self.current_scene_order = np.random.permutation(self.scenes).tolist()
        # Pop the first scene from the current scene order
        self.current_scene = self.current_scene_order.pop(0)
        self.idle = False
    def get_scene_state(self):
        if self.current_scene is None:
            return {
                "current_scene": None,
                "idle": True,
                "remaining_scene_time": 0,
                "elapsed_scene_time": 0,
            }
        return {
            "current_scene": self.current_scene,
            "idle": self.idle,
            "remaining_scene_time": self.remaining_scene_time,
            "elapsed_scene_time": self.current_scene.duration - self.remaining_scene_time,
        }
    def add_scene(self, scene):
        self.scenes.append(scene)
    def add_scenes(self, *scenes):
        for scene in scenes:
            self.scenes.append(scene)
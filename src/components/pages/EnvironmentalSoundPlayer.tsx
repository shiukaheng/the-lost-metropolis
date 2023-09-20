import { useLoader } from '@react-three/fiber';
import { PotreeObject } from '../3d/PotreeObject'
import { AnimatedScenesManager } from '../3d/managers/ScenesManager'
import View from './View'
import { FileLoader } from 'three';
import { usePost } from '../../utilities';
import { AudioObject } from '../3d/AudioObject';
import { SeamlessAudioObject } from '../3d/SeamlessAudioObject';
import { TransitionAudioObject } from '../3d/TransitionAudioObject';

function EnvironmentalSoundPlayer() {
    return (
        <View>
            <SeamlessAudioObject overlapLength={5} objectID='1' positional={false} sceneID="ho" url="assets/projector_sounds/ho.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='2' positional={false} sceneID="state_roof" url="assets/projector_sounds/state_roof.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='3' volume={2} positional={false} sceneID="state_writing_shop" url="assets/projector_sounds/state_writing_shop.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='4' positional={false} sceneID="duk_kee"  url="assets/projector_sounds/duk_kee.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='5' positional={false} sceneID="ckl_st" url="assets/projector_sounds/ckl_st.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='6' positional={false} sceneID="jumbo" url="assets/projector_sounds/jumbo.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='7' positional={false} sceneID="bo_kee" url="assets/projector_sounds/bo_kee.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='8' positional={false} sceneID="star_cafe" url="assets/projector_sounds/star_cafe.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='9' volume={2} positional={false} sceneID="sophie" url="assets/projector_sounds/sophie.ogg"/>
            <SeamlessAudioObject overlapLength={5} objectID='10' positional={false} sceneID="ckl_int_night" url="assets/projector_sounds/ckl_int_night.ogg"/>
            {/* <TransitionAudioObject url="assets/projector_sounds/transition.ogg" objectID="11"/> */}
            <SeamlessAudioObject volume={0.4} overlapLength={5} objectID='12' positional={false} sceneID="idle" url="assets/projector_sounds/ambient.ogg"/>
        </View>
    )
}

export default EnvironmentalSoundPlayer
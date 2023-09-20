import { useLoader } from '@react-three/fiber';
import { PotreeObject } from '../3d/PotreeObject'
import { AnimatedScenesManager } from '../3d/managers/ScenesManager'
import View from './View'
import { FileLoader } from 'three';
import { usePost } from '../../utilities';
import { AudioObject } from '../3d/AudioObject';
import { SeamlessAudioObject } from '../3d/SeamlessAudioObject';

function EnvironmentalSoundPlayer() {
    return (
        <View>
            <SeamlessAudioObject objectID='1' positional={false} sceneID="ckl_int_night"/>
            <SeamlessAudioObject objectID='2' positional={false} sceneID="ckl_st_night"/>
            <SeamlessAudioObject objectID='3' positional={false} sceneID="duk_kee"/>
            <SeamlessAudioObject objectID='4' positional={false} sceneID="chan_hung"/>
            <SeamlessAudioObject objectID='5' positional={false} sceneID="sophie"/>
            <SeamlessAudioObject objectID='6' positional={false} sceneID="ho"/>
            <SeamlessAudioObject objectID='7' positional={false} sceneID="state_mall"/>
            <SeamlessAudioObject objectID='8' positional={false} sceneID="jumbo"/>
            <SeamlessAudioObject objectID='9' positional={false} sceneID="bo_kee"/>
            <SeamlessAudioObject objectID='10' positional={false} sceneID="star_cafe"/>
        </View>
    )
}

export default EnvironmentalSoundPlayer
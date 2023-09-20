import { useLoader } from "@react-three/fiber";
import { PotreeObject } from "../3d/PotreeObject";
import { AnimatedScenesManager } from "../3d/managers/ScenesManager";
import View from "./View";
import { FileLoader } from "three";
import { usePost } from "../../utilities";

function Exhibition() {
  return (
    <View
      defaultCameraProps={{
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        fov: 90,
      }}
      // post={localPost || post}
    >
      <PotreeObject
        objectID="79752374-e900-4a14-901b-e29df467853c"
        name="Ho Fuk Wo OK"
        position={[-183, 133.3, 107.6931164336521]}
        rotation={[-1.57079632679, 0, 0]}
        cloudName="metadata.json"
        baseUrl="assets/state_theatre/potree/internal_upper/"
        sceneID="ho"
      />

      <PotreeObject
        objectID="9da4cf3d-95bf-4a09-b9b9-52f9a0f11184"
        name="State Theatre Roof OK"
        position={[-197.46811474950758, 132.1276190856588, 107.6931164336521]}
        rotation={[-1.57079632679, 0, 0]}
        cloudName="metadata.json"
        baseUrl="assets/state_theatre/potree/drone/"
        sceneID="state_roof"
      />

      <PotreeObject
        objectID="6603c8ae-28b1-4131-b876-94f0995813fa"
        name="State Mall OK"
        position={[212.5, 153.11, -90]}
        rotation={[-1.57079632679, 0, 3.141]}
        cloudName="metadata.json"
        baseUrl="assets/state_theatre/potree/writing_shop/"
        sceneID="state_writing_shop"
      />

      <PotreeObject
        objectID="4e534033-7262-41b6-92b0-3e551aac3b39"
        name="Duk Kee OK"
        position={[1.1683750880387227, 3.5940353607413362, -1.4134062228380557]}
        rotation={[
          -1.5707963267989393, -2.762567952174777e-12, 0.5989241361915647,
        ]}
        cloudName="metadata.json"
        baseUrl="assets/cha_kwo_ling/potree/store/"
        sceneID="duk_kee"
      />

      <PotreeObject
        objectID="9ce0ac0e-9f34-4851-a75c-05eef3bb6cec"
        name="Cha Kwo Ling Street OK"
        position={[
          -0.17692555060326365, 1.4507551864353823, 0.3277422133082133,
        ]}
        rotation={[
          -1.5707963267957719, -4.06635836114333e-12, 1.95781204576943,
        ]}
        cloudName="metadata.json"
        baseUrl="assets/cha_kwo_ling/potree/alley_next_to_tea_room/"
        sceneID="ckl_st"
      />

      <PotreeObject
        objectID="e69c225a-5891-4613-9f6b-2f9d10521e23"
        name="Jumbo OK"
        position={[90.36214207787722, 11.976255286675762, 8.055469154003745]}
        rotation={[
          -1.5707963267912441, -1.9907200887736565e-12, -3.0415736942684566,
        ]}
        cloudName="metadata.json"
        baseUrl="assets/jumbo/potree/jumbo/"
        sceneID="jumbo"
      />

      <PotreeObject
        objectID="8ce5644a-71a8-44af-ba1c-d90cc310800e"
        name="Bo Kee OK"
        position={[-9.283036433458548, 9.1547546772458, 6.033882806464068]}
        rotation={[
          -1.5707963267925336, 3.4236502521878265e-12, -1.575864044642955,
        ]}
        cloudName="metadata.json"
        baseUrl="assets/champagne/potree/lg1/"
        sceneID="bo_kee"
      />

      <PotreeObject
        objectID="2b27ddd3-ba51-4e46-9a09-1f00d48f5b84"
        name="Star Cafe OK"
        position={[-21.525777513977815, 8.898276407283584, -22.206281644359414]}
        rotation={[
          -1.5707963267924547, 3.3681391009565687e-12, -1.5989785134118881,
        ]}
        cloudName="metadata.json"
        baseUrl="assets/champagne/potree/lg2/"
        sceneID="star_cafe"
      />
      <PotreeObject
        objectID="b8450226-3be1-400f-b1c0-134dc8c40e6f"
        name="Sophie OK"
        position={[2.7345298936174807, 3.848462114334147, -36.25322025528738]}
        rotation={[
          -1.5707963267916367, 2.584543690176133e-12, -1.8721524972896213,
        ]}
        scale={[1, 1, 1]}
        cloudName="metadata.json"
        baseUrl="assets/champagne/potree/ug1/"
        pointSize={1}
        sceneID="sophie"
      />

      <PotreeObject
        objectID="d42aff36-1478-404b-854b-f7f9bc7ad648"
        name="Cha Kwo Ling Intersection Night OK"
        position={[-11.326697533777525, 24.564289265619543, -9.684909955142633]}
        rotation={[
          -1.5707963267957719, -4.06635836114333e-12, 1.95781204576943,
        ]}
        scale={[1, 1, 1]}
        cloudName="metadata.json"
        baseUrl="assets/cha_kwo_ling/potree/intersection_night/"
        pointSize={1}
        sceneID="ckl_int_night"
      />
    </View>
  );
}

export default Exhibition;

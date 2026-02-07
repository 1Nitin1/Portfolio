import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations, useFBX } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useControls } from "leva";
import * as THREE from "three";

export function Robo(props) {
  const { animation } = props;
  const grp = useRef();

  const { headFollow, cursorFollow } = useControls({
    headFollow: false,
    cursorFollow: false,
  });

  const { scene } = useGLTF("models/Untitled.glb");

  const { animations: TypingAnimations } = useFBX("animations/Typing (1).fbx");
  const { animations: JumpAnimations } = useFBX("animations/Jumping Down.fbx");
  const { animations: DefeatAnimations } = useFBX("animations/Defeated.fbx");
  const { animations: FallAnimations } = useFBX("animations/Falling.fbx");

  TypingAnimations[0].name = "Typing";
  JumpAnimations[0].name = "Jumping Down";
  DefeatAnimations[0].name = "Defeated";
  FallAnimations[0].name = "Falling";

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(
    [
      TypingAnimations[0],
      JumpAnimations[0],
      DefeatAnimations[0],
      FallAnimations[0],
    ],
    grp,
  );

  const { nodes, materials } = useGraph(clone);

  useFrame((state) => {
    if (headFollow) {
      grp.current
        ?.getObjectByName("mixamorigHead")
        ?.lookAt(state.camera.position);
    }
    if (cursorFollow) {
      const target = new THREE.Vector3(state.pointer.x, state.pointer.y, 1);
      grp.current?.getObjectByName("mixamorigHead")?.lookAt(target);
    }
  });

  // Handle animation switching like Avatar (fadeIn/fadeOut)
  useEffect(() => {
    const curr = actions[animation];
    if (!curr) return;

    curr.reset().fadeIn(0.5).play();
    return () => {
      curr.reset().fadeOut(0.5);
    };
  }, [animation, actions]);

  return (
    <group ref={grp} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[0, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="vanguard_Mesh"
            geometry={nodes.vanguard_Mesh.geometry}
            material={materials.VanguardBodyMat}
            skeleton={nodes.vanguard_Mesh.skeleton}
          />
          <skinnedMesh
            name="vanguard_visor"
            geometry={nodes.vanguard_visor.geometry}
            material={materials.Vanguard_VisorMat}
            skeleton={nodes.vanguard_visor.skeleton}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("models/Untitled.glb");

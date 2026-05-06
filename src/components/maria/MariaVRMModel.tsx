'use client'

import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';

const VRM_MODEL_URL = '/models/maria.vrm'; // placeholder — replace with actual model

function AvatarModel() {
  const vrmRef = useRef<VRM | null>(null);
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      VRM_MODEL_URL,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (vrm) {
          vrmRef.current = vrm;
          vrm.scene.rotation.y = Math.PI; // face camera
          groupRef.current.add(vrm.scene);
        }
      },
      undefined,
      (err) => console.warn('[Maria VRM] Model not loaded:', err)
    );

    return () => {
      if (vrmRef.current) {
        groupRef.current.remove(vrmRef.current.scene);
        vrmRef.current = null;
      }
    };
  }, []);

  useFrame((state) => {
    if (vrmRef.current) {
      // Subtle idle breathing
      const t = state.clock.getElapsedTime();
      const bone = vrmRef.current.humanoid?.getNormalizedBoneNode('spine');
      if (bone) {
        bone.rotation.x = Math.sin(t * 0.5) * 0.02;
      }
      vrmRef.current.update(state.clock.getDelta());
    }
  });

  return <primitive object={groupRef.current} position-y={-1} />;
}

export default function MariaAvatarScene() {
  return (
    <div style={{ width: '100%', height: '500px', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)', borderRadius: '20px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 1.5, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <Suspense fallback={null}>
          <AvatarModel />
        </Suspense>

        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
        <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';

const VRM_MODEL_URL = 'https://cdn.pixiv.net/vrm/sample.vrm'; // Standard VRM Placeholder

function AvatarModel() {
  const { scene } = useGLTF(VRM_MODEL_URL, undefined, true);
  const vrmRef = useRef<VRM.VRM>();

  useEffect(() => {
    // Initialize VRM
    THREE.GLTFLoader.Register( (loader) => new VRMLoaderPlugin(loader) );
    
    if (scene) {
      // We look for the VRM instance in the scene
      const vrm = scene.getObjectByName('root') as any; // Simplified for prototype
      // In a real implementation, we use the VRM instance created by the plugin
      vrmRef.current = vrm as any;
    }
  }, [scene]);

  useFrame((state) => {
    if (vrmRef.current) {
      // Simple breathing animation
      const t = state.clock.getElapsedTime();
      vrmRef.current.humanoid.getNormalizedBoneX('spine').rotation.x = Math.sin(t * 0.5) * 0.02;
    }
  });

  return <primitive object={scene} position-y={-1} />;
}

export default function MariaAvatarScene() {
  return (
    <div style={{ width: '100%', height: '500px', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)', borderRadius: '20px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 1.5, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <AvatarModel />
        
        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
        <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}

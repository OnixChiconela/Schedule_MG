'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useTheme } from '../themeContext';

const Loader3DInner = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime();
      meshRef.current.rotation.y = clock.getElapsedTime();
      meshRef.current.scale.setScalar(0.5 + Math.sin(clock.getElapsedTime()) * 0.1);
    }
  });

  const loaderColor = theme === 'light' ? 0xcccccc : 0x1e293b;
  const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: loaderColor });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} geometry={geometry} material={material}>
      <Html center>
        <div
          style={{
            color: theme === 'light' ? '#333' : '#E5E7EB',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          Loading...
        </div>
      </Html>
    </mesh>
  );
};

const Loader3D = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        h-screen
        flex
        flex-col
        justify-center
        items-center
        ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'}
      `}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={theme === 'light' ? 0.5 : 0.6} />
        <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 1 : 0.8} />
        <Loader3DInner />
      </Canvas>
    </div>
  );
};

export default Loader3D;
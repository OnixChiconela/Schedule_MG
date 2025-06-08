// 'use client';

// import { useRef, Suspense, useEffect, useState } from 'react';
// import * as THREE from 'three';
// import { Canvas, useFrame, useThree } from '@react-three/fiber';
// import { Html, OrbitControls } from '@react-three/drei';
// import { useRouter } from 'next/navigation';
// import { createFloatingBoard } from '../boards/FloatingBoard';

// type Vec3 = [number, number, number];
// type Section = {
//   label: string;
//   position: Vec3;
//   count: number;
//   route: string;
// };

// interface ThreeCanvasProps {
//   theme: 'light' | 'dark';
// }

// const spacing = 3.5; // distância entre painéis
// const baseSections = [
//   { label: 'Task', count: 1, route: '/tasks' },
//   { label: 'Calendar', count: 2, route: '/calendar' },
//   { label: 'My Business', count: 0, route: '/business' },
// ];

// const sections: Section[] = baseSections.map((s, i, arr) => {
//   const totalWidth = (arr.length - 1) * spacing;
//   const x = i * spacing - totalWidth / 2;
//   return {
//     ...s,
//     position: [x, 1.5, 0] as Vec3, // Boards at y=1.5
//   };
// });

// // 3D Loader Component
// const Loader = ({ theme, isVisible }: { theme: 'light' | 'dark'; isVisible: boolean }) => {
//   const meshRef = useRef<THREE.Mesh>(null);

//   // Rotate and scale animation
//   useFrame(({ clock }) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = clock.getElapsedTime();
//       meshRef.current.rotation.y = clock.getElapsedTime();
//       meshRef.current.scale.setScalar(0.5 + Math.sin(clock.getElapsedTime()) * 0.1); // Pulse effect
//     }
//   });

//   const loaderColor = theme === 'light' ? 0xcccccc : 0x1e293b;
//   const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 100); // Ring shape
//   const material = new THREE.MeshStandardMaterial({ color: loaderColor, transparent: true, opacity: isVisible ? 1 : 0 });

//   return (
//     <mesh ref={meshRef} position={[0, 1.5, 5]} geometry={geometry} material={material}>
//       <Html center>
//         <div
//           style={{
//             color: theme === 'light' ? '#333' : '#E5E7EB',
//             fontFamily: 'sans-serif',
//             fontSize: '12px',
//             textAlign: 'center',
//             pointerEvents: 'none',
//           }}
//         >
//         </div>
//         </Html>
//       </mesh>
//   );
// };

// const ThreeCanvas = ({ theme }: ThreeCanvasProps) => {
//   console.log(`ThreeCanvas: Received theme ${theme}`);
//   const router = useRouter();
//   const cameraRef = useRef<THREE.PerspectiveCamera>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   // const [targetRoute, setTargetRoute] = useState<string | null>(null);
//   const boardRefs = useRef<THREE.Mesh[]>([]);

//   // Configuração inicial da câmera
//   const CameraSetup = () => {
//     const { camera } = useThree();
//     useEffect(() => {
//       cameraRef.current = camera as THREE.PerspectiveCamera;
//       cameraRef.current.position.set(0, 1.5, 10);
//     }, [camera]);
//     return null;
//   };

//   // Função para lidar com clique na board
//   const handleBoardClick = (route: string) => {
//     if (isLoading) return;

//     setIsLoading(true);
//     // setTargetRoute(route);

//     // Navigate after loading delay
//     setTimeout(() => {
//       router.push(route);
//     }, 1500); // 1.5 seconds delay
//   };

//   // Componente para cada board
//   const Board = ({ label, position, count, route }: Section) => {
//     const meshRef = useRef<THREE.Mesh>(null);

//     // Store mesh ref in array
//     useEffect(() => {
//       if (meshRef.current) {
//         boardRefs.current.push(meshRef.current);
//       }
//       return () => {
//         boardRefs.current = boardRefs.current.filter((ref) => ref !== meshRef.current);
//       };
//     }, []);

//     // Animação de flutuação
//     useFrame(({ clock }) => {
//       if (meshRef.current) {
//         meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.1;
//         // Fade out boards when loading
//         const material = meshRef.current.material as THREE.MeshStandardMaterial;
//         material.transparent = true;
//         material.opacity = isLoading ? Math.max(0.2, material.opacity - 0.02) : 1;
//       }
//     });

//     const boardColor = theme === 'light' ? 0xffffff : 0x1e293b;
//     console.log(`ThreeCanvas: Board "${label}" color set to ${boardColor.toString(16)}`);

//     return (
//       <group position={position} onClick={() => handleBoardClick(route)}>
//         <primitive
//           object={createFloatingBoard({ color: boardColor, label })}
//           ref={meshRef}
//         />
//         <Html center position={[0, 0.3, 0.1]}>
//           <div
//             style={{
//               textAlign: 'center',
//               fontFamily: 'sans-serif',
//               fontSize: '16px',
//               color: theme === 'light' ? '#000' : '#E5E7EB',
//               pointerEvents: 'none',
//               opacity: isLoading ? 0.5 : 1,
//             }}
//           >
//             <div style={{ fontSize: '12px', marginBottom: 4, color: theme === 'light' ? '#333' : '#E5E7EB' }}>
//               {count}
//             </div>
//             <strong>{label}</strong>
//           </div>
//         </Html>
//       </group>
//     );
//   };

//   return (
//     <Canvas shadows camera={{ position: [0, 1.5, 10], fov: 50 }}>
//       <CameraSetup />
//       <ambientLight intensity={theme === 'light' ? 0.5 : 0.6} />
//       <directionalLight
//         position={[10, 10, 5]}
//         intensity={theme === 'light' ? 1 : 0.8}
//         castShadow
//         shadow-mapSize-width={512}
//         shadow-mapSize-height={512}
//       />
//       <Suspense fallback={null}>
//         {sections.map((section, idx) => (
//           <Board key={idx} {...section} />
//         ))}
//         <Loader theme={theme} isVisible={isLoading} />
//       </Suspense>
//       <OrbitControls enableZoom={false} />
//     </Canvas>
//   );
// };

// export default ThreeCanvas;
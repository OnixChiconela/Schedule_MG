// import { useRef } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'

// interface ThreeBackgroundProps {
//   theme: 'light' | 'dark'
//   onEventClick: (event: any) => void
// }

// export default function ThreeBackground({ theme, onEventClick }: ThreeBackgroundProps) {
//   console.log(`ThreeBackground: Rendering with theme ${theme}`)

//   const Notebook = () => {
//     const groupRef = useRef<THREE.Group>(null)
//     const pageRef = useRef<THREE.Mesh>(null)

//     useFrame(({ clock }) => {
//       if (groupRef.current) {
//         groupRef.current.rotation.y += 0.005 // Rotação suave
//       }
//       if (pageRef.current) {
//         pageRef.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.1 // Folhear
//       }
//     })

//     return (
//       <group ref={groupRef} position={[-6, 0, 0]}>
//         <mesh>
//           <boxGeometry args={[3, 4, 0.5]} />
//           <meshStandardMaterial
//             color={theme === 'dark' ? '#1e293b' : '#ffffff'}
//             metalness={theme === 'dark' ? 0.8 : 0.2}
//             roughness={0.4}
//           />
//         </mesh>
//         <mesh ref={pageRef} position={[0, 0, 0.26]}>
//           <planeGeometry args={[2.8, 3.8]} />
//           <meshStandardMaterial
//             color={theme === 'dark' ? '#e2e8f0' : '#f1f5f9'}
//             side={THREE.DoubleSide}
//           />
//         </mesh>
//         <mesh position={[-1.5, 0, 0]}>
//           <cylinderGeometry args={[0.2, 0.2, 4, 16]} />
//           <meshStandardMaterial
//             color={theme === 'dark' ? '#64748b' : '#d1d5db'}
//             metalness={0.5}
//             roughness={0.5}
//           />
//         </mesh>
//       </group>
//     )
//   }

//   return (
//     <Canvas
//       style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }}
//       gl={{ preserveDrawingBuffer: true }}
//       camera={{ position: [0, 0, 10], fov: 60 }}
//     >
//       <ambientLight intensity={theme === 'light' ? 0.8 : 0.4} />
//       <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1 : 0.6} />
//       <Notebook />
//       <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={15} />
//     </Canvas>
//   )
// }
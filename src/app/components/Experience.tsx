'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Panel from './Panel'

export default function Experience() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 5], fov: 50 }}
    >
      {/* Luzes */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[3, 6, 3]}
        intensity={1}
        castShadow
      />

      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      {/* Painéis */}
      <Panel position={[-2.5, 1, 0]} label="Tarefas" />
      <Panel position={[0, 1, 0]} label="Calendário" />
      <Panel position={[2.5, 1, 0]} label="Objetivos" />

      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}

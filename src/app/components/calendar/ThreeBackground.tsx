import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface Event {
  id: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
}

interface ThreeBackgroundProps {
  theme: 'light' | 'dark'
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function ThreeBackground({ theme, events, onEventClick }: ThreeBackgroundProps) {
  const Panel = ({ event, position }: { event: Event; position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.position.y += Math.sin(Date.now() * 0.001 + position[0]) * 0.005
      }
    })

    const color = event.priority === 'High' ? '#ef4444' : event.priority === 'Medium' ? '#f59e0b' : '#10b981'

    return (
      <group position={position} onClick={() => onEventClick(event)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
          <boxGeometry args={[2, 1, 0.2]} />
          <MeshWobbleMaterial
            factor={hovered ? 0.3 : 0.1}
            speed={2}
            color={color}
            emissive={theme === 'dark' ? color : '#000000'}
            emissiveIntensity={theme === 'dark' ? 0.5 : 0}
            metalness={theme === 'dark' ? 0.8 : 0.2}
            roughness={0.4}
          />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.2}
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
        >
          {event.title}
        </Text>
      </group>
    )
  }

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <ambientLight intensity={theme === 'light' ? 0.8 : 0.4} />
      <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1 : 0.6} />
      {events.map((event, index) => (
        <Panel
          key={event.id}
          event={event}
          position={[(index % 3 - 1) * 3, Math.floor(index / 3) * -2, 0]}
        />
      ))}
      <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={20} />
    </Canvas>
  )
}
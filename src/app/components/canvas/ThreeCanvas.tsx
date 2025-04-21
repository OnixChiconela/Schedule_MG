'use client'

import { useRef, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { createFloatingBoard } from '../boards/FloatingBoard'

type Vec3 = [number, number, number]
type Section = {
  label: string
  position: Vec3
  count: number
  route: string
}

interface ThreeCanvasProps {
  theme: 'light' | 'dark'
}

const spacing = 3.5 // distância entre painéis
const baseSections = [
  { label: 'Task', count: 1, route: '/tasks' },
  { label: 'Calendar', count: 2, route: '/calendar' },
  { label: 'My Business', count: 0, route: '/business' },
]

const sections: Section[] = baseSections.map((s, i, arr) => {
  const totalWidth = (arr.length - 1) * spacing
  const x = i * spacing - totalWidth / 2
  return {
    ...s,
    position: [x, 0, 0] as Vec3,
  }
})

const ThreeCanvas = ({ theme }: ThreeCanvasProps) => {
  console.log(`ThreeCanvas: Received theme ${theme}`)
  const router = useRouter()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const animationState = useRef<{
    isAnimating: boolean
    target?: THREE.Vector3
    currentPosition?: THREE.Vector3
    startTime?: number
    duration: number
    route?: string
  }>({ isAnimating: false, duration: 1000 })

  // Configuração inicial da câmera
  const CameraSetup = () => {
    const { camera } = useThree()
    useEffect(() => {
      cameraRef.current = camera as THREE.PerspectiveCamera
      cameraRef.current.position.set(0, 0, 10)
    }, [camera])
    return null
  }

  // Função para lidar com clique na board
  const handleBoardClick = (position: Vec3, route: string) => {
    if (!cameraRef.current || animationState.current.isAnimating) return

    const target = new THREE.Vector3(...position)
    const currentPosition = cameraRef.current.position.clone()

    animationState.current = {
      isAnimating: true,
      target,
      currentPosition,
      startTime: Date.now(),
      duration: 1000,
      route,
    }
  }

  // Componente para cada board
  const Board = ({ label, position, count, route }: Section) => {
    const meshRef = useRef<THREE.Mesh>(null)

    // Animação de flutuação
    useFrame(({ clock }) => {
      if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.1
      }
    })

    // Animação da câmera e transparência durante transição
    useFrame(() => {
      const { isAnimating, target, currentPosition, startTime, duration, route } = animationState.current
      if (!isAnimating || !cameraRef.current || !meshRef.current || !startTime) return

      const elapsedTime = Date.now() - startTime
      const progress = Math.min(elapsedTime / duration, 1)

      // Movimenta a câmera
      cameraRef.current.position.lerpVectors(currentPosition!, target!, progress)

      // Ajusta opacidade e escala das outras boards
      const isTargetBoard = meshRef.current.position.equals(target!)
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.transparent = true
      material.opacity = isTargetBoard ? 1 : Math.max(0.3, 1 - progress * 0.7)
      const scale = isTargetBoard ? 1 : Math.max(0.5, 1 - progress * 0.5)
      meshRef.current.scale.set(scale, scale, scale)

      // Finaliza a animação e redireciona
      if (progress >= 1) {
        animationState.current.isAnimating = false
        router.push(route!)
      }
    })

    const boardColor = theme === 'light' ? 0xffffff : 0x1e293b
    console.log(`ThreeCanvas: Board "${label}" color set to ${boardColor.toString(16)}`)

    return (
      <group position={position} onClick={() => handleBoardClick(position, route)}>
        <primitive
          object={createFloatingBoard({ color: boardColor, label })}
          ref={meshRef}
        />
        <Html center position={[0, 0.3, 0.1]}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'sans-serif',
              fontSize: '16px',
              color: theme === 'light' ? '#000' : '#E5E7EB',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '12px', marginBottom: 4, color: theme === 'light' ? '#333' : '#E5E7EB' }}>
              {count}
            </div>
            <strong>{label}</strong>
          </div>
        </Html>
      </group>
    )
  }

  return (
    <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
      <CameraSetup />
      <ambientLight intensity={theme === 'light' ? 0.5 : 0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={theme === 'light' ? 1 : 0.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <Suspense fallback={null}>
        {sections.map((section, idx) => (
          <Board key={idx} {...section} />
        ))}
      </Suspense>
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}

export default ThreeCanvas
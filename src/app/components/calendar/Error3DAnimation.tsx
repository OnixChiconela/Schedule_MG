import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Text, RoundedBox, Sparkles, Line } from '@react-three/drei'
import * as THREE from 'three'

interface Error3DAnimationProps {
  theme: 'light' | 'dark'
  isVisible: boolean
}

export default function Error3DAnimation({ theme, isVisible }: Error3DAnimationProps) {
  console.log(`Error3DAnimation: Rendering with theme ${theme}, isVisible ${isVisible}`)

  const CalendarError = () => {
    const groupRef = useRef<THREE.Group>(null)
    const baseRef = useRef<THREE.Mesh>(null)
    const textBgRef = useRef<THREE.Mesh>(null)
    const timeRef = useRef(0)

    useEffect(() => {
      if (isVisible) {
        timeRef.current = 3
        console.log('CalendarError: Started')
      }
    }, [isVisible])

    useFrame(({ clock }) => {
      if (groupRef.current && baseRef.current && textBgRef.current && timeRef.current > 0) {
        const elapsed = clock.getElapsedTime()
        groupRef.current.rotation.y = Math.sin(elapsed * 0.5) * 0.25
        groupRef.current.rotation.x = Math.max(0, 0.3 - elapsed * 0.3)
        groupRef.current.scale.setScalar(0.75 + Math.sin(elapsed * 2.5) * 0.02)
        const baseMaterial = baseRef.current.material as THREE.MeshPhysicalMaterial
        baseMaterial.emissiveIntensity = Math.sin(elapsed * 1.5) * 0.1 + 0.05
        groupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            const material = child.material as
              | THREE.MeshStandardMaterial
              | THREE.MeshPhysicalMaterial
              | THREE.LineBasicMaterial
              | THREE.Material[]
            if (Array.isArray(material)) {
              material.forEach((mat) => {
                if ('opacity' in mat && typeof mat.opacity === 'number') {
                  mat.opacity = timeRef.current / 3
                  mat.transparent = true
                }
              })
            } else if ('opacity' in material && typeof material.opacity === 'number') {
              material.opacity = timeRef.current / 3
              material.transparent = true
            }
          }
        })
        const textBgMaterial = textBgRef.current.material as THREE.MeshStandardMaterial
        textBgMaterial.opacity = timeRef.current / 3 * 0.85
        timeRef.current -= 1 / 60
      }
    })

    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        <RoundedBox
          args={[1.4, 1.4, 0.1]}
          radius={0.2}
          smoothness={4}
          position={[0, 1, 0]}
          ref={baseRef}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={theme === 'dark' ? '#1e293b' : '#ffffff'}
            transparent
            opacity={0}
            roughness={0.3}
            metalness={0.4}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            emissive={theme === 'dark' ? '#f59e0b' : '#f59e0b'}
            emissiveIntensity={0.05}
          />
        </RoundedBox>
        <mesh position={[0, 1, 0.05]}>
          <ringGeometry args={[0.7, 0.75, 32]} />
          <meshStandardMaterial
            color={theme === 'dark' ? '#64748b' : '#d1d5db'}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 1.7, 0.05]} castShadow>
          <boxGeometry args={[1.2, 0.2, 0.1]} />
          <meshStandardMaterial
            color={theme === 'dark' ? '#64748b' : '#d1d5db'}
            transparent
            opacity={0}
            roughness={0.4}
          />
        </mesh>
        {[...Array(5)].map((_, row) =>
          [...Array(6)].map((_, col) => (
            <group key={`${row}-${col}`} position={[-0.5 + col * 0.18, 1.35 - row * 0.18, 0.05]}>
              <mesh>
                <planeGeometry args={[0.16, 0.16]} />
                <meshStandardMaterial
                  color={theme === 'dark' ? '#e2e8f0' : '#f1f5f9'}
                  transparent
                  opacity={0}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <Text
                fontSize={0.07}
                color={theme === 'dark' ? '#0f172a' : '#1e293b'}
                anchorX="center"
                anchorY="middle"
                material-transparent
                material-opacity={0}
              >
                {(row * 6 + col + 1).toString().padStart(2, '0')}
              </Text>
            </group>
          ))
        )}
        {[...Array(4)].map((_, i) => (
          <Line
            key={`h-line-${i}`}
            points={[
              [-0.6, 1.35 - (i + 1) * 0.18, 0.06],
              [0.48, 1.35 - (i + 1) * 0.18, 0.06],
            ]}
            color={theme === 'dark' ? '#64748b' : '#d1d5db'}
            lineWidth={1}
            transparent
            opacity={0}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <Line
            key={`v-line-${i}`}
            points={[
              [-0.5 + (i + 1) * 0.18, 1.35, 0.06],
              [-0.5 + (i + 1) * 0.18, 0.63, 0.06],
            ]}
            color={theme === 'dark' ? '#64748b' : '#d1d5db'}
            lineWidth={1}
            transparent
            opacity={0}
          />
        ))}
        <Text
          position={[0.45, 1.25, 0.1]}
          fontSize={0.25}
          color={theme === 'dark' ? '#ef4444' : '#b91c1c'}
          anchorX="center"
          anchorY="middle"
          material-transparent
          material-opacity={0}
        >
          X
        </Text>
        <RoundedBox
          args={[3.2, 0.7, 0.01]}
          radius={0.1}
          smoothness={4}
          position={[0, -0.4, 0]}
          ref={textBgRef}
        >
          <meshStandardMaterial
            color={theme === 'dark' ? '#1e293b' : '#ffffff'}
            transparent
            opacity={0}
            roughness={0.5}
          />
        </RoundedBox>
        <Text
          position={[0, -0.4, 0.01]}
          fontSize={0.07}
          color={theme === 'dark' ? '#ef4444' : '#b91c1c'}
          anchorX="center"
          anchorY="middle"
          material-transparent
          material-opacity={0}
        >
          Não é possível selecionar datas passadas
        </Text>
        <Sparkles
          count={3}
          position={[0, 1, 0]}
          scale={0.5}
          size={1}
          speed={0.2}
          color={theme === 'dark' ? '#f59e0b' : '#f59e0b'}
          visible={isVisible}
        />
      </group>
    )
  }

  if (!isVisible) return null

  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 20,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        background: 'rgba(0, 0, 0, 0.15)',
      }}
      camera={{ position: [0, 0, 3.5], fov: 60 }}
      shadows
    >
      <ambientLight intensity={theme === 'light' ? 0.4 : 0.2} />
      <hemisphereLight
        color="#ffffff"
        groundColor="#64748b"
        intensity={theme === 'light' ? 0.6 : 0.4}
      />
      <spotLight
        position={[3, 3, 3]}
        angle={0.4}
        penumbra={0.7}
        intensity={theme === 'light' ? 3 : 2.5}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <CalendarError />
    </Canvas>
  )
}
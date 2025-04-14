import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface PanelProps {
  position: [number, number, number]
  label: string
}

export default function Panel({ position, label }: PanelProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 0.1]} />
        <meshStandardMaterial color={0xf5f5f5} />
      </mesh>
      <Text
        position={[0, 0, 0.07]}
        fontSize={0.35}
        color="#222"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

// 'use client'

// import { Canvas } from '@react-three/fiber'
// import { OrbitControls, Environment } from '@react-three/drei'
// import { Suspense } from 'react'

// type Task = {
//   id: number
//   title: string
//   status: 'To Do' | 'In Progress' | 'Done'
//   createdDate: string
//   dueDate: string
//   priority: 'Low' | 'Medium' | 'High'
//   isCompleted: boolean
// }

// type Corner = {
//   id: number
//   title: string
//   tasks: Task[]
// }

// interface TaskKanban3DProps {
//   corner: Corner
// }

// const TaskPanel: React.FC<{
//   task: Task
//   position: [number, number, number]
// }> = ({ task, position }) => {
//   const getColor = () => {
//     switch (task.status) {
//       case 'To Do':
//         return '#3B82F6' // Blue
//       case 'In Progress':
//         return '#F59E0B' // Yellow
//       case 'Done':
//         return '#10B981' // Green
//       default:
//         return '#FFFFFF'
//     }
//   }

//   return (
//     <group position={position}>
//       <mesh>
//         <boxGeometry args={[2, 1, 0.1]} />
//         <meshStandardMaterial color={getColor()} />
//       </mesh>
//       <mesh position={[0, 0, 0.06]}>
//         <TextGeometry
//           args={[task.title, { font: 'helvetiker', size: 0.1, height: 0.01 }]}
//         />
//         <meshStandardMaterial color="#000000" />
//       </mesh>
//     </group>
//   )
// }

// const TaskKanban3D: React.FC<TaskKanban3DProps> = ({ corner }) => {
//   return (
//     <div className="h-96 w-full">
//       <Canvas gl={{ preserveDrawingBuffer: true }}>
//         <Suspense fallback={null}>
//           <ambientLight intensity={0.5} />
//           <pointLight position={[10, 10, 10]} />
//           {corner.tasks.map((task, index) => (
//             <TaskPanel
//               key={task.id}
//               task={task}
//               position={[index * 2.5 - (corner.tasks.length - 1) * 1.25, 0, 0]}
//             />
//           ))}
//           <OrbitControls />
//           <Environment preset="sunset" />
//         </Suspense>
//       </Canvas>
//     </div>
//   )
// }

// export default TaskKanban3D
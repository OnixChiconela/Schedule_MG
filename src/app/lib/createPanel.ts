import * as THREE from 'three'

export function createPanel(label: string, onClick: () => void): THREE.Group {
  const group = new THREE.Group()

  // Painel
  const geometry = new THREE.BoxGeometry(2.5, 1.4, 0.1)
  const material = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
  const board = new THREE.Mesh(geometry, material)
  board.castShadow = true
  board.receiveShadow = true
  group.add(board)

  // Adicionar evento de clique
  board.userData.onClick = onClick

  // Texto
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#222'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  const textGeo = new THREE.PlaneGeometry(2, 0.5)
  const textMesh = new THREE.Mesh(textGeo, textMat)
  textMesh.position.z = 0.06
  group.add(textMesh)

  return group
}

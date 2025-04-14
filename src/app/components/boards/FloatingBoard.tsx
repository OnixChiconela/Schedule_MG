import * as THREE from 'three'

export const createFloatingBoard = (
  options: {
    color?: number,
    label?: string,
    imageUrl?: string
  } = {}
): THREE.Mesh => {
  const { color = 0xffffff, label, imageUrl } = options
  const geometry = new THREE.BoxGeometry(3, 1.2, 0.1)

  const material = new THREE.MeshStandardMaterial({ color })
  const board = new THREE.Mesh(geometry, material)

  board.castShadow = true
  board.receiveShadow = true

  // Adiciona imagem, se tiver
  if (imageUrl) {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(imageUrl)
    const imgMaterial = new THREE.MeshBasicMaterial({ map: texture })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imgMaterial)
    plane.position.set(0, 0, 0.06)
    board.add(plane)
  }

  // Adiciona texto, se tiver
  if (label) {
    // Poderíamos usar um helper para texto 3D
  }

  return board
}

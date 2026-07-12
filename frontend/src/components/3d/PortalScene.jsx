import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// Inner component to access R3F hooks (useFrame, useThree)
function SceneContent({ scrollProgress }) {
  const crystalRef = useRef()
  const particlesRef = useRef()
  const { camera, pointer } = useThree()

  // Generate random particles
  const particleCount = 400
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const spd = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      // Random coordinates in a sphere-like shape
      const r = 2.5 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8

      spd[i] = 0.08 + Math.random() * 0.12
    }
    return [pos, spd]
  }, [])

  useFrame((state, delta) => {
    // 1. Crystal morph and rotate
    if (crystalRef.current) {
      crystalRef.current.rotation.x += delta * 0.12
      crystalRef.current.rotation.y += delta * 0.18
      // Scale crystal based on scroll progress
      const targetScale = 1.1 + scrollProgress * 3.5
      crystalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }

    // 2. Volumetric particles drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.04
      const array = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        // Move particles along Y (upwards drift)
        array[i * 3 + 1] += speeds[i] * delta * 0.6
        if (array[i * 3 + 1] > 5) {
          array[i * 3 + 1] = -5
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    // 3. Mouse Reactive Camera rotation offsets (smooth lerping)
    const targetX = pointer.x * 0.5
    const targetY = pointer.y * 0.4
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetX * 0.07, 0.06)
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -targetY * 0.07, 0.06)

    // 4. Camera dolly-in based on scrollProgress
    const targetZ = THREE.MathUtils.lerp(5.5, 1.4, scrollProgress)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08)
  })

  return (
    <>
      {/* Volumetric ambient fog */}
      <fog attach="fog" args={['#09090b', 1.5, 8]} />

      {/* Lighting setup */}
      <ambientLight intensity={0.25} />
      <pointLight position={[8, 8, 8]} intensity={1.2} color="#7C3AED" />
      <pointLight position={[-8, -8, -8]} intensity={1} color="#00D4FF" />
      <spotLight 
        position={[0, 4, 4]} 
        intensity={1.8} 
        angle={0.5} 
        penumbra={1} 
        color="#A855F7" 
      />

      {/* Rotating central crystal portal */}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh ref={crystalRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.2, 1]} />
          <MeshDistortMaterial
            color="#a855f7"
            roughness={0.15}
            metalness={0.85}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            distort={0.4}
            speed={1.6}
            wireframe={true}
          />
        </mesh>
        
        {/* Inner solid glowing core */}
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.6, 2]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#7c3aed"
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Volumetric particle node system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#7dd3fc"
          transparent
          opacity={0.6}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

export default function PortalScene({ scrollProgress = 0 }) {
  return (
    <div className="w-full h-full relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08)_0%,transparent_60%)] pointer-events-none z-0" />
      
      <Canvas 
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        style={{ background: 'transparent' }}
        className="w-full h-full relative z-10"
      >
        <SceneContent scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}

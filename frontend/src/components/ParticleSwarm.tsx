import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ParticleSwarm = ({ count = 5000 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);

  // Generate random positions and colors for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      temp.push({ x, y, z, factor: Math.random() });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Swarm-like organic movement
      const t = time * particle.factor;
      
      dummy.position.set(
        particle.x + Math.sin(t) * 2,
        particle.y + Math.cos(t * 1.5) * 2,
        particle.z + Math.sin(t * 0.8) * 2
      );

      // Subtle scaling effect
      const scale = 0.5 + Math.sin(t * particle.factor) * 0.2;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      if (mesh.current) {
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
    });

    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
    
    // Make the light pan slightly
    if (light.current) {
      light.current.position.x = Math.sin(time * 0.3) * 5;
      light.current.position.y = Math.cos(time * 0.2) * 5;
    }
  });

  return (
    <>
      <pointLight ref={light} position={[0, 0, 5]} distance={15} intensity={5} color="#10B981" />
      <ambientLight intensity={0.2} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        {/* Using a subtle, glowing sphere for agents */}
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </>
  );
};

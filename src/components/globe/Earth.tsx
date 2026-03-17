import { useRef } from "react";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Fallback textures or simple color if texture fails
  // Using a procedural look for the "Premium" feel if textures are tricky
  return (
    <group rotation={[0, 0, 0.4]}>
      <Sphere args={[2, 64, 64]} ref={meshRef}>
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.2}
          emissive="#111111"
        />
      </Sphere>
      
      {/* City lights / atmosphere glow effect */}
      <Sphere args={[2.02, 64, 64]}>
        <meshBasicMaterial
          color="#4facfe"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Decorative Atmosphere Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.21, 64]} />
        <meshBasicMaterial color="#4facfe" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

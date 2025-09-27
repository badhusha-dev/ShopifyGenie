import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Cone, Octahedron, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface LoyaltyData {
  tier: string;
  count: number;
  color: string;
  height: number;
}

interface CustomerLoyalty3DProps {
  data: LoyaltyData[];
  width?: number;
  height?: number;
}

const LoyaltyPyramid: React.FC<{ 
  position: [number, number, number]; 
  size: number; 
  color: string; 
  tier: string;
  count: number;
  height: number;
}> = ({ position, size, color, tier, count, height }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.3}>
      <group position={position}>
        <Cone ref={meshRef} args={[size, height, 8]}>
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.9}
            emissive={color}
            emissiveIntensity={0.2}
            metalness={0.5}
            roughness={0.4}
          />
        </Cone>
        <Text
          position={[0, height / 2 + 0.6, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          fontWeight="bold"
        >
          {tier}
        </Text>
        <Text
          position={[0, height / 2 + 0.9, 0]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {count} customers
        </Text>
      </group>
    </Float>
  );
};

const CustomerLoyalty3D: React.FC<CustomerLoyalty3DProps> = ({ 
  data, 
  width = 400, 
  height = 300 
}) => {
  const maxCount = Math.max(...data.map(item => item.count));
  const minSize = 0.5;
  const maxSize = 1.5;
  
  const pyramids = useMemo(() => {
    return data.map((item, index) => {
      const size = minSize + ((item.count / maxCount) * (maxSize - minSize));
      const x = (index - data.length / 2) * 2.5;
      const y = item.height / 2;
      
      return (
        <LoyaltyPyramid
          key={item.tier}
          position={[x, y, 0]}
          size={size}
          color={item.color}
          tier={item.tier}
          count={item.count}
          height={item.height}
        />
      );
    });
  }, [data, maxCount, minSize]);

  return (
    <div style={{ width, height, background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 3, 10], fov: 45 }}>
        <Environment preset="apartment" />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#06B6D4" />
        <pointLight position={[10, -10, 5]} intensity={0.6} color="#10B981" />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#F59E0B" />
        
        {pyramids}
        
        {/* Base platform */}
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
          <Octahedron args={[4, 0]} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial 
              color="#1e293b" 
              transparent 
              opacity={0.4}
              metalness={0.3}
              roughness={0.7}
            />
          </Octahedron>
        </Float>
        
        <Text
          position={[0, -2, 0]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Customer Loyalty Tiers
        </Text>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  );
};

export default CustomerLoyalty3D;

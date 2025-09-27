import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface ProductData {
  name: string;
  value: number;
  color: string;
}

interface ProductDistributionProps {
  data: ProductData[];
  width?: number;
  height?: number;
}

const ProductSphere: React.FC<{ 
  position: [number, number, number]; 
  size: number; 
  color: string; 
  name: string;
  value: number;
}> = ({ position, size, color, name, value }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[1]) * 0.4;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
      <Text
        position={[0, size + 0.6, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        fontWeight="bold"
      >
        {name}
      </Text>
      <Text
        position={[0, size + 0.9, 0]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {value}%
      </Text>
    </group>
  );
};

const ProductDistribution: React.FC<ProductDistributionProps> = ({ 
  data, 
  width = 400, 
  height = 300 
}) => {
  const maxSize = 1.5;
  const minSize = 0.3;
  
  const spheres = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return data.map((item, index) => {
      const size = minSize + ((item.value / total) * (maxSize - minSize));
      const angle = (index / data.length) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(index * 0.5) * 0.5;
      
      return (
        <ProductSphere
          key={item.name}
          position={[x, y, z]}
          size={size}
          color={item.color}
          name={item.name}
          value={item.value}
        />
      );
    });
  }, [data, maxSize, minSize]);

  return (
    <div style={{ width, height, background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 3, 10], fov: 45 }}>
        <Environment preset="sunset" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#3B82F6" />
        <pointLight position={[10, -10, 5]} intensity={0.6} color="#10B981" />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#8B5CF6" />
        
        {spheres}
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default ProductDistribution;

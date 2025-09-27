import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Cylinder, Torus, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface RevenueData {
  source: string;
  amount: number;
  color: string;
}

interface RevenueFlowProps {
  data: RevenueData[];
  width?: number;
  height?: number;
}

const RevenueRing: React.FC<{ 
  position: [number, number, number]; 
  size: number; 
  color: string; 
  source: string;
  amount: number;
}> = ({ position, size, color, source, amount }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Torus ref={meshRef} args={[size, 0.15, 16, 100]}>
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.8}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </Torus>
        <Text
          position={[0, size + 0.4, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          fontWeight="bold"
        >
          {source}
        </Text>
        <Text
          position={[0, size + 0.7, 0]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          ${amount.toLocaleString()}
        </Text>
      </group>
    </Float>
  );
};

const RevenueFlow: React.FC<RevenueFlowProps> = ({ 
  data, 
  width = 400, 
  height = 300 
}) => {
  const maxAmount = Math.max(...data.map(item => item.amount));
  const minSize = 0.8;
  const maxSize = 2.5;
  
  const rings = useMemo(() => {
    return data.map((item, index) => {
      const size = minSize + ((item.amount / maxAmount) * (maxSize - minSize));
      const angle = (index / data.length) * Math.PI * 2;
      const radius = 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(index * 0.3) * 0.5;
      
      return (
        <RevenueRing
          key={item.source}
          position={[x, y, z]}
          size={size}
          color={item.color}
          source={item.source}
          amount={item.amount}
        />
      );
    });
  }, [data, maxAmount, minSize]);

  return (
    <div style={{ width, height, background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
        <Environment preset="dawn" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#8B5CF6" />
        <pointLight position={[10, -10, 5]} intensity={0.6} color="#3B82F6" />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#F59E0B" />
        
        {rings}
        
        {/* Central hub */}
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
          <Cylinder args={[0.6, 0.6, 0.3, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color="#F59E0B" 
              emissive="#F59E0B"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </Cylinder>
        </Float>
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Revenue Sources
        </Text>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};

export default RevenueFlow;

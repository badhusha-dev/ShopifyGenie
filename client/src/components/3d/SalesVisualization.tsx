import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface SalesData {
  month: string;
  sales: number;
  maxSales: number;
}

interface SalesVisualizationProps {
  data: SalesData[];
  width?: number;
  height?: number;
}

const Bar3D: React.FC<{ position: [number, number, number]; height: number; color: string; month: string; sales: number }> = ({ 
  position, 
  height, 
  color, 
  month,
  sales
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.position.y = height / 2 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, height, 0.8]} position={[0, height / 2, 0]}>
        <meshStandardMaterial 
          color={color} 
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Box>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {month}
      </Text>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        ${sales.toLocaleString()}
      </Text>
    </group>
  );
};

const SalesVisualization: React.FC<SalesVisualizationProps> = ({ 
  data, 
  width = 400, 
  height = 300 
}) => {
  const maxHeight = 5;
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
  
  const bars = useMemo(() => {
    return data.map((item, index) => {
      const height = (item.sales / item.maxSales) * maxHeight;
      const x = (index - data.length / 2) * 1.2;
      const color = colors[index % colors.length];
      
      return (
        <Bar3D
          key={item.month}
          position={[x, 0, 0]}
          height={height}
          color={color}
          month={item.month}
          sales={item.sales}
        />
      );
    });
  }, [data, maxHeight, colors]);

  return (
    <div style={{ width, height, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.6} color="#3B82F6" />
        <pointLight position={[10, -10, 5]} intensity={0.4} color="#10B981" />
        
        {bars}
        
        {/* Grid floor */}
        <gridHelper args={[20, 20, '#374151', '#374151']} position={[0, -0.1, 0]} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default SalesVisualization;

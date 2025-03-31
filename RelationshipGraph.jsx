// components/visualizations/RelationshipGraph.jsx
'use client'
import { useEffect, useRef } from 'react';

export default function RelationshipGraph({ data }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || !data.nodes || !data.links) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1e1e2d';
    ctx.fillRect(0, 0, width, height);
    
    // Draw a simple force-directed layout
    // In a real implementation, you'd use a proper force-directed layout algorithm
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw primary node
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label primary node
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.primaryNode.label, centerX, centerY);
    
    // Draw related nodes in a circle around the primary node
    const radius = 150;
    const nodeCount = data.nodes.length - 1; // Excluding primary node
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Draw connection line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw related node
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      
      // Different colors based on relationship type
      const nodeData = data.nodes[i + 1]; // +1 because we're skipping the primary node
      switch (nodeData.type) {
        case 'predecessor':
          ctx.fillStyle = '#60a5fa'; // Blue
          break;
        case 'successor':
          ctx.fillStyle = '#34d399'; // Green
          break;
        case 'variant':
          ctx.fillStyle = '#a78bfa'; // Purple
          break;
        case 'competitor':
          ctx.fillStyle = '#f59e0b'; // Amber
          break;
        default:
          ctx.fillStyle = '#6b7280'; // Gray
      }
      
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Label related node
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.fillText(nodeData.label, x, y);
    }
  }, [data]);
  
  return (
    <div className="h-72 w-full flex justify-center">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={300} 
        className="max-w-full"
      />
    </div>
  );
}
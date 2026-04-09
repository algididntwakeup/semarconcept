// src/components/DebugTestComponent.tsx
import React, { useState, useEffect } from 'react';
import { useComponentProfiler } from './debug/collectors/ViewCollector';
import { getDebugManager } from '../utils/debug-manager';

const DebugTestComponent: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const profiler = useComponentProfiler('DebugTestComponent');

  useEffect(() => {
    // Test API call
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Test API call failed:', err));

    // Test manual logging
    const debugManager = getDebugManager();
    debugManager.log('info', 'DebugTestComponent mounted');
    
    profiler.trackCustomEvent('component_mounted');
  }, []);

  const handleTestClick = () => {
    profiler.trackCustomEvent('test_button_clicked');
    
    // Force a slow render for testing
    const start = Date.now();
    while (Date.now() - start < 150) {
      // Intentional delay to test slow render detection
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Debug Test Component</h3>
      <p>This component tests the debug system.</p>
      <button onClick={handleTestClick}>Test Slow Render</button>
      <p>Data items: {data.length}</p>
    </div>
  );
};

export default DebugTestComponent;
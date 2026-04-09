// src/components/ExampleComponent.tsx
import React, { useState } from 'react';
import { useComponentProfiler } from './debug/collectors/ViewCollector';

const ExampleComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // ✅ ADD: Component profiling
  const profiler = useComponentProfiler('ExampleComponent', { count });

  const handleClick = () => {
    setCount(prev => prev + 1);
    profiler.trackCustomEvent('button_click', { newCount: count + 1 });
  };

  return (
    <div>
      <h2>Example Component</h2>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};

export default ExampleComponent;

import React from 'react';

function TestComponent() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>JAMB Success Site</h1>
      <p>Site is working!</p>
      <div style={{ 
        background: '#2563eb', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2>Test Component Loaded Successfully</h2>
        <p>If you can see this, the basic React setup is working.</p>
      </div>
    </div>
  );
}

export default TestComponent;

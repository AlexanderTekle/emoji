import React from 'react';
import HandGestureRecognition from './HandGestureRecognition';
import './App.css';

function App() {
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <HandGestureRecognition />
    </div>
  );
}

export default App;
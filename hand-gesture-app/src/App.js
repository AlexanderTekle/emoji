import React from 'react';
import HandGestureRecognition from './HandGestureRecognition';
import './App.css'; // Assuming you have some basic styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hand Gesture Recognition</h1>
      </header>
      <main>
        <HandGestureRecognition />
      </main>
      <footer>
        <p>Powered by TensorFlow.js and React</p>
      </footer>
    </div>
  );
}

export default App;
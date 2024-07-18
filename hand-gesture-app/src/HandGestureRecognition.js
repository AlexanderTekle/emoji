import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import WebcamCapture from './WebcamCapture';

const HandGestureRecognition = () => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const classLabels = ['Thumbs Up', 'Open palm', 'Closed fist', 'Peace sign', 'Pointing finger'];

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(process.env.PUBLIC_URL + '/tensorflow2/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };
    loadModel();
  }, []);

  const preprocessImage = (imageTensor) => {
    return tf.tidy(() => {
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      const scaled = resized.div(255);
      const mean = tf.tensor([0.485, 0.456, 0.406]);
      const std = tf.tensor([0.229, 0.224, 0.225]);
      const normalized = scaled.sub(mean).div(std);
      return normalized.expandDims(0);
    });
  };

  const handleCapture = useCallback(async (imageSrc) => {
    if (model && videoRef.current) {
      try {
        const img = new Image();
        img.src = imageSrc;
        await img.decode();

        const tensor = tf.tidy(() => {
          const imgTensor = tf.browser.fromPixels(img);
          return preprocessImage(imgTensor);
        });

        const result = await model.predict(tensor);
        const [label, bbox] = processPrediction(result);
        setPrediction(label ? { label, bbox } : null);
        if (label) {
          drawBoundingBox(label, bbox);
        } else {
          clearCanvas();
        }
        tensor.dispose();
        Array.isArray(result) ? result.forEach(t => t.dispose()) : result.dispose();
      } catch (error) {
        console.error('Prediction failed:', error);
      }
    }
  }, [model]);

  const processPrediction = (result) => {
    const [classTensor, bboxTensor] = result;
    
    const classProbs = classTensor.dataSync();
    const maxProb = Math.max(...classProbs);
    if (maxProb > 0.7) {
      const classIndex = classProbs.indexOf(maxProb);
      const label = classLabels[classIndex];

      const bboxCoords = bboxTensor.dataSync();
      const bbox = Array.from(bboxCoords).map(coord => Math.round(coord));

      return [label, bbox];
    }
    return [null, null];
  };

  const drawBoundingBox = (label, bbox) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Scale bounding box coordinates
    const scaleX = canvas.width / 1920;
    const scaleY = canvas.height / 1080;
    const [x, y, width, height] = bbox.map((coord, index) => {
      return index % 2 === 0 ? coord * scaleX : coord * scaleY;
    });
    
    // Draw bounding box
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw label
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px Arial';
    ctx.fillText(label, x, y - 5);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <WebcamCapture onCapture={handleCapture} videoRef={videoRef} />
      <canvas 
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      {prediction && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '10px'
        }}>
          <p>Gesture: {prediction.label}</p>
          <p>Bounding Box: {JSON.stringify(prediction.bbox)}</p>
        </div>
      )}
    </div>
  );
};

export default HandGestureRecognition;
import React, { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture, videoRef }) => {
  const webcamRef = useRef(null);
  const animationRef = useRef(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      onCapture(imageSrc);
    }
    animationRef.current = requestAnimationFrame(capture);
  }, [onCapture]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(capture);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [capture]);

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      videoRef.current = webcamRef.current.video;
    }
  }, [webcamRef, videoRef]);

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      videoConstraints={{
        width: 640,
        height: 480,
        facingMode: "user"
      }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  );
};

export default WebcamCapture;
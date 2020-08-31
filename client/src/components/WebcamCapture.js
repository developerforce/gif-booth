import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';

const WebcamStreamCapture = ({
  handleError,
  handleLoaded,
  handleStopCapture,
  isPlaying,
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCapture = useCallback(() => {
    var constraints = {
      video: true,
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function success(stream) {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
          mimeType: 'video/webm',
        });
        mediaRecorderRef.current.addEventListener(
          'dataavailable',
          handleDataAvailable
        );
        mediaRecorderRef.current.start();
      })
      .catch((err) => {
        console.log(err.toString());
        handleError(err);
      });
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable, handleError]);

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current instanceof MediaRecorder)
      mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  useEffect(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      handleStopCapture(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks, handleStopCapture]);

  useEffect(() => {
    if (isPlaying) handleStartCapture();
    if (!isPlaying && capturing) handleStopCaptureClick();
  }, [isPlaying, capturing, handleStartCapture, handleStopCaptureClick]);

  return (
    <Webcam
      className="gif-video"
      audio={false}
      ref={webcamRef}
      onUserMedia={handleLoaded}
      onUserMediaError={handleError}
      videoConstraints={{ aspectRatio: 1 + 1 / 3 }}
    />
  );
};

WebcamStreamCapture.propTypes = {
  handleError: PropTypes.func.isRequired,
  handleStopCapture: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  handleLoaded: PropTypes.func.isRequired,
};

export default WebcamStreamCapture;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toast, ToastHeader } from 'reactstrap';
import Webcam from 'react-webcam';

const WebcamStreamCapture = ({
  handleStopCapture,
  isPlaying,
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [errMsg, setErrMsg] = useState();
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
      .catch((err) => setErrMsg(err.toString()));
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
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
    <>
      <Webcam className="gif-video" audio={false} ref={webcamRef} />
      {errMsg && (
        <Toast>
          <ToastHeader icon="danger">{errMsg}</ToastHeader>
        </Toast>
      )}
    </>
  );
};

export default WebcamStreamCapture;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Toast, ToastHeader } from 'reactstrap';
import Webcam from "react-webcam";

const WebcamStreamCapture = ({ handleStopCapture, isPlaying, setIsPlaying }) => {
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
      audio: false
    }
    navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      }); //console.log(mediaRecorderRef);
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }).catch(err => setErrMsg(err.toString()));
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  useEffect(() => { //console.log(recordedChunks);
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      handleStopCapture(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks, handleStopCapture]);

  useEffect(() => { //console.log(`isPlaying: ${isPlaying}`);
    if (isPlaying) handleStartCapture();
    if (!isPlaying && capturing) handleStopCaptureClick();
  }, [isPlaying, capturing, handleStartCapture, handleStopCaptureClick]);
  
  const handleStartCaptureClick = () => {
    setIsPlaying(true);
  }

  return (
    <>
      <Webcam audio={false} ref={webcamRef} />
      {errMsg && <Toast>
        <ToastHeader icon="danger">{errMsg}</ToastHeader>
      </Toast>}
      {!isPlaying && <Button
        outline
        block
        color="primary"
        onClick={handleStartCaptureClick}
      >
        Start Recording
      </Button>}
    </>
  );
};

export default WebcamStreamCapture;
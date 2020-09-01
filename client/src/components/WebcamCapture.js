import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';

const getAspectRatio = () =>
  window?.screen?.orientation?.type?.includes('portrait') ? 0.75 : 1 + 1 / 3;

const constraints = {
  video: true,
  audio: false,
};

const isMCRecording = (mediaRecorderRef) =>
  mediaRecorderRef?.current?.state === 'recording';

let stream;
const WebcamStreamCapture = ({
  className,
  isPlaying,
  onCaptureReady,
  onError,
  onStopCapture,
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(getAspectRatio());

  const startCapture = useCallback(() => {
    if (isMCRecording(mediaRecorderRef)) return;
    mediaRecorderRef.current.start();
  }, [mediaRecorderRef]);

  const stopCapture = useCallback(() => {
    if (!isMCRecording(mediaRecorderRef) || !stream) return;
    mediaRecorderRef.current.stop();
    stream.getVideoTracks().forEach(function (track) {
      track.stop();
    });
  }, [mediaRecorderRef]);

  const onDataAvailable = useCallback(
    ({ data }) => {
      if (!data || data.size === 0) return;
      const blob = new Blob([data], {
        type: 'video/webm',
      });
      onStopCapture(blob);
    },
    [onStopCapture]
  );

  const prepareMediaRecorder = async () => {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener('dataavailable', onDataAvailable);
    onCaptureReady();
  };

  useEffect(() => {
    const isRecording = isMCRecording(mediaRecorderRef);
    if (isPlaying && !isRecording) startCapture();
    if (!isPlaying && isRecording) stopCapture();
  }, [isPlaying, startCapture, stopCapture]);

  useEffect(() => {
    const applyAspectRatio = () => setAspectRatio(getAspectRatio());
    window.addEventListener('orientationchange', applyAspectRatio);
    prepareMediaRecorder();
    return () => {
      // tear everything down
      window.removeEventListener('orientationchange', applyAspectRatio);
      if (mediaRecorderRef?.current)
        mediaRecorderRef.current.removeEventListener(
          'dataavailable',
          onDataAvailable
        );
      if (isMCRecording(mediaRecorderRef)) stopCapture();
    };
  }, []);

  console.log(window.screen);

  return (
    <>
      <Webcam
        className={className}
        audio={false}
        ref={webcamRef}
        onUserMediaError={onError}
        videoConstraints={{ aspectRatio, facingMode: 'user' }}
      />
      {window?.screen?.orientation?.type}
    </>
  );
};

WebcamStreamCapture.propTypes = {
  className: PropTypes.string,
  isPlaying: PropTypes.bool.isRequired,
  onCaptureReady: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onStopCapture: PropTypes.func.isRequired,
};

WebcamStreamCapture.defaultProps = {
  className: '',
};

export default WebcamStreamCapture;

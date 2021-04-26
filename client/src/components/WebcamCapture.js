import React, { useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import Webcam from 'react-webcam'

const getAspectRatio = () =>
  window?.screen?.orientation?.type?.includes('portrait') ? 0.75 : 1 + 1 / 3

const getConstraints = () => {
  const supportedConstraints = navigator.mediaDevices.getSupportedConstraints()
  const idealVideoConstraints = {
    // facingMode: { ideal: 'user' },
    aspectRatio: { ideal: getAspectRatio() },
  }
  const videoConstraints = Object.keys(idealVideoConstraints).reduce(
    (acc, constraint) =>
      supportedConstraints[constraint]
        ? { ...acc, [constraint]: idealVideoConstraints[constraint] }
        : acc,
    {},
  )
  return {
    video: videoConstraints,
    audio: false,
  }
}

const isMCRecording = (mediaRecorderRef) =>
  mediaRecorderRef?.current?.state === 'recording'

let stream
const WebcamStreamCapture = ({
  className,
  isPlaying,
  onCaptureReady,
  onError,
  onStopCapture,
  cameraInput,
}) => {
  const webcamRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const startCapture = useCallback(() => {
    if (isMCRecording(mediaRecorderRef)) return
    mediaRecorderRef.current.start()
  }, [mediaRecorderRef])

  const stopCapture = useCallback(() => {
    if (stream) stream.getVideoTracks().forEach((track) => track.stop())
    if (isMCRecording(mediaRecorderRef)) mediaRecorderRef.current.stop()
  }, [mediaRecorderRef])

  const onDataAvailable = useCallback(
    ({ data }) => {
      if (!data || data.size === 0) return
      const blob = new Blob([data], {
        type: MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4',
      })
      onStopCapture(blob)
    },
    [onStopCapture],
  )

  const prepareMediaRecorder = async () => {
    const constraints = getConstraints()
    stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4',
    })
    mediaRecorderRef.current.addEventListener('dataavailable', onDataAvailable)
    onCaptureReady()
  }

  useEffect(() => {
    const isRecording = isMCRecording(mediaRecorderRef)
    if (isPlaying && !isRecording) startCapture()
    if (!isPlaying && isRecording) stopCapture()
  }, [isPlaying, startCapture, stopCapture])

  useEffect(() => {
    prepareMediaRecorder()
    return () => {
      if (mediaRecorderRef?.current)
        mediaRecorderRef.current.removeEventListener(
          'dataavailable',
          onDataAvailable,
        )
      stopCapture()
    }
  }, [])

  return (
    <Webcam
      videoConstraints={{
        aspectRatio: getAspectRatio(),
        deviceId: cameraInput.value.deviceId,
      }}
      className={className}
      audio={false}
      ref={webcamRef}
      onUserMediaError={onError}
    />
  )
}

WebcamStreamCapture.propTypes = {
  className: PropTypes.string,
  isPlaying: PropTypes.bool.isRequired,
  onCaptureReady: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onStopCapture: PropTypes.func.isRequired,
}

WebcamStreamCapture.defaultProps = {
  className: '',
}

export default WebcamStreamCapture

import React, { useState, useCallback } from 'react'
import download from 'downloadjs'
import { Link } from 'react-router-dom'
import './Create.css'
import Webcam from '../../components/WebcamCapture'
import Countdown from '../../components/Countdown'
import Page from '../../components/Page'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import GenericWarning from './GenericWarning'
import BrowserWarning from './BrowserWarning'

const WARNING_BROWSER = 'warning_browser'
const WARNING_GENERIC = 'warning_generic'

const PHASE_START = 'phase_start'
const PHASE_COUNTDOWN = 'phase_countdown'
const PHASE_RECORDING = 'phase_recording'
const PHASE_TEXT = 'phase_text'
const PHASE_END = 'phase_end'

function Create({ history }) {
  const [phase, setPhase] = useState(PHASE_START)
  const [isWebcamReady, setIsWebcamReady] = useState(false)
  const [gifId, setGifId] = useState()
  const [text, setText] = useState('')
  const [isProcessingGif, setIsProcessingGif] = useState('')
  const [isUploading, setUploading] = useState(false)
  const [warning, setWarning] = useState(
    window.MediaRecorder ? false : WARNING_BROWSER,
  )

  const retry = () => {
    setGifId(null)
    setText('')
    setPhase(PHASE_START)
    setWarning(false)
  }

  const onError = useCallback(
    (error) => {
      console.error('Error:', error)
      setWarning(WARNING_GENERIC)
    },
    [setWarning],
  )

  const createGIF = useCallback(
    (vidId, callback) => {
      setIsProcessingGif(true)
      const formData = new FormData()
      const fontsize = text.length && 340 / text.length
      formData.append('text', text)
      formData.append('fontsize', fontsize)
      formData.append('videoId', vidId)
      fetch('/video2gif', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((response) => {
          if (!Object.keys(response).length) {
            throw Error
          }
          setGifId(response.videoId)
          if (callback) callback()
        })
        .catch(onError)
        .finally(() => setIsProcessingGif(false))
    },
    [setGifId, onError, text],
  )

  const upload = () => {
    setUploading(true)
    fetch('/uploadGIF', {
      method: 'POST',
      body: JSON.stringify({ filename: gifId }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => history.push('/home'))
      .catch(onError)
  }

  const onStopCapture = (blob) => {
    if (!blob) return
    const formData = new FormData()
    formData.append('video', blob)
    fetch('/uploadBlob', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.ok && res.json())
      .then((response) => {
        if (!response) {
          throw Error
        }
        const { filename } = response
        const id = filename.replace('.webm', '')
        createGIF(id)
      })
      .catch(onError)
  }

  const downloadGif = async () => {
    const res = await fetch(`/download?filename=${gifId}`)
    const fileBlob = await res.blob()
    download(fileBlob, `${gifId}.gif`)
  }

  const header = (
    <>
      <h1>Create Your Own GIF</h1>
      <Link to="/" className="gif-button-2">
        Cancel
        <Icon name="close" />
      </Link>
    </>
  )

  const isPrerecordingPhase = [PHASE_START, PHASE_COUNTDOWN].includes(phase)
  const isPostRecordingPhase = !isPrerecordingPhase && phase !== PHASE_RECORDING

  const warningMap = {
    [WARNING_GENERIC]: <GenericWarning retry={retry} />,
    [WARNING_BROWSER]: <BrowserWarning />,
  }

  return (
    <Page
      className="gif-create"
      header={header}
      headerClassName="gif-create-header"
    >
      {warning ? (
        warningMap[warning]
      ) : (
        <div className="gif-create-content column">
          <div className="gif-image-container">
            {gifId ? (
              <img
                className="gif-video"
                src={`/img?filename=${gifId}&reload=${phase === PHASE_END}`}
                alt="Your GIF"
              />
            ) : (
              <Webcam
                className="gif-video"
                onError={() => setWarning(WARNING_GENERIC)}
                onCaptureReady={() => setIsWebcamReady(true)}
                onStopCapture={onStopCapture}
                isPlaying={phase === PHASE_RECORDING}
              />
            )}
          </div>
          {isPrerecordingPhase && (
            <Countdown
              isPlaying={phase === PHASE_COUNTDOWN}
              onFinish={() => setPhase(PHASE_RECORDING)}
            />
          )}
          {phase === PHASE_RECORDING && (
            <Countdown isPlaying onFinish={() => setPhase(PHASE_TEXT)} danger />
          )}
          {!isPostRecordingPhase && (
            <Button
              onClick={() => setPhase(PHASE_COUNTDOWN)}
              noClick={phase !== PHASE_START}
              grey={phase === PHASE_COUNTDOWN}
              red={phase === PHASE_RECORDING}
              icon={phase === PHASE_START ? 'play' : 'camera'}
              disabled={!isWebcamReady}
            >
              {phase === PHASE_START && 'Start Recording'}
              {phase === PHASE_COUNTDOWN && 'Get Ready...'}
              {!isPrerecordingPhase && 'Recording...'}
            </Button>
          )}
          {phase === PHASE_TEXT && (
            <>
              <textarea
                placeholder="Add a caption to your GIF!"
                onChange={(e) => setText(e.target.value)}
                value={text}
              />
              <div className="gif-button-group">
                <Button
                  disabled={isProcessingGif}
                  onClick={() => setPhase(PHASE_END)}
                  secondary
                  grey
                >
                  Skip
                </Button>
                <Button
                  disabled={text === '' || isProcessingGif}
                  onClick={() => createGIF(gifId, () => setPhase(PHASE_END))}
                >
                  Save Caption
                </Button>
              </div>
            </>
          )}
          {phase === PHASE_END && (
            <>
              <div className="gif-button-group">
                <Button
                  icon="download"
                  onClick={downloadGif}
                  disabled={isUploading || isProcessingGif}
                  secondary
                  grey
                >
                  Download
                </Button>
                <Button
                  icon="undo"
                  onClick={retry}
                  disabled={isUploading}
                  secondary
                  red
                >
                  Retry
                </Button>
              </div>
              <Button
                disabled={isProcessingGif}
                icon="share"
                onClick={upload}
                noClick={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Share With Conference'}
              </Button>
            </>
          )}
        </div>
      )}
    </Page>
  )
}

export default Create

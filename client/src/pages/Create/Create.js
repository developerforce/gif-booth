import React, { useEffect, useState } from 'react';
import 'spinkit/css/spinkit.css';
import download from 'downloadjs';
import { Link } from 'react-router-dom';
import './Create.css';
import Webcam from '../../components/WebcamCapture';
import Countdown from '../../components/Countdown';
import Page from '../../components/Page';
import Icon from '../../components/Icon';
import Button from '../../components/Button';

const PHASE_START = 'phase_start';
const PHASE_COUNTDOWN = 'phase_countdown';
const PHASE_RECORDING = 'phase_recording';
const PHASE_TEXT = 'phase_text';
const PHASE_END = 'phase_end';

function Create({ history }) {
  const [videoJsOptions, setOptions] = useState({
    autoplay: false,
    controls: true,
    aspectRatio: '16:9',
    preload: 'auto',
    poster: '/poster?filename=placeholder.png',
    sources: [
      {
        src: '/video?filename=placeholder.webm',
        type: 'video/webm',
      },
    ],
  });
  const [phase, setPhase] = useState(PHASE_START);
  const [videoId, setVideoId] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [text, setText] = useState('');
  const [isUploading, setUploading] = useState(false);

  const createGIF = (callback) => {
    let formData = new FormData();
    const fontsize = text.length && 340 / text.length;
    formData.append('text', text);
    formData.append('fontsize', fontsize);
    formData.append('videoId', videoId);
    console.log({
      method: 'POST',
      body: formData,
    });
    fetch('/video2gif', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        if (!Object.keys(response).length) {
          throw Error;
        }
        setImageUrl(response.videoId);
        if (callback) callback();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    if (!videoId) return;
    createGIF();
  }, [videoId]);

  const handleUpload = () => {
    setUploading(true);
    fetch('/uploadImage', {
      method: 'POST',
      body: JSON.stringify({ filename: imageUrl }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => history.push('/'))
      .catch((error) => console.error('Error:', error));
  };

  const retry = () => {
    setVideoId(null);
    setImageUrl(null);
    setText('');
    setPhase(PHASE_START);
  };

  const handleStopCapture = (blob) => {
    if (!blob) return;
    let formData = new FormData();
    formData.append('video', blob);
    fetch('/uploadBlob', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.ok && res.json())
      .then((response) => {
        if (!response) {
          throw Error;
        }
        const { filename } = response;
        const options = videoJsOptions;
        const src = `/video?filename=${filename}`;
        const videoId = filename.replace('.webm', '');
        options.poster = `/poster?filename=${videoId}.png`;
        options.sources[0].src = src;
        setOptions(options);
        setVideoId(videoId);
      })
      .catch((error) => console.error('Error:', error));
  };

  const handleDownload = async () => {
    const res = await fetch(`/download?filename=${imageUrl}`);
    const fileBlob = await res.blob();
    download(fileBlob, `${imageUrl}.gif`);
  };

  const header = (
    <Link to="/" className="gif-button-2">
      Cancel
      <Icon name="close" />
    </Link>
  );

  const isPrerecordingPhase = [PHASE_START, PHASE_COUNTDOWN].includes(phase);
  const isPostRecordingPhase =
    !isPrerecordingPhase && phase !== PHASE_RECORDING;

  return (
    <Page
      className="gif-create"
      header={header}
      headerClassName="gif-create-header"
    >
      <div className="gif-create-content column">
        <div className="gif-video-container">
          {imageUrl ? (
            <img
              src={`/img?filename=${imageUrl}&reload=${phase === PHASE_END}`}
              alt="Your GIF"
              className="gif-video"
            />
          ) : (
            <Webcam
              handleStopCapture={handleStopCapture}
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
          <Countdown
            isPlaying={true}
            onFinish={() => setPhase(PHASE_TEXT)}
            danger
          />
        )}
        {!isPostRecordingPhase && (
          <Button
            onClick={() => setPhase(PHASE_COUNTDOWN)}
            noClick={phase !== PHASE_START}
            grey={phase === PHASE_COUNTDOWN}
            red={phase === PHASE_RECORDING}
            icon={phase === PHASE_START ? 'play' : 'camera'}
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
              <Button onClick={() => setPhase(PHASE_END)} secondary grey>
                Skip
              </Button>
              <Button
                disabled={text === ''}
                onClick={() => createGIF(() => setPhase(PHASE_END))}
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
                onClick={handleDownload}
                disabled={isUploading}
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
            <Button icon="share" onClick={handleUpload} noClick={isUploading}>
              {isUploading ? 'Uploading...' : 'Share With Conference'}
            </Button>
          </>
        )}
      </div>
    </Page>
  );
}

export default Create;

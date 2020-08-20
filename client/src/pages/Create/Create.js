import React, { useState } from 'react';
import 'spinkit/css/spinkit.css';
import download from 'downloadjs';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState();
  const [imageUrl, setImageUrl] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();

    let formData = new FormData();
    const text = e.target.text.value;
    const fontsize = text.length && 340 / text.length;
    formData.append('text', `${text}`);
    formData.append('fontsize', fontsize);
    formData.append('videoId', videoId);
    setIsLoading(true);
    toast.info('Please be patient...');
    fetch('/video2gif', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((response) => {
        toast.dismiss();
        if (!Object.keys(response).length) {
          setIsLoading(false);
          return toast.warn('Something went wrong...');
        }
        setVideoId(null);
        const { videoId } = response;
        setImageUrl(videoId);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.dismiss();
        toast.warn('Something went wrong...');
      });
  };

  const handleUpload = (filename) => {
    fetch('/uploadImage', {
      method: 'POST',
      body: JSON.stringify({ filename }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => history.push('/'))
      .catch((error) => console.error('Error:', error));
  };

  const handleStopCapture = (blob) => {
    if (!blob) return;
    setIsLoading(true);
    toast.info('Please be patient...');
    let formData = new FormData();
    formData.append('video', blob);
    fetch('/uploadBlob', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.ok && res.json())
      .then((response) => {
        toast.dismiss();
        if (!response) {
          setIsLoading(false);
          return toast.warn('Too large video ...');
        }
        const { filename } = response; //console.log(filename);
        const options = videoJsOptions;
        const src = `/video?filename=${filename}`;
        const videoId = filename.replace('.webm', '');
        options.poster = `/poster?filename=${videoId}.png`;
        options.sources[0].src = src;
        setOptions(options);
        setVideoId(videoId);
        setIsLoading(false);
      });
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

  console.log({ phase });

  return (
    <Page
      className="gif-create"
      header={header}
      headerClassName="gif-create-header"
    >
      <ToastContainer
        position="top-right"
        style={{ zIndex: 1999, color: '#000' }}
        transition={Zoom}
      />
      <div className="gif-create-content column">
        <Webcam
          handleStopCapture={handleStopCapture}
          isPlaying={phase === PHASE_RECORDING}
        />
        {[PHASE_START, PHASE_COUNTDOWN].includes(phase) && (
          <Countdown
            isPlaying={phase === PHASE_COUNTDOWN}
            onFinish={() => setPhase(PHASE_RECORDING)}
          />
        )}
        {phase === PHASE_RECORDING && (
          <Countdown isPlaying={true} onFinish={() => setPhase(PHASE_TEXT)} danger />
        )}
        <Button
          onClick={() => setPhase(PHASE_COUNTDOWN)}
          disabled={[PHASE_COUNTDOWN, PHASE_RECORDING].includes(phase)}
          grey={phase === PHASE_COUNTDOWN}
          red={phase === PHASE_RECORDING}
        >
          {phase === PHASE_START && 'Start Recording'}
          {phase === PHASE_COUNTDOWN && 'Get Ready...'}
          {phase === PHASE_RECORDING && 'Recording...'}
        </Button>
      </div>

      {/*
      {imageUrl ? (
        <div>
          ok hiiiiiiii
          <button onClick={() => handleUpload(imageUrl)}>Save to grid</button>
          <button onClick={handleDownload}>
            <span className="fa fa-download fa-3x" title="Download GIF"></span>
          </button>
          <button onClick={() => setImageUrl(null)}>Start over</button>
          <img
            src={`/img?filename=${imageUrl}`}
            alt="Card image cap"
            className="gif-create-image"
          />
        </div>
      ) : (
        <Webcam
          handleStopCapture={handleStopCapture}
          isPlaying={isTimerPlaying}
          setIsPlaying={setIsCountdownPlaying}
        />
      )}
      <input
        type="textarea"
        name="text"
        rows={2}
        maxlength={64}
        disabled={!videoId}
        style={{ fontSize: "xx-large" }}
        placeholder="Add text to GIF&#13;Max 64 characters"
      />
      <button
        outline={!videoId}
        disabled={!videoId}
        block
        className="mt-3"
        onClick={handleSubmit}
      >
        Make GIF
      </button>
      {isLoading && (
        <div className="sk-circle">
          {[...Array(12)].map((e, i) => (
            <div key={i} className={`sk-circle${i + 1} sk-child`}></div>
          ))}
        </div>
      )} */}
    </Page>
  );
}

export default Create;

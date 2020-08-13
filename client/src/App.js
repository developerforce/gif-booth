import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Input, Button, ButtonGroup, Form, FormGroup, Label, Card, CardImg } from 'reactstrap';
import VideoPlayer from './components/VideoPlayer';
//import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'spinkit/css/spinkit.css';
import download from 'downloadjs';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import Webcam from './components/WebcamCapture';

function App(props) { //console.log(props);
  const [videoJsOptions, setOptions] = useState({
    autoplay: false,
    controls: true,
    aspectRatio: '16:9',
    preload: 'auto',
    poster: '/poster?filename=placeholder.png',
    sources: [{
      src: '/video?filename=placeholder.webm',
      type: 'video/webm'
    }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState();
  const [imageUrl, setImageUrl] = useState(); //console.log(imageUrl);
  
  useEffect(() => {
    if (videoId === null) {
      const options = videoJsOptions;
      options.poster = '/poster?filename=placeholder.png';
      options.sources[0].src = '/video?filename=placeholder.webm';
      setOptions(options);
    }
  }, [videoId, videoJsOptions]);

  const longestLine = (string) => string.split('\n').reduce((a, b) => a.length > b.length ? a : b, '');

  const handleSubmit = (e) => {
    e.preventDefault();

    let formData = new FormData();
    const text = e.target.text.value;
    const line = longestLine(text);
    const fontsize = line.length && 400/line.length;
    formData.append('text', `${text}`);
    formData.append('fontsize', fontsize);
    formData.append('videoId', videoId);
    setIsLoading(true);
    toast.info('Please be patient...');
    fetch('/video2gif', {
      method:'POST',
      body: formData
    }).then(res => res.json())
    .then(response => { //console.log(response);
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
    .catch(error => {
      console.error('Error:', error);
      toast.dismiss();
      toast.warn('Something went wrong...'); 
    });
  }

  const handleUpload = (filename) => {
    const data = { filename };
    fetch('/uploadImage', {
      method:'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(response => { console.log(response);
      props.history.push('/')
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const handleStopCapture = (blob) => { //console.log(blob);
    if (!blob) return;
    setIsLoading(true);
    toast.info('Please be patient...');
    let formData = new FormData();    
    formData.append('video', blob);
    fetch('/uploadBlob', {
      method:'POST',
      body: formData
    }).then(res => res.ok && res.json())
    .then(response => { //console.log(response);
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
  }
  
  const handleDownload = async () => {
    const res = await fetch(`/download?filename=${imageUrl}`); //console.log(res);
    const fileBlob = res.blob(); //console.log(fileBlob);
    fileBlob.then((res) => { //console.log(res);
      download(res, `${imageUrl}.gif`);
      //setImageUrl(null);
    });
  }

  return (
    <Container fluid>
        <Card>
          <ToastContainer position="top-right" style={{ zIndex: 1999, color: '#000' }} transition={Zoom} />
          <Row>
            <Col xs="8">
              <VideoPlayer { ...videoJsOptions } />
            </Col>
            <Col xs="4">
              <Link
                to="/"
                className="btn btn-link btn-lg btn-block mb-4"
              >
                <div>All GIFs</div>
              </Link>
              {imageUrl ? <Col className="text-center">
                <ButtonGroup className="mt-3">
                  <Button color="success"onClick={()=>handleUpload(imageUrl)}>Save to grid</Button>
                  <Button outline color="info" onClick={handleDownload}>
                    <span className="fa fa-download fa-3x" title="Download GIF"></span>
                  </Button>
                  <Button color="primary" onClick={()=>setImageUrl(null)}>Start over</Button>
                </ButtonGroup>
                <CardImg top width="100%" src={`/img?filename=${imageUrl}`} alt="Card image cap" className="mt-3" />
              </Col>
              : <Webcam handleStopCapture={handleStopCapture} />}
              <Form id="myform" onSubmit={handleSubmit}>
                <FormGroup>
                  <Label size="sm">Text</Label>
                  <Input type="textarea" name="text" rows={3}
                  disabled={!videoId} style={{ fontSize: 'x-large' }} placeholder={`Add text to GIF
                  press "Enter" to break lines`} />
                </FormGroup>
                <Button type="submit" outline={!videoId} disabled={!videoId} block className="mt-3">Make GIF</Button>
              </Form>
              {isLoading && <Row>
                <Col sm="12" md={{ size: 6, offset: 3 }} className="text-center">
                  <div className="sk-circle">
                    {[...Array(12)].map((e, i) => <div key={i} className={`sk-circle${(i+1)} sk-child`}></div>)}
                  </div>
                </Col>
              </Row>}
            </Col>
          </Row>
        </Card>
      </Container>
  );
}

export default App;

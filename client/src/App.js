import React, { useState } from 'react';
import { Container, Row, Col, Input, Button, Form, FormGroup, Label, Card, CardImg } from 'reactstrap';
import VideoPlayer from './components/VideoPlayer';
//import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'spinkit/css/spinkit.css';
import download from 'downloadjs';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function App() {
  const placeholder = 'https://res.cloudinary.com/dzd5mddlm/video/upload/v1596551591/makegif/ef4wbnsn1iweckus7mpz.mp4';
  const makePoster = (path) => `${path.substring(0, path.lastIndexOf('.'))}.png`;

  const [videoJsOptions, setOptions] = useState({
    autoplay: false,
    controls: true,
    aspectRatio: '16:9',
    preload: 'auto',
    poster: makePoster(placeholder),
    sources: [{
      src: placeholder,
      type: 'video/mp4'
    }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState();
  const [imageUrl, setImageUrl] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();

    let formData = new FormData();
    if (!videoUrl) return toast.warn('Video is required!');
    formData.append('videoUrl', videoUrl.path);
    formData.append('videoId', videoUrl.filename);
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
      setVideoUrl(null);
      const { videoId } = response;
      setImageUrl(videoId);      
      setIsLoading(false);
      handleUpload(videoId);
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
    .then(response => { //console.log(response);
      //const { created_at, secure_url } = response;
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const handleFileInput = (e) => {
    const files = e.currentTarget.files;
    const file = files[0]; //console.log(file);
    if (!file) return;
    setIsLoading(true);
    toast.info('Please be patient...');
    let formData = new FormData();    
    formData.append('video', file);
    fetch('/uploadVideo', {
      method:'POST',
      body: formData
    }).then(res => res.ok && res.json())
    .then(response => { //console.log(response);
      toast.dismiss();
      if (!response) {
        setIsLoading(false);
        return toast.warn('Too large or unsupported video ...');
      }
      let { path, filename } = response;
      filename = filename.split('/').pop();
      const options = videoJsOptions;
      const video_thumbnail = makePoster(path);
      options.poster=`${video_thumbnail}`;
      options.sources[0].src = path;
      setOptions(options);
      setVideoUrl({ path, filename });
      setIsLoading(false);
    });
  }
  
  const handleDownload = async () => {
    const res = await fetch(`/download?filename=${imageUrl}`); //console.log(res);
    const fileBlob = res.blob(); //console.log(fileBlob);
    fileBlob.then((res) => { console.log(res);
      download(res, `${imageUrl}.gif`);
      setImageUrl(null);
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
              <Form id="myform" encType="multipart/form-data" onSubmit={handleSubmit}>
                <Row>
                  <Col xs="3">
                    <Label size="sm">Video</Label>
                  </Col>
                  <Col xs="9">
                    <FormGroup>
                      <Input type="file" accept="video/*" onChange={handleFileInput} className="" />
                    </FormGroup>
                  </Col>
                </Row>
                <Button type="submit" disabled={!videoUrl} block className="mt-3">Make GIF</Button>
              </Form>
              {isLoading && <Row>
                <Col sm="12" md={{ size: 6, offset: 3 }} className="text-center">
                  <div className="sk-circle">
                    {[...Array(12)].map((e, i) => <div key={i} className={`sk-circle${(i+1)} sk-child`}></div>)}
                  </div>
                </Col>
              </Row>}
              {imageUrl && <Col className="text-center">
                <Button outline color="success" onClick={handleDownload} className="mt-3">
                  <span className="fa fa-download fa-3x" title="Download GIF"></span>
                </Button>
                <CardImg top width="100%" src={`/img?filename=${imageUrl}&t${new Date()}`} alt="Card image cap" className="mt-3" />
              </Col>}
            </Col>
          </Row>
        </Card>
      </Container>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Page from '../../components/Page';
import { downloadFromS3 } from '../../utils/download';
import './GroupPhoto.css';

const GroupPhoto = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [file, setFile] = useState(null);

  const createGroupPhoto = async () => {
    setIsGenerating(true);
    const res = await fetch('/createGroupPhoto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    setFile(json);
    setIsGenerating(false);
  };

  // useEffect(() => {
  //   createGroupPhoto();
  // }, []);

  const header = <h1>Create Group Photo</h1>;

  return (
    <Page header={header}>
      <div className="gif-groupphoto-content column">
        <div className="gif-image-container">
          {file && (
            <img
              src={file?.Location}
              alt="groupphoto"
              className="gif-groupphoto-image"
            />
          )}
        </div>
        <div className="gif-button-group">
          <Button disabled={isGenerating} onClick={createGroupPhoto}>
            {isGenerating ? 'Making Group Photo...' : 'Make Group Photo'}
          </Button>
          <Button
            grey
            secondary
            icon="download"
            disabled={!file}
            onClick={() => downloadFromS3(file?.Key)}
          >
            Download
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default GroupPhoto;

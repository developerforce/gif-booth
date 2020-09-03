import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Page from '../../components/Page';
import { downloadFromS3 } from '../../utils/download';
import './GroupPhoto.css';

const GroupPhoto = () => {
  const [isLoading, setIsLoading] = useState(true);
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
    console.log('GOT RESULT', res)
    const json = await res.json();
    setFile(json);
    setIsGenerating(false);
  };

  const getGroupPhoto = async () => {
    const res = await fetch('/getGroupPhoto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    if (json.Contents.length > 0) setFile(json.Contents[0]);
    setIsLoading(false);
  };

  useEffect(() => {
    getGroupPhoto();
  }, []);

  const header = <h1>Create Group Photo</h1>;

  let buttonText = file ? 'Redo Group Photo' : 'Make Group Photo';
  if (isGenerating) buttonText = 'Making Group Photo...';
  if (isLoading) buttonText = 'Loading...';

  return (
    <Page header={header}>
      <div className="gif-groupphoto-content column">
        <div className="gif-image-container">
          {file && (
            <img
              src={`${file?.Location}?LastModified=${file?.LastModified}`}
              alt="Group Snapshot"
              className="gif-groupphoto-image"
            />
          )}
        </div>
        <div className="gif-button-group">
          <Button
            disabled={isGenerating || isLoading}
            onClick={createGroupPhoto}
          >
            {buttonText}
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

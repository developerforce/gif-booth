import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Warning from '../../components/Warning';

const BrowserWarning = () => {
  const history = useHistory();
  const [userUploadGIF, setUserUploadGIF] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onUserChoseGIF = (e) => setUserUploadGIF(e.target.files[0]);

  const uploadUserGIF = async () => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('gif', userUploadGIF);
    const res = await fetch('/uploadUserGIF', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) history.push('/home');
  };

  return (
    <Warning
      title="Direct gif recording is not currently supported in your browser."
      message="Please use the latest versions of Chrome or Firefox for the best experience. Alternatively, you can upload your own 3-second GIF below."
      content={
        <input
          type="file"
          name="gif"
          accept="image/gif"
          style={{ width: '170px' }}
          onChange={onUserChoseGIF}
        />
      }
      ctaLabel={isUploading ? 'Uploading...' : 'Upload'}
      ctaOnClick={uploadUserGIF}
      ctaIcon="upload"
      ctaDisabled={!userUploadGIF || isUploading}
    />
  );
};

export default BrowserWarning;

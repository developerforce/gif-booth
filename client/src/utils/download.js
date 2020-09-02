import download from 'downloadjs';

export const downloadFromS3 = async (filename) => {
  const res = await fetch(`/s3-download?filename=${filename}`);
  const fileBlob = res.blob();
  fileBlob.then((blob) => download(blob, filename));
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import './Home.css';
import useListGIFs from '../../hooks/useListGIFs';
import { downloadFromS3 } from '../../utils/download';
import Button from '../../components/Button';
import Page from '../../components/Page';

const ListPage = () => {
  const gifs = useListGIFs();

  const [byNewest, setByNewest] = useState(true);

  const orderedGifs = byNewest ? [...gifs].reverse() : gifs;

  const header = (
    <>
      <span>
        <h1>Browse GIFs</h1>
        <h2>{` (${gifs?.length || 0})`}</h2>
      </span>
      <div className={cx('gif-home-order', 'row')}>
        <p>Sort By</p>
        <button
          className={cx('gif-button-2', byNewest && 'active')}
          onClick={() => setByNewest(true)}
        >
          Newest
        </button>
        <button
          className={cx('gif-button-2', !byNewest && 'active')}
          onClick={() => setByNewest(false)}
        >
          Oldest
        </button>
      </div>
    </>
  );

  return (
    <Page header={header}>
      <div className="gif-cards-container">
        <Link to="/new-gif" className="gif-createnew-button">
          <Button icon="plus">Create Your Own GIF</Button>
        </Link>
        {orderedGifs.map(({ Key, src }) => (
          <img
            key={Key}
            onClick={() => downloadFromS3(Key)}
            src={src}
            alt={`GIF ${Key}`}
            className="gif-card-image"
          />
        ))}
      </div>
    </Page>
  );
};

export default ListPage;

// DELETE METHOD
// const deleteObj = (filename) => {
// 	const formData = { filename };
// 	fetch("/deleteObj", {
// 		method: "delete", // or 'PUT'
// 		body: JSON.stringify(formData),
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 	})
// 		.then((res) => res.json())
// 		.then((response) => {
// 			console.log("Success:", response);
// 			loadGifs();
// 		})
// 		.catch((error) => console.error("Error:", error));
// };

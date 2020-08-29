import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import './Home.css';
import useListGIFs from '../../hooks/useListGIFs';
import { downloadFromS3 } from '../../utils/download';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Page from '../../components/Page';

const Home = () => {
  const {
    gifCount,
    gifs,
    nextPage,
    prevPage,
    start,
    end,
    isLoading,
  } = useListGIFs();

  const header = (
    <>
      <span>
        <h1>Browse GIFs</h1>
        <h2>{` ${start}-${end} (${gifCount || 0})`}</h2>
      </span>
      <div className="gif-home-order row">
        {prevPage && (
          <button className={cx('gif-button-2')} onClick={prevPage}>
            Prev
          </button>
        )}
        {nextPage && (
          <button className={cx('gif-button-2')} onClick={nextPage}>
            Next
          </button>
        )}
      </div>
    </>
  );

  const empty = (
    <div className="gif-warning column">
      <Icon name="users" size={4} />
      <h1>No Greetings Recorded Yet</h1>
      <p>You could be the first!</p>
    </div>
  );

  return (
    <Page header={header}>
      {gifs.length === 0 && !isLoading && empty}
      {isLoading && <p>Loading GIFs...</p>}
      <div className="gif-cards-container">
        <Link to="/new-gif" className="gif-createnew-button">
          <Button icon="plus">Create Your Own GIF</Button>
        </Link>
        {gifs.map(({ Key, Location }) => (
          <div
            onClick={() => downloadFromS3(Key)}
            key={Key}
            className="gif-card-image-container"
          >
            {!isLoading && (
              <img
                src={Location}
                alt={`GIF ${Key}`}
                className="gif-card-image"
              />
            )}
          </div>
        ))}
      </div>
    </Page>
  );
};

export default Home;

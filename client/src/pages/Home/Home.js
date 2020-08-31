import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import './Home.css';
import useListGIFs from '../../hooks/useListGIFs';
import { downloadFromS3 } from '../../utils/download';
import ReactPaginate from 'react-paginate';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Page from '../../components/Page';

const Home = () => {
  const {
    gifCount,
    gifs,
    page,
    pageCount,
    start,
    setPage,
    end,
    isLoading,
    isInitializing,
  } = useListGIFs();

  const header = (
    <>
      <span>
        <h1>Browse GIFs</h1>
        {!isInitializing && <h2>{` ${start}-${end} (${gifCount || 0})`}</h2>}
      </span>
      {!isInitializing && pageCount > 1 && (
        <ReactPaginate
          containerClassName="gif-home-paginate row"
          pageCount={pageCount}
          forcePage={page}
          activeLinkClassName="active"
          nextLinkClassName="gif-button-2"
          previousLinkClassName="gif-button-2"
          pageLinkClassName="gif-button-2 inline"
          previousLabel="Prev"
          onPageChange={({ selected }) => setPage(selected)}
          marginPagesDisplayed={1}
        />
      )}
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
        {!isLoading &&
          gifs.map(({ Key, Location }) => (
            <img
              onClick={() => downloadFromS3(Key)}
              key={Key}
              src={Location}
              alt={`GIF ${Key}`}
              className="gif-card-image"
              width="320"
              height="240"
            />
          ))}
      </div>
    </Page>
  );
};

export default Home;

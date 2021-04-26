import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import ReactPaginate from 'react-paginate'
import useListGIFs from '../../hooks/useListGIFs'
import Button from '../../components/Button'
import Icon from '../../components/Icon'
import Page from '../../components/Page'
import GifList from '../../components/GifList'

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
  } = useListGIFs()

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
          nextLinkClassName="gif-button-2 inline"
          previousLinkClassName="gif-button-2 inline"
          pageLinkClassName="gif-button-2 inline"
          previousLabel="Prev"
          onPageChange={({ selected }) => setPage(selected)}
          marginPagesDisplayed={1}
        />
      )}
    </>
  )

  const empty = (
    <div className="gif-warning column">
      <Icon name="users" size={4} />
      <h1>No Greetings Recorded Yet</h1>
      <p>You could be the first!</p>
    </div>
  )

  return (
    <Page header={header} headerClassName="gif-home-header">
      {gifs.length === 0 && !isLoading && empty}
      {isInitializing && <p>Loading GIFs...</p>}
      <div className="gif-cards-container">
        <div className="gif-home-createnew">
          <Link to="/new-gif" className="gif-createnew-button">
            <Button icon="plus">Create Your Own GIF</Button>
          </Link>
        </div>
        <GifList gifs={gifs} isLoading={isLoading} />
      </div>
    </Page>
  )
}

export default Home

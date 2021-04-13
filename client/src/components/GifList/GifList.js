import React from 'react'
import GifItem from './GifItem'
import './GifList.css'

const GifList = ({ gifs, isLoading }) => (
  <>
    {gifs.map(({ Key, Location }) => (
      <GifItem
        key={Key}
        fileKey={Key}
        Location={Location}
        isLoading={isLoading}
      />
    ))}
  </>
)

export default GifList

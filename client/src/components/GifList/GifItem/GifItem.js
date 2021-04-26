import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

import { downloadFromS3 } from '../../../utils/download'
import Modal from '../../Modal'
import Icon from '../../Icon'

import './GifItem.css'

const notyf = new Notyf({
  position: {
    x: 'center',
    y: 'top',
  },
})

const GifItem = ({ isLoading, Location, fileKey }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [gifId, setGifId] = useState('')
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const regex = /\b(\d.*[^.gif])\b/g
    const match = fileKey.match(regex)

    if (match) {
      setGifId(match[0])
    }

    if (params.get('gif_id') === gifId) {
      setModalOpen(true)
    }
  }, [gifId, fileKey, location.search])

  const handleGifSelect = () => {
    const params = new URLSearchParams()

    params.append('gif_id', gifId)
    history.push({ search: params.toString() })

    setModalOpen(true)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(Location).then(() => {
      notyf.success('Link copied to clipboard')
    })
  }

  const handleDownload = () => {
    downloadFromS3(fileKey).then(() => {
      notyf.success('File downloading...')
    })
  }

  const handleModalClose = () => {
    const params = new URLSearchParams()

    params.delete('gif_id')
    history.push({ search: params.toString() })

    setModalOpen(false)
  }

  return (
    <>
      {modalOpen && (
        <Modal displayModal={modalOpen} closeModal={handleModalClose}>
          <div className="modal-top">
            <div className="modal-top-left">
              <button type="button" onClick={handleCopyToClipboard}>
                Copy Link
                <Icon name="link" />
              </button>
              <div className="vl" />
              <button type="button" onClick={handleDownload}>
                Download
                <Icon name="download" />
              </button>
            </div>
            <div className="modal-top-right">
              <button
                type="button"
                className="close"
                onClick={handleModalClose}
              >
                Close
                <Icon name="close" />
              </button>
            </div>
          </div>
          <div
            role="img"
            className="gif-card-image"
            alt={`GIF ${fileKey}`}
            style={
              isLoading
                ? null
                : {
                    backgroundImage: `url("${Location}")`,
                    marginTop: '20px',
                  }
            }
          />
        </Modal>
      )}
      <div
        role="button"
        tabIndex={0}
        className="gif-card-image"
        onClick={handleGifSelect}
        onKeyDown={handleGifSelect}
        alt={`GIF ${fileKey}`}
        style={
          isLoading
            ? null
            : {
                backgroundImage: `url("${Location}")`,
              }
        }
      />
    </>
  )
}

export default GifItem

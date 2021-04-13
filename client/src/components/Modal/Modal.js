import React from 'react'
import './Modal.css'

const Modal = ({ displayModal, closeModal, children }) => {
  const divStyle = {
    display: displayModal ? 'block' : 'none',
  }

  const closePropModal = (e) => {
    e.stopPropagation()
    closeModal()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="modal"
      onClick={closePropModal}
      onKeyDown={closePropModal}
      style={divStyle}
    >
      <div
        role="button"
        tabIndex={0}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal

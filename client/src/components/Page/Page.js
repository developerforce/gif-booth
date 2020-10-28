import React from 'react'
import cx from 'classnames'
import logoSrc from '../../logo.svg'
import './Page.css'

const Page = ({ className, children, header, headerClassName }) => (
  <>
    <div className={cx('gif-page-container', className)}>
      <div className={cx('gif-page-header', headerClassName)}>{header}</div>
      {children}
    </div>
    <footer className="row">
      <img alt="fostive logo" src={logoSrc} />
      <p>Brought to you with 💛 &nbsp;by <a href="https://github.com/fostive" aria-label="Fostive - Opens in a new window" target="_blank">Fostive</a></p>
    </footer>
  </>
)

export default Page

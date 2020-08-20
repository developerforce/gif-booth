import React from 'react';
import cx from 'classnames';
import logoSrc from '../../logo.svg';
import './Page.css';

const Page = ({ className, children, header, headerClassName }) => (
  <>
    <div className={cx('gif-page-container', className)}>
      <div className={cx('gif-page-header', headerClassName)}>{header}</div>
      {children}
    </div>
    <footer className="row">
      <img alt="fostive logo" src={logoSrc} />
    </footer>
  </>
);

export default Page;

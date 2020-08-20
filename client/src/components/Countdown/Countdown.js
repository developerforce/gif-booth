import React, { useEffect } from 'react';
import cx from 'classnames';
import './Countdown.css';

const Countdown = ({ isPlaying, onFinish, danger }) => (
  <div
    className={cx('gif-countdown', isPlaying && 'playing', danger && 'danger')}
    onAnimationEnd={onFinish}
  />
);

export default Countdown;

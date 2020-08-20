import React from 'react';
import cx from 'classnames';
import './Button.css';

const Button = ({
  children,
  className,
  disabled,
  grey,
  icon,
  onClick,
  red,
  secondary,
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        className,
        'gif-button',
        disabled && 'disabled',
        !secondary && 'primary',
        secondary && 'secondary',
        grey && 'grey',
        red && 'red'
      )}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  className: '',
};

export default Button;

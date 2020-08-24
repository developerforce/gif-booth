import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import './Button.css';

const Button = ({
  children,
  className,
  disabled,
  grey,
  icon,
  noClick,
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
        noClick && 'noclick',
        disabled && 'disabled',
        !secondary && 'primary',
        secondary && 'secondary',
        grey && 'grey',
        red && 'red'
      )}
    >
      {icon && (
        <div className="button-icon-wrapper">
          <Icon name={icon} />
        </div>
      )}
      {children}
    </button>
  );
};

Button.defaultProps = {
  className: '',
};

export default Button;

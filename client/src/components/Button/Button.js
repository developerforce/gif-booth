import React from "react";
import cx from "classnames";
import "./Button.css";

const Button = ({
  className,
  onClick,
  children,
  icon,
  secondary,
  tertiary,
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        className,
        'gif-button',
        !secondary && !tertiary && "primary",
        secondary && "secondary",
        tertiary && "tertiary"
      )}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  className: "",
};

export default Button;

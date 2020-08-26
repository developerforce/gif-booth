import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Button from '../Button';
import './Warning.css';

const Warning = ({
  title,
  message,
  ctaOverride,
  ctaLabel,
  ctaOnClick,
  ctaIcon,
}) => (
  <div className="gif-warning column">
    <Icon name="exclamation-triangle" size={4} />
    <h1>{title}</h1>
    <p>{message}</p>
    {ctaOverride || (
      <Button icon={ctaIcon} onClick={ctaOnClick} secondary grey>
        {ctaLabel}
      </Button>
    )}
  </div>
);

Warning.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  ctaOverride: PropTypes.node,
  ctaLabel: PropTypes.string,
  ctaOnClick: PropTypes.func,
  ctaIcon: PropTypes.string,
};

Warning.defaultProps = {
  ctaOverride: null,
  ctaLabel: null,
  ctaOnClick: null,
  ctaIcon: null,
};

export default Warning;

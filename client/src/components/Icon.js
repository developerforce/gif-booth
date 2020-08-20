import React from 'react';

const Icon = ({ name, title }) => {
  return <i className={`fa fa-${name}`} title={title}></i>;
};

export default Icon

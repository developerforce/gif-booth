import React from 'react';
import { useHistory } from 'react-router-dom';
import Warning from '../components/Warning';

export default () => {
  const history = useHistory();

  return (
    <div className="full-center">
      <Warning
        title="404"
        message="Uh oh, looks like we took a wrong turn."
        ctaLabel="Back To Home"
        ctaOnClick={() => history.push('/home')}
        ctaIcon="home"
        warningIcon="folder-open"
      />
    </div>
  );
};

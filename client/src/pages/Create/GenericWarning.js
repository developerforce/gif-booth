import React from 'react'
import PropTypes from 'prop-types'
import Warning from '../../components/Warning'

const GenericWarning = ({ retry }) => (
  <Warning
    title="Uh oh, something went wrong!"
    message="Please try again."
    ctaOnClick={retry}
    ctaLabel="Retry"
    ctaIcon="undo"
  />
)

GenericWarning.propTypes = {
  retry: PropTypes.func.isRequired,
}

export default GenericWarning

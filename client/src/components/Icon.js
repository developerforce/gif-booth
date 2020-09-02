import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const Icon = ({ name, title, size }) => (
  <i className={cx('fa', `fa-${name}`, size && `fa-${size}x`)} title={title} />
)

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  size: PropTypes.number,
}

Icon.defaultProps = {
  title: '',
  size: null,
}

export default Icon

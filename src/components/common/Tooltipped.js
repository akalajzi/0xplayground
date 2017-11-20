import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectTooltip } from 'react-md';

const styles = {
  tooltipContainer: {
    position: 'relative',
    display: 'inline-block',
  },
}

class Tooltipped extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    tooltip: PropTypes.node,
    className: PropTypes.string,
  };

  render() {
    const { children, tooltip, className } = this.props

    return (
      <div style={styles.tooltipContainer} className={className}>
        {tooltip}
        {children}
      </div>
    );
  }
}

export default injectTooltip(Tooltipped);

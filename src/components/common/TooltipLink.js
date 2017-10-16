import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectTooltip } from 'react-md';

const styles = {
  tooltipContainer: {
    position: 'relative',
    display: 'inline-block',
  },
}

class TooltipLink extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    tooltip: PropTypes.node,
  };

  render() {
    const { children, tooltip, target, href } = this.props;

    return (
      <a style={styles.tooltipContainer} className='link' target={target} href={href}>
        {tooltip}
        {children}
      </a>
    );
  }
}

export default injectTooltip(TooltipLink);

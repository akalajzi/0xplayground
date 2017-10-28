import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'

export default class TinyChart extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    dataKey: PropTypes.string,
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.number,
  }

  render() {
    const { data, dataKey, strokeColor, strokeWidth } = this.props

    return(
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <Tooltip />
          <Line
            type='monotone'
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

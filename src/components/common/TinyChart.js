import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  YAxis,
} from 'recharts'

export default class TinyChart extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    dataKey: PropTypes.string,
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.number,
  }

  render() {
    const { data, unit, dataKey, strokeColor, strokeWidth } = this.props

    return(
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <Tooltip content={<CustomTooltip />}/>
          <YAxis
            type="number"
            hide={true}
            domain={['dataMin', 'dataMax']}
          />
          <Line
            type='monotone'
            dataKey={dataKey}
            unit={unit}
            labelKey={'name'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

const CustomTooltip = (props) => {
  const {type, payload, label, active} = props

  if (active) {
    return (
      <div className='recharts-default-tooltip' style={{
        background: '#ffffff',
        padding: '10px',
        border: '1px solid #c3c3c3',
      }}>
        { payload[0]
          ? <div>
            <p className='recharts-tooltip-label'>{payload[0].payload.name}</p>
            <span className='recharts-tooltip-item-value' style={{color: payload[0].color}}>
              {`${payload[0].unit} ${payload[0].value}`}
            </span>
          </div>
          : 'Missing data'
        }
      </div>
    )
  }

  return null
}

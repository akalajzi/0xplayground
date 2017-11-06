import React from 'react'
import Cell from 'react-md'

const FlyingMessage = (props) => {
  let positionCss = ''
  positionCss = props.left ? 'left' : ''
  positionCss = props.right ? 'right' : ''

  return(
    <div className={`FlyingMessage ${positionCss}`}>
      {props.children}
    </div>
  )
}
export default FlyingMessage

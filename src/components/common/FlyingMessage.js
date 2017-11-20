import React from 'react'
import Cell from 'react-md'

const FlyingMessage = (props) => {
  let cssn = ''
  cssn = props.left ? 'left ' : ''
  cssn = props.right ? 'right ' : ''

  cssn += props.className || ''

  return(
    <div className={`FlyingMessage ${cssn}`}>
      {props.children}
    </div>
  )
}
export default FlyingMessage

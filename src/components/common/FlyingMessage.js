import React from 'react'
import Cell from 'react-md'

const FlyingMessage = (props) => {
  return(
    <div className='FlyingMessage'>
      {props.children}
    </div>
  )
}
export default FlyingMessage

import React from 'react'
import {Paper} from 'react-md'

const WhitePaper = (props) => {
  return(
    <Paper style={{background: '#ffffff', paddingBottom: '20px'}}>
      {props.children}
    </Paper>
  )
}
export default WhitePaper

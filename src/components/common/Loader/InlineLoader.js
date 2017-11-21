import React from 'react'
import css from './inlineLoader.scss'

const InlineLoader = () => {
  return(
    <div className={css.spinner}>
      <div className={css.bounce1}></div>
      <div className={css.bounce2}></div>
      <div className={css.bounce3}></div>
    </div>
  )
}

export default InlineLoader

import React from "react"
import { TextArea } from "semantic-ui-react"

const TextAreaWithLimit = ({ value, setValue, limit, style = {} }) => {
  return (
    <>
      <TextArea
        value={value}
        onChange={e =>
          e.target.value.length <= limit && setValue(e.target.value)
        }
        rows={5}
        style={style}
      />
      {value.length}/{limit}
    </>
  )
}

export default TextAreaWithLimit
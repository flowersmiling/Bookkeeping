/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import InputMask from 'react-input-mask'

export default forwardRef((props: any, ref) => {
  const inputRef = useRef<any>(null)
  const [value, setValue] = useState(props.value)

  function inputHandler(e: { target: { value: string } }) {
    setValue(e.target.value)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    afterGuiAttached: () => {
      if (inputRef.current !== undefined) {
        setValue(props.value)
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }))

  // Postcode Number(2 sectors):'ANA NAN', where 'A' represents an alphabetic character and 'N' represents a numeric character
  return (
    <InputMask
      mask="a9a 9a9"
      ref={inputRef}
      onChange={inputHandler}
      value={value}
    />
  )
})

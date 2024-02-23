import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react'

export default forwardRef((props: any, ref) => {
  const inputRef = useRef<any>()
  const [value, setValue] = useState(props.value)

  function inputHandler(e: {
    target: { value: React.SetStateAction<string> }
  }) {
    setValue(e.target.value)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => value
  }))

  useEffect(() => inputRef.current.focus(), [])

  return (
    <input
      type="text"
      className="ag-input-field-input ag-text-field-input"
      ref={inputRef}
      onChange={inputHandler}
      value={value}
      placeholder={`Enter ${props.column.colId}`}
    />
  )
})

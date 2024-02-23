/* eslint-disable @typescript-eslint/no-shadow */

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle
} from 'react'

export default forwardRef((props: any, ref) => {
  const [value, setValue] = useState(props.value)
  const refInput = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getValue() {
      return value
    }
  }))

  // just some keys are allowed to input
  const onKeyPressListener = useCallback((event: any) => {
    // 46 (delete),8 (backspace), 110/190 (decimal point)
    // 37 / 39 (left/right arrow for cursor move)
    // 67 (c) / 86 (v) for copy/paste
    // 48-57 / 96-105 (numeric 0-9)
    const charCode = event.which ? event.which : event.keyCode
    if (
      (charCode < 48 || charCode > 57) &&
      (charCode < 96 || charCode > 105) &&
      charCode !== 46 &&
      charCode !== 8 &&
      charCode !== 37 &&
      charCode !== 39 &&
      charCode !== 67 &&
      charCode !== 86 &&
      charCode !== 110 &&
      charCode !== 190
    ) {
      event.preventDefault()
    }
  }, [])

  const onChangeListener = useCallback(
    (event: any) => setValue(event.target.value),
    []
  )

  useEffect(() => refInput.current.focus(), [])

  return (
    <input
      onKeyDown={onKeyPressListener}
      value={value}
      onChange={onChangeListener}
      ref={refInput}
    />
  )
})

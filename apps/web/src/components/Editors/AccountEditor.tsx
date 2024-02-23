/* eslint-disable @typescript-eslint/no-shadow */

import React, {
  forwardRef,
  useState,
  useRef,
  // useEffect,
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
  // const onKeyPressListener = useCallback(
  //   (event: { nativeEvent: any; preventDefault: () => void }) => {
  //     function isNumeric(event: { key: string }) {
  //       return /\d| |Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(event.key)
  //     }

  //     if (!isNumeric(event.nativeEvent)) {
  //       event.preventDefault()
  //     }
  //   },
  //   []
  // )

  const onChangeListener = useCallback(
    (event: any) => setValue(event.target.value),
    []
  )

  // useEffect(() => refInput.current.focus(), [])

  return (
    <input
      maxLength={25}
      // onKeyDown={onKeyPressListener}
      value={value}
      onChange={onChangeListener}
      ref={refInput}
    />
  )
})

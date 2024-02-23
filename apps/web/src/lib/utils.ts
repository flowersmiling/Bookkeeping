/* eslint-disable import/prefer-default-export */

import { useState, useEffect, useRef } from 'react'

export const storage = {
  getToken: () =>
    JSON.parse(
      (global?.window && window.localStorage.getItem('token')) || 'null'
    ),
  setToken: (token: string) =>
    global?.window &&
    window.localStorage.setItem('token', JSON.stringify(token)),
  clearToken: () => global?.window && window.localStorage.removeItem('token')
}

export const useDebounce = (value: any, delay: any) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )

  return debouncedValue
}

export const useComponentWillMount = (func: { (): void; (): void }) => {
  const willMount = useRef(true)

  if (willMount.current) {
    func()
  }

  willMount.current = false
}

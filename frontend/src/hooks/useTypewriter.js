import { useEffect, useState } from 'react'

export const useTypewriter = (text, speed = 40, enabled = true) => {
  const [display, setDisplay] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    let index = 0
    setDisplay('')

    const timer = setInterval(() => {
      index += 1
      setDisplay(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, enabled])

  return enabled ? display : text
}

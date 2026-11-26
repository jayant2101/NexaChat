import { useEffect, useRef } from 'react'

export function useAutoScroll(dependency) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [dependency])

  return endRef
}

import { useEffect, useRef } from 'react'
import type { BoardState } from '../types'

export function useDebouncedSave(state: BoardState, save: (state: BoardState) => void, delayMs = 300) {
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const timer = window.setTimeout(() => save(state), delayMs)
    return () => window.clearTimeout(timer)
  }, [state, save, delayMs])
}

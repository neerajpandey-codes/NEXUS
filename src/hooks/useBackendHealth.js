import { useEffect, useState } from 'react'
import { fetchBackendHealth } from '../lib/api.js'

const pollIntervalMs = 15000
const requestTimeoutMs = 5000

export default function useBackendHealth() {
  const [health, setHealth] = useState({ status: 'loading', error: null })

  useEffect(() => {
    let isMounted = true
    let isChecking = false
    let activeController = null

    const checkHealth = async () => {
      if (isChecking) return
      isChecking = true
      activeController = new AbortController()
      const timeoutId = window.setTimeout(() => activeController?.abort(), requestTimeoutMs)

      try {
        await fetchBackendHealth({ signal: activeController.signal })
        if (isMounted) setHealth({ status: 'connected', error: null })
      } catch (error) {
        if (isMounted) {
          const message = error.name === 'AbortError'
            ? 'Backend health check timed out'
            : error.message || 'Unable to reach the backend'
          setHealth({ status: 'disconnected', error: message })
        }
      } finally {
        window.clearTimeout(timeoutId)
        activeController = null
        isChecking = false
      }
    }

    checkHealth()
    const intervalId = window.setInterval(checkHealth, pollIntervalMs)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      activeController?.abort()
    }
  }, [])

  return health
}

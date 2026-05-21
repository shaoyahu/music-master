import { useCallback } from 'react'
import { useAppStore } from '../stores/appStore'

const API_KEY_REGEX = /^[a-zA-Z0-9_-]{20,}$/

export interface UseApiKeyReturn {
  apiKey: string
  setApiKey: (key: string) => void
  validateApiKey: (key?: string) => boolean
  isValidating: boolean
}

export function useApiKey(): UseApiKeyReturn {
  const storeApiKey = useAppStore((state) => state.apiKey)
  const storeSetApiKey = useAppStore((state) => state.setApiKey)

  const validateApiKey = useCallback((key?: string): boolean => {
    const keyToValidate = key ?? storeApiKey
    if (!keyToValidate) {
      return false
    }
    return API_KEY_REGEX.test(keyToValidate)
  }, [storeApiKey])

  return {
    apiKey: storeApiKey,
    setApiKey: storeSetApiKey,
    validateApiKey,
    isValidating: false,
  }
}

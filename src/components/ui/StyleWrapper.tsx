import { useAppStore } from '@/stores/appStore'

export function useIsAnimalStyle(): boolean {
  const style = useAppStore((state) => state.style)
  return style === 'animal'
}

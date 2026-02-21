import { useRef } from 'react'

/**
 * Dev-only hook that logs how many times a component renders.
 * Logs are stripped from production builds via terser's drop_console.
 *
 * Usage: useRenderCount('EditorWorkspacePreview')
 */
export const useRenderCount = (componentName: string): void => {
  const count = useRef(0)
  count.current += 1
  console.log(`[RenderCount] ${componentName}: ${count.current}`)
}

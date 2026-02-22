/* eslint-disable react-hooks/refs */
import { useRef } from 'react'

/**
 * Dev-only hook that logs how many times a component renders.
 * Logs are stripped from production builds via terser's drop_console.
 * Set VITE_RENDER_COUNT=true in .env.local to enable.
 *
 * Usage: useRenderCount('EditorWorkspacePreview')
 */
export const useRenderCount = (componentName: string): void => {
  const count = useRef(0)

  if (!import.meta.env.DEV || import.meta.env.VITE_RENDER_COUNT !== 'true') return

  count.current += 1
  console.log(`[RenderCount] ${componentName}: ${count.current}`)
}

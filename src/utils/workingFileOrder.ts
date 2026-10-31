import type { WorkingFile } from '../interfaces'

export const orderWorkingFiles = (files: WorkingFile[], order: string[]): WorkingFile[] => {
  const remaining = new Map(files.map((file) => [file.id, file]))
  const ordered: WorkingFile[] = []

  for (const id of order) {
    const file = remaining.get(id)
    if (file) {
      ordered.push(file)
      remaining.delete(id)
    }
  }

  return [...ordered, ...remaining.values()]
}

export const moveWorkingFile = (files: WorkingFile[], id: string, destination: number): WorkingFile[] => {
  const source = files.findIndex((file) => file.id === id)
  if (source < 0 || !Number.isInteger(destination) || destination < 0 || destination >= files.length || source === destination) return files

  const reordered = [...files]
  const [file] = reordered.splice(source, 1)
  reordered.splice(destination, 0, file)
  return reordered
}

export const converSecondsToHM = (seconds: number) => {
  const d = new Date(seconds * 1000)
  const hh = d.getUTCHours()
  const mm = d.getUTCMinutes()
  return [hh, mm]
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

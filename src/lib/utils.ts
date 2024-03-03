export const LOAD_LIMIT = 20

export const extractSnippet = (text: string, length: number) => {
  return text
    .split(".")
    .filter(Boolean)
    .sort(() => Math.random() - 0.5)
    .slice(0, length)
    .join(" ")
}


export function useImageUrl(name) {
  return new URL(`../../assets/images/${name}.png`, import.meta.url).href;
}

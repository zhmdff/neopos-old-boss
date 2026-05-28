/** Audit təsvirindəki daxili NeoPos teqləri — bildiriş/UI üçün silinir. */
export function stripNeoPosInternalTags(text) {
  return String(text || '')
    .replace(/\s*\[\[NeoPos:afterKitchen:[01]\]\]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

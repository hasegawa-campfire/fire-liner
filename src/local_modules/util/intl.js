const languages = navigator.languages.map((loc) => {
  return new Intl.Locale(loc).language
})

/**
 * @template T
 * @param {Record<string, T>} langMap
 * @return {T}
 */
export function findLang(langMap) {
  for (const lang of languages) {
    if (langMap[lang]) return langMap[lang]
  }

  if (langMap.en) return langMap.en

  return Object.values(langMap)[0]
}

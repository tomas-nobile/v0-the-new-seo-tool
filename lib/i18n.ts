export type DetectedLanguage = 'en' | 'es' | 'pt'

export const translations = {
  en: {
    whatAISeesNow: 'What AI sees now',
    whatAIWillSee: 'What AI will see after',
    readyToUpload: 'Your ready-to-upload page',
    copyHTML: 'Copy HTML',
    downloadHTML: 'Download HTML',
    preview: 'Preview',
    code: 'Code',
    copied: 'Copied!',
    howToUpload: 'How to upload your page',
  },
  es: {
    whatAISeesNow: 'Lo que la IA ve hoy',
    whatAIWillSee: 'Lo que la IA verá después',
    readyToUpload: 'Tu página lista para subir',
    copyHTML: 'Copiar HTML',
    downloadHTML: 'Descargar HTML',
    preview: 'Vista previa',
    code: 'Código',
    copied: '¡Copiado!',
    howToUpload: 'Cómo subir tu página',
  },
  pt: {
    whatAISeesNow: 'O que a IA vê agora',
    whatAIWillSee: 'O que a IA verá depois',
    readyToUpload: 'Sua página pronta para upload',
    copyHTML: 'Copiar HTML',
    downloadHTML: 'Baixar HTML',
    preview: 'Visualização',
    code: 'Código',
    copied: 'Copiado!',
    howToUpload: 'Como fazer upload da sua página',
  },
}

export function getTranslation(lang: DetectedLanguage, key: keyof (typeof translations)['en']): string {
  return translations[lang]?.[key] || translations.en[key]
}

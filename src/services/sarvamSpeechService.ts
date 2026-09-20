import type { Language } from '../types'

const DEFAULT_PROXY = '/api/sarvam'

function getSarvamProxyBase(): string {
  const configured = import.meta.env.VITE_SARVAM_PROXY_URL
  if (typeof configured === 'string' && configured.trim()) {
    return configured.trim().replace(/\/+$/, '')
  }
  return DEFAULT_PROXY
}

function normalizeLanguage(language: Language): string {
  switch (language) {
    case 'hi':
      return 'hi'
    case 'ta':
      return 'ta'
    case 'te':
      return 'te'
    case 'bn':
      return 'bn'
    case 'en':
    default:
      return 'en'
  }
}

async function parseJsonOrText(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return text ? { text } : {}
}

export async function speechToText(audioBlob: Blob, language: Language = 'hi'): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('No audio was captured for transcription.')
  }

  const proxyUrl = `${getSarvamProxyBase()}/speech-to-text`
  const formData = new FormData()
  formData.append('audio', audioBlob, `voice-${Date.now()}.webm`)
  formData.append('language', normalizeLanguage(language))

  const response = await fetch(proxyUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const payload = await parseJsonOrText(response)
    const message = typeof payload === 'object' && payload && 'error' in payload
      ? String((payload as { error?: string }).error ?? 'Speech-to-text failed.')
      : `Speech-to-text failed with status ${response.status}.`
    throw new Error(message)
  }

  const payload = await parseJsonOrText(response)
  if (typeof payload === 'object' && payload && 'transcript' in payload) {
    return String((payload as { transcript?: string }).transcript ?? '').trim()
  }
  if (typeof payload === 'object' && payload && 'text' in payload) {
    return String((payload as { text?: string }).text ?? '').trim()
  }
  if (typeof payload === 'string') {
    return payload.trim()
  }
  return ''
}

export async function textToSpeech(text: string, language: Language = 'hi'): Promise<Blob | string> {
  const cleaned = text.trim()
  if (!cleaned) {
    throw new Error('No text to convert to speech.')
  }

  const proxyUrl = `${getSarvamProxyBase()}/text-to-speech`
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: cleaned,
      language: normalizeLanguage(language),
    }),
  })

  if (!response.ok) {
    const payload = await parseJsonOrText(response)
    const message = typeof payload === 'object' && payload && 'error' in payload
      ? String((payload as { error?: string }).error ?? 'Text-to-speech failed.')
      : `Text-to-speech failed with status ${response.status}.`
    throw new Error(message)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('audio') || contentType.includes('application/octet-stream')) {
    return response.blob()
  }

  const payload = await parseJsonOrText(response)
  if (typeof payload === 'object' && payload && 'audioUrl' in payload) {
    return String((payload as { audioUrl?: string }).audioUrl ?? '').trim()
  }
  if (typeof payload === 'object' && payload && 'base64' in payload) {
    const base64 = String((payload as { base64?: string }).base64 ?? '')
    const binary = atob(base64.includes(',') ? base64.split(',')[1] : base64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new Blob([bytes], { type: 'audio/mpeg' })
  }

  throw new Error('TTS endpoint did not return audio data.')
}

export function speakTextWithFallback(text: string, language: Language = 'hi'): boolean {
  if (!('speechSynthesis' in window)) {
    return false
  }

  const cleaned = text.trim()
  if (!cleaned) {
    return false
  }

  const utterance = new SpeechSynthesisUtterance(cleaned)
  utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : language === 'bn' ? 'bn-IN' : 'en-IN'
  utterance.rate = 0.96
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
  return true
}

export async function playQuestionAudio(text: string, language: Language = 'hi'): Promise<void> {
  try {
    const audio = await textToSpeech(text, language)
    if (audio instanceof Blob) {
      const url = URL.createObjectURL(audio)
      const element = new Audio(url)
      await element.play()
      return
    }
    if (typeof audio === 'string' && audio.trim()) {
      const element = new Audio(audio)
      await element.play()
      return
    }
  } catch (error) {
    console.warn('[SarvamSpeech] TTS failed, falling back to browser speech synthesis:', error)
  }

  speakTextWithFallback(text, language)
}

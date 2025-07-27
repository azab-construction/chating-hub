"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslation } from "next-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import SpeechRecognition from "speech-recognition"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onSpeakResponse: (text: string) => void
  isEnabled?: boolean
}

export function VoiceInput({ onTranscript, onSpeakResponse, isEnabled = true }: VoiceInputProps) {
  const { t } = useTranslation("chat")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isEnabled) return

    // تهيئة التعرف على الصوت
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "ar-SA" // Arabic language

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(interimTranscript || finalTranscript)

      if (finalTranscript) {
        onTranscript(finalTranscript)
        setTranscript("")
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    // تهيئة تحويل النص إلى كلام
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isEnabled, onTranscript])

  const startListening = async () => {
    if (!recognitionRef.current) return

    try {
      // طلب إذن الميكروفون
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // إعداد تحليل الصوت لعرض مستوى الصوت
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        setAudioLevel(average / 255)

        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      setIsListening(true)
      recognitionRef.current.start()
      updateAudioLevel()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setAudioLevel(0)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current) return

    // إيقاف أي كلام سابق
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ar-SA"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // البحث عن صوت عربي
    const voices = synthRef.current.getVoices()
    const arabicVoice = voices.find((voice) => voice.lang.includes("ar") || voice.name.includes("Arabic"))

    if (arabicVoice) {
      utterance.voice = arabicVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
    onSpeakResponse(text)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)
  }

  if (!isEnabled) return null

  return (
    <div className="flex items-center gap-2">
      {/* Voice Input Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={cn(
          "relative p-3 rounded-full transition-all duration-200",
          isListening ? "bg-red-500 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200 text-gray-600",
        )}
        title={isListening ? t("stopListening") : t("startListening")}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}

        {/* Audio Level Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 + audioLevel }}
              exit={{ scale: 0 }}
              className="absolute inset-0 bg-red-400 rounded-full opacity-30"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Voice Output Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isSpeaking ? stopSpeaking : () => {}}
        className={cn(
          "p-3 rounded-full transition-all duration-200",
          isSpeaking ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200 text-gray-600",
        )}
        title={isSpeaking ? t("stopSpeaking") : t("voiceOutput")}
      >
        {isSpeaking ? <Square size={20} /> : <Volume2 size={20} />}
      </motion.button>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800 max-w-xs"
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// تصريح الأنواع للـ TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

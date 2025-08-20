"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2, Play, Square, Headphones } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WebRTCClient, type StreamConfig } from "@/lib/audio/webrtc-client"

interface TranslationControllerProps {
  isConnected: boolean
  isTransmitting: boolean
  onConnectionChange: (connected: boolean) => void
  onTransmissionChange: (transmitting: boolean) => void
  onAudioLevelChange: (level: number) => void
  sourceLanguage: string
  targetLanguage: string
  targetChannel: string
  eventStreamKey?: string
  translationStreamKey?: string
  flueSecret?: string
}

export function TranslationController({
  isConnected,
  isTransmitting,
  onConnectionChange,
  onTransmissionChange,
  onAudioLevelChange,
  sourceLanguage,
  targetLanguage,
  targetChannel,
  eventStreamKey,
  translationStreamKey,
  flueSecret,
}: TranslationControllerProps) {
  const [micGain, setMicGain] = useState([75])
  const [outputGain, setOutputGain] = useState([80])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ingressClientRef = useRef<WebRTCClient | null>(null)
  const egressClientRef = useRef<WebRTCClient | null>(null)
  const outputAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function getDevices() {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = deviceList.filter((device) => device.kind === "audioinput")
        setDevices(audioInputs)
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error("[v0] Error getting devices:", error)
      }
    }
    getDevices()
  }, [selectedDevice])

  useEffect(() => {
    if (!isConnected || !analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    function updateAudioLevel() {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const normalizedLevel = (average / 255) * 100
      onAudioLevelChange(normalizedLevel)

      if (isConnected) {
        requestAnimationFrame(updateAudioLevel)
      }
    }

    updateAudioLevel()
  }, [isConnected, onAudioLevelChange])

  const connectMicrophone = async () => {
    try {
      const constraints = {
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      const gainNode = audioContext.createGain()

      analyser.fftSize = 256
      gainNode.gain.value = micGain[0] / 100

      source.connect(gainNode)
      gainNode.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      onConnectionChange(true)
      console.log("[v0] Microphone connected successfully")
    } catch (error) {
      console.error("[v0] Error connecting microphone:", error)
      alert("Erro ao conectar microfone. Verifique as permissões.")
    }
  }

  const disconnectMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    onConnectionChange(false)
    onTransmissionChange(false)
    setIsRecording(false)
    setIsListening(false)
    console.log("[v0] Microphone disconnected")
  }

  const startListening = async () => {
    if (!eventStreamKey) {
      alert("Chave do stream principal não configurada")
      return
    }

    try {
      const egressClient = new WebRTCClient()
      egressClientRef.current = egressClient

      const config: StreamConfig = {
        type: "flue",
        key: eventStreamKey,
        mode: "audio-only",
        url: `https://whep.flue.live/?stream=${eventStreamKey}`,
      }

      await egressClient.connectToFlueStream(config)

      const remoteStream = egressClient.getRemoteStream()
      if (remoteStream && outputAudioRef.current) {
        outputAudioRef.current.srcObject = remoteStream
        outputAudioRef.current.volume = outputGain[0] / 100
        // Ensure audio only goes to output device, not mixed with input
        outputAudioRef.current.muted = false
        await outputAudioRef.current.play()
      }

      setIsListening(true)
      console.log("[v0] Started listening to main event stream (output only)")
    } catch (error) {
      console.error("[v0] Error starting listening:", error)
      alert("Erro ao conectar ao stream principal")
    }
  }

  const stopListening = () => {
    if (egressClientRef.current) {
      egressClientRef.current.disconnect()
      egressClientRef.current = null
    }

    if (outputAudioRef.current) {
      outputAudioRef.current.srcObject = null
    }

    setIsListening(false)
    console.log("[v0] Stopped listening to main event stream")
  }

  const startTransmission = async () => {
    if (!mediaStreamRef.current || !translationStreamKey || !flueSecret) {
      alert("Conecte o microfone e configure as chaves de stream primeiro")
      return
    }

    try {
      const ingressClient = new WebRTCClient()
      ingressClientRef.current = ingressClient

      const config: StreamConfig = {
        type: "flue",
        key: translationStreamKey,
        secret: flueSecret,
        mode: "audio-only",
        url: `https://app.flue.live/live/v1/whip?app=live&stream=${translationStreamKey}&secret=${flueSecret}`,
      }

      // Only send microphone input, never the received audio
      await ingressClient.publishToFlueStream(config, mediaStreamRef.current)
      onTransmissionChange(true)

      console.log("[v0] Translation transmission started via WHIP (microphone only)")
    } catch (error) {
      console.error("[v0] Error starting transmission:", error)
      alert("Erro ao iniciar transmissão da tradução")
    }
  }

  const stopTransmission = () => {
    if (ingressClientRef.current) {
      ingressClientRef.current.disconnect()
      ingressClientRef.current = null
      onTransmissionChange(false)
      console.log("[v0] Translation transmission stopped")
    }
  }

  useEffect(() => {
    if (audioContextRef.current) {
      const gainNodes = audioContextRef.current.createGain()
      gainNodes.gain.value = micGain[0] / 100
    }
  }, [micGain])

  useEffect(() => {
    if (outputAudioRef.current) {
      outputAudioRef.current.volume = outputGain[0] / 100
    }
  }, [outputGain])

  return (
    <div className="space-y-6">
      <audio ref={outputAudioRef} style={{ display: "none" }} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Dispositivo de Áudio</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId} className="text-black">
              {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={isConnected ? disconnectMicrophone : connectMicrophone}
          variant={isConnected ? "destructive" : "default"}
          className="flex-1"
        >
          {isConnected ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
          {isConnected ? "Desconectar" : "Conectar Microfone"}
        </Button>

        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "outline"}
          className="flex-1"
          disabled={!eventStreamKey}
        >
          {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Headphones className="w-4 h-4 mr-2" />}
          {isListening ? "Parar Escuta" : "Escutar Evento"}
        </Button>
      </div>

      {isConnected && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Ganho do Microfone: {micGain[0]}%
            </label>
            <Slider value={micGain} onValueChange={setMicGain} max={150} min={0} step={5} className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Ganho de Saída: {outputGain[0]}%
            </label>
            <Slider value={outputGain} onValueChange={setOutputGain} max={150} min={0} step={5} className="w-full" />
          </div>
        </div>
      )}

      {isConnected && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Status da Tradução:</span>
                <div className="flex gap-2">
                  <Badge variant={isListening ? "default" : "outline"}>
                    {isListening ? "Escutando" : "Sem Escuta"}
                  </Badge>
                  <Badge variant={isTransmitting ? "destructive" : "outline"}>
                    {isTransmitting ? "Transmitindo" : "Parado"}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <div>Origem: {sourceLanguage}</div>
                <div>Destino: {targetLanguage}</div>
                <div>Canal: {targetChannel || "Nenhum selecionado"}</div>
                <div>Stream Principal: {eventStreamKey || "Não configurado"}</div>
                <div>Stream Tradução: {translationStreamKey || "Não configurado"}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={startTransmission}
                  disabled={isTransmitting || !translationStreamKey || !flueSecret}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Transmitir Tradução
                </Button>

                <Button
                  onClick={stopTransmission}
                  disabled={!isTransmitting}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

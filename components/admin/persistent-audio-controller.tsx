"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Radio, Square, Volume2 } from "lucide-react"
import { useAudioStore } from "@/lib/stores/audio-store"

interface PersistentAudioControllerProps {
  currentEventKey?: string
  currentSecret?: string
}

export function PersistentAudioController({ currentEventKey, currentSecret }: PersistentAudioControllerProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [gain, setGain] = useState([75])

  const {
    isCapturing,
    isStreaming,
    audioLevel,
    isPersistent,
    startCapture,
    stopCapture,
    startStreaming,
    stopStreaming,
    setPersistent,
  } = useAudioStore()

  // Get available audio devices
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

  const handleStartCapture = async () => {
    try {
      await startCapture(selectedDevice)
      setPersistent(true)
    } catch (error) {
      alert("Erro ao iniciar captura de áudio. Verifique as permissões.")
    }
  }

  const handleStopCapture = () => {
    stopCapture()
    setPersistent(false)
  }

  const handleStartStreaming = async () => {
    if (!currentEventKey || !currentSecret) {
      alert("Selecione um evento primeiro")
      return
    }

    try {
      await startStreaming(currentEventKey, currentSecret)
    } catch (error) {
      alert("Erro ao iniciar transmissão")
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Captura de Áudio Persistente
          </div>
          <div className="flex gap-2">
            <Badge variant={isCapturing ? "default" : "secondary"}>{isCapturing ? "Capturando" : "Parado"}</Badge>
            <Badge variant={isStreaming ? "destructive" : "outline"}>{isStreaming ? "Transmitindo" : "Offline"}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Dispositivo de Áudio</label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Selecione um microfone" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audio Level Indicator */}
        {isCapturing && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nível de Áudio</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
              </div>
              <span className="text-xs text-white w-12">{Math.round(audioLevel)}%</span>
            </div>
          </div>
        )}

        {/* Gain Control */}
        {isCapturing && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Ganho: {gain[0]}%
            </label>
            <Slider value={gain} onValueChange={setGain} max={150} min={0} step={5} className="w-full" />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={isCapturing ? handleStopCapture : handleStartCapture}
            variant={isCapturing ? "destructive" : "default"}
            className="flex-1"
          >
            {isCapturing ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Parar Captura
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Iniciar Captura
              </>
            )}
          </Button>

          {isCapturing && (
            <Button
              onClick={isStreaming ? stopStreaming : handleStartStreaming}
              variant={isStreaming ? "destructive" : "outline"}
              className="flex-1"
              disabled={!currentEventKey || !currentSecret}
            >
              {isStreaming ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Parar Stream
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Iniciar Stream
                </>
              )}
            </Button>
          )}
        </div>

        {/* Persistent Mode Info */}
        {isPersistent && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Modo Persistente Ativo:</strong> A captura de áudio continuará funcionando mesmo ao navegar entre
              páginas do painel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

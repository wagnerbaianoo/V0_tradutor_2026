"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { webRTCClient } from "@/lib/audio/webrtc-client"

interface StreamPlayerProps {
  stream: any
  isPlaying: boolean
  onPlayingChange?: (playing: boolean) => void
}

export default function StreamPlayer({ stream, isPlaying, onPlayingChange }: StreamPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connectionType, setConnectionType] = useState<"webrtc" | "hls" | "none">("none")
  const [streamUrl, setStreamUrl] = useState<string>("")

  useEffect(() => {
    if (!stream) return

    const setupStream = async () => {
      try {
        if (stream.input_type === "flue" && stream.flue_key) {
          // Try WebRTC first for low latency
          try {
            const remoteStream = webRTCClient.getRemoteStream()
            if (remoteStream) {
              setConnectionType("webrtc")
              if (stream.stream_type === "VIDEO" || stream.stream_type === "LIBRAS") {
                if (videoRef.current) {
                  videoRef.current.srcObject = remoteStream
                }
              } else {
                if (audioRef.current) {
                  audioRef.current.srcObject = remoteStream
                }
              }
              return
            }
          } catch (error) {
            console.log("[v0] WebRTC not available, falling back to HLS")
          }

          // Fallback to HLS (Flue.live)
          const hlsUrl = `https://whep.flue.live/?stream=${stream.flue_key}`
          setStreamUrl(hlsUrl)
          setConnectionType("hls")
        } else {
          // Direct stream URL
          setStreamUrl(stream.url)
          setConnectionType("hls")
        }
      } catch (error) {
        console.error("[v0] Error setting up stream:", error)
        setConnectionType("none")
      }
    }

    setupStream()
  }, [stream])

  useEffect(() => {
    const mediaElement =
      stream?.stream_type === "VIDEO" || stream?.stream_type === "LIBRAS" ? videoRef.current : audioRef.current

    if (mediaElement) {
      if (isPlaying) {
        mediaElement.play().catch(console.error)
      } else {
        mediaElement.pause()
      }
    }
  }, [isPlaying, stream])

  useEffect(() => {
    const mediaElement =
      stream?.stream_type === "VIDEO" || stream?.stream_type === "LIBRAS" ? videoRef.current : audioRef.current

    if (mediaElement) {
      mediaElement.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted, stream])

  const togglePlay = () => {
    const newPlaying = !isPlaying
    onPlayingChange?.(newPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  if (!stream) {
    return (
      <div className="aspect-video bg-black/60 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Selecione um idioma para começar</p>
      </div>
    )
  }

  const isVideoStream = stream.stream_type === "VIDEO" || stream.stream_type === "LIBRAS"

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black/60 rounded-lg flex items-center justify-center relative overflow-hidden">
        {isVideoStream ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop
              playsInline
              src={connectionType === "hls" ? streamUrl : undefined}
            />

            {stream.stream_type === "LIBRAS" && (
              <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-2">
                <div className="text-white text-sm font-medium">Intérprete de Libras</div>
                <div className="text-gray-300 text-xs">Avatar Ana - Profissional</div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button onClick={toggleFullscreen} size="sm" variant="secondary" className="bg-black/50">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">{stream.flag}</div>
            <p className="text-white text-lg">{stream.language}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {isPlaying ? <Pause className="h-6 w-6 text-green-400" /> : <Play className="h-6 w-6 text-gray-400" />}
              <span className="text-gray-400">{isPlaying ? "Reproduzindo" : "Pausado"}</span>
            </div>

            {/* Connection type indicator */}
            <Badge variant="outline" className="mt-2 text-xs">
              {connectionType === "webrtc"
                ? "WebRTC (Baixa Latência)"
                : connectionType === "hls"
                  ? "HLS (Flue.live)"
                  : "Desconectado"}
            </Badge>
          </div>
        )}

        {/* Audio element for audio streams */}
        {!isVideoStream && (
          <audio ref={audioRef} loop className="hidden" src={connectionType === "hls" ? streamUrl : undefined} />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={togglePlay} size="sm" variant="outline" className="bg-white/10 border-white/20">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button onClick={toggleMute} size="sm" variant="outline" className="bg-white/10 border-white/20">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2 min-w-[120px]">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider value={volume} onValueChange={setVolume} max={100} min={0} step={5} className="flex-1" />
            <span className="text-xs text-gray-400 w-8">{volume[0]}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="bg-white/10 border-white/20">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Qualidade: {stream.quality}</span>
          <span>{stream.is_original ? "Original" : "Tradução"}</span>
          <span>Modo: {stream.mode}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionType === "webrtc" ? "bg-green-500" : connectionType === "hls" ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs">
            {connectionType === "webrtc" ? "WebRTC" : connectionType === "hls" ? "HLS" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  )
}

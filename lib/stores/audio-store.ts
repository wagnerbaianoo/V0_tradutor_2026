import { create } from "zustand"
import { WebRTCClient, type StreamConfig } from "@/lib/audio/webrtc-client"

interface AudioState {
  // Audio capture state
  isCapturing: boolean
  mediaStream: MediaStream | null
  webRTCClient: WebRTCClient | null
  audioLevel: number

  // Event streaming state
  currentEventKey: string | null
  currentSecret: string | null
  isStreaming: boolean

  // Actions
  startCapture: (deviceId?: string) => Promise<void>
  stopCapture: () => void
  startStreaming: (eventKey: string, secret: string) => Promise<void>
  stopStreaming: () => void
  updateAudioLevel: (level: number) => void

  // Persistent state - survives navigation
  isPersistent: boolean
  setPersistent: (persistent: boolean) => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  isCapturing: false,
  mediaStream: null,
  webRTCClient: null,
  audioLevel: 0,
  currentEventKey: null,
  currentSecret: null,
  isStreaming: false,
  isPersistent: false,

  // Start audio capture
  startCapture: async (deviceId?: string) => {
    try {
      const client = new WebRTCClient()

      const constraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      }

      const stream = await client.captureMedia(constraints)

      if (stream) {
        set({
          isCapturing: true,
          mediaStream: stream,
          webRTCClient: client,
        })

        console.log("[v0] Audio capture started (persistent)")
      }
    } catch (error) {
      console.error("[v0] Error starting audio capture:", error)
      throw error
    }
  },

  // Stop audio capture
  stopCapture: () => {
    const { mediaStream, webRTCClient } = get()

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
    }

    if (webRTCClient) {
      webRTCClient.disconnect()
    }

    set({
      isCapturing: false,
      mediaStream: null,
      webRTCClient: null,
      isStreaming: false,
      currentEventKey: null,
      currentSecret: null,
      audioLevel: 0,
    })

    console.log("[v0] Audio capture stopped")
  },

  // Start streaming to event
  startStreaming: async (eventKey: string, secret: string) => {
    const { mediaStream, webRTCClient } = get()

    if (!mediaStream || !webRTCClient) {
      throw new Error("Audio capture must be started first")
    }

    try {
      const config: StreamConfig = {
        type: "flue",
        key: eventKey,
        secret: secret,
        mode: "audio-only",
        url: `https://app.flue.live/live/v1/whip?app=live&stream=${eventKey}&secret=${secret}`,
      }

      await webRTCClient.publishToFlueStream(config, mediaStream)

      set({
        isStreaming: true,
        currentEventKey: eventKey,
        currentSecret: secret,
      })

      console.log("[v0] Streaming started to event:", eventKey)
    } catch (error) {
      console.error("[v0] Error starting streaming:", error)
      throw error
    }
  },

  // Stop streaming
  stopStreaming: () => {
    const { webRTCClient } = get()

    if (webRTCClient) {
      webRTCClient.disconnect()
      // Recreate client to maintain capture but stop streaming
      const newClient = new WebRTCClient()
      set({
        webRTCClient: newClient,
        isStreaming: false,
        currentEventKey: null,
        currentSecret: null,
      })
    }

    console.log("[v0] Streaming stopped")
  },

  // Update audio level
  updateAudioLevel: (level: number) => {
    set({ audioLevel: level })
  },

  // Set persistent mode
  setPersistent: (persistent: boolean) => {
    set({ isPersistent: persistent })
  },
}))

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Settings, Radio, Headphones } from "lucide-react"
import { TranslationController } from "@/components/translator/translation-controller"
import { LanguageSelector } from "@/components/translator/language-selector"
import { ChannelRouter } from "@/components/translator/channel-router"
import { AudioVisualizer } from "@/components/translator/audio-visualizer"

export default function TranslatorPanel() {
  const [isConnected, setIsConnected] = useState(false)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState({
    source: "pt-BR",
    target: "en-US",
  })
  const [selectedChannel, setSelectedChannel] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Painel do Tradutor</h1>
          <p className="text-slate-300">Sistema de Tradução Simultânea V5</p>
          <div className="flex justify-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
              <Radio className="w-3 h-3" />
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            <Badge variant={isTransmitting ? "destructive" : "outline"} className="gap-1">
              <Mic className="w-3 h-3" />
              {isTransmitting ? "Transmitindo" : "Parado"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Selection */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração de Idiomas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSelector selectedLanguages={selectedLanguages} onLanguageChange={setSelectedLanguages} />
            </CardContent>
          </Card>

          {/* Channel Router */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Canal de Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelRouter
                selectedChannel={selectedChannel}
                onChannelChange={setSelectedChannel}
                targetLanguage={selectedLanguages.target}
              />
            </CardContent>
          </Card>
        </div>

        {/* Audio Visualizer */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Monitoramento de Áudio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudioVisualizer audioLevel={audioLevel} isListening={isConnected} />
          </CardContent>
        </Card>

        {/* Translation Controller */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Controle de Tradução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationController
              isConnected={isConnected}
              isTransmitting={isTransmitting}
              onConnectionChange={setIsConnected}
              onTransmissionChange={setIsTransmitting}
              onAudioLevelChange={setAudioLevel}
              sourceLanguage={selectedLanguages.source}
              targetLanguage={selectedLanguages.target}
              targetChannel={selectedChannel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

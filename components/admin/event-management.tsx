"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, Users, Settings, Radio } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PersistentAudioController } from "./persistent-audio-controller"

interface Event {
  id: string
  name: string
  description: string
  start_time: string
  end_time: string
  access_code: string
  is_active: boolean
  libras_enabled: boolean
  translation_enabled: boolean
  max_participants?: number
  stream_key?: string
  flue_secret?: string
}

interface Translator {
  id: string
  name: string
  email: string
}

interface EventManagementProps {
  onStatsUpdate: () => void
}

export function EventManagement({ onStatsUpdate }: EventManagementProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [translators, setTranslators] = useState<Translator[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedEventForStreaming, setSelectedEventForStreaming] = useState<Event | null>(null)
  const [assignedTranslators, setAssignedTranslators] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_time: "",
    end_time: "",
    access_code: "",
    is_active: false,
    libras_enabled: false,
    translation_enabled: false,
    max_participants: "",
    stream_key: "",
    flue_secret: "",
  })
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
    loadTranslators()
  }, [])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("[v0] Error loading events:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTranslators = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "TRANSLATOR")
        .order("name")

      if (error) throw error
      setTranslators(data || [])
    } catch (error) {
      console.error("[v0] Error loading translators:", error)
    }
  }

  const loadAssignedTranslators = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("translation_channels")
        .select("translator_id")
        .eq("event_id", eventId)

      if (error) throw error
      setAssignedTranslators(data?.map((t) => t.translator_id).filter(Boolean) || [])
    } catch (error) {
      console.error("[v0] Error loading assigned translators:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        access_code: formData.access_code.toUpperCase(),
        is_active: formData.is_active,
        libras_enabled: formData.libras_enabled,
        translation_enabled: formData.translation_enabled,
        max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
        stream_key: formData.stream_key || generateStreamKey(formData.access_code),
        flue_secret: formData.flue_secret || generateFlueSecret(),
      }

      let eventId: string

      if (editingEvent) {
        const { error } = await supabase.from("events").update(eventData).eq("id", editingEvent.id)
        if (error) throw error
        eventId = editingEvent.id
      } else {
        const { data, error } = await supabase.from("events").insert(eventData).select("id").single()
        if (error) throw error
        eventId = data.id
      }

      if (assignedTranslators.length > 0) {
        await supabase.from("translation_channels").delete().eq("event_id", eventId)

        const assignments = assignedTranslators.map((translatorId) => ({
          event_id: eventId,
          translator_id: translatorId,
          base_language: "pt-BR",
          target_language: "en-US",
          is_active: true,
        }))

        const { error: assignError } = await supabase.from("translation_channels").insert(assignments)
        if (assignError) throw assignError
      }

      await loadEvents()
      onStatsUpdate()
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving event:", error)
      alert("Erro ao salvar evento")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || "",
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      access_code: event.access_code,
      is_active: event.is_active,
      libras_enabled: event.libras_enabled,
      translation_enabled: event.translation_enabled,
      max_participants: event.max_participants?.toString() || "",
      stream_key: event.stream_key || "",
      flue_secret: event.flue_secret || "",
    })

    await loadAssignedTranslators(event.id)
    setShowForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)
      if (error) throw error

      await loadEvents()
      onStatsUpdate()
    } catch (error) {
      console.error("[v0] Error deleting event:", error)
      alert("Erro ao excluir evento")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_time: "",
      end_time: "",
      access_code: "",
      is_active: false,
      libras_enabled: false,
      translation_enabled: false,
      max_participants: "",
      stream_key: "",
      flue_secret: "",
    })
    setEditingEvent(null)
    setAssignedTranslators([])
    setShowForm(false)
  }

  const generateAccessCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData({ ...formData, access_code: code })
  }

  const generateStreamKey = (accessCode: string) => {
    return `${accessCode.toLowerCase()}-principal`
  }

  const generateFlueSecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSelectEventForStreaming = (event: Event) => {
    setSelectedEventForStreaming(event)
  }

  return (
    <div className="space-y-6">
      <PersistentAudioController
        currentEventKey={selectedEventForStreaming?.stream_key}
        currentSecret={selectedEventForStreaming?.flue_secret}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciamento de Eventos</h2>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">{editingEvent ? "Editar Evento" : "Criar Novo Evento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Nome do Evento</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Código de Acesso</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.access_code}
                      onChange={(e) => setFormData({ ...formData, access_code: e.target.value.toUpperCase() })}
                      className="bg-white/10 border-white/20 text-white font-mono"
                      placeholder="TECH2025"
                      required
                    />
                    <Button type="button" onClick={generateAccessCode} variant="outline" size="sm">
                      Gerar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Chave do Stream</label>
                  <Input
                    value={formData.stream_key}
                    onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })}
                    className="bg-white/10 border-white/20 text-white font-mono"
                    placeholder="Gerado automaticamente"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Flue Secret</label>
                  <Input
                    value={formData.flue_secret}
                    onChange={(e) => setFormData({ ...formData, flue_secret: e.target.value })}
                    className="bg-white/10 border-white/20 text-white font-mono"
                    placeholder="Gerado automaticamente"
                  />
                </div>
              </div>

              {formData.translation_enabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Tradutores Designados</label>
                  <Select
                    value={assignedTranslators[0] || ""}
                    onValueChange={(value) => setAssignedTranslators(value ? [value] : [])}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione um tradutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {translators.map((translator) => (
                        <SelectItem key={translator.id} value={translator.id}>
                          {translator.name} ({translator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Data/Hora Início</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Data/Hora Fim</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Máx. Participantes</label>
                  <Input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium text-white">Evento Ativo</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.libras_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, libras_enabled: checked })}
                  />
                  <label className="text-sm font-medium text-white">Libras Habilitado</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.translation_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, translation_enabled: checked })}
                  />
                  <label className="text-sm font-medium text-white">Tradução Habilitada</label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {editingEvent ? "Atualizar" : "Criar"} Evento
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Nenhum evento encontrado</div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                      <Badge variant={event.is_active ? "default" : "secondary"}>
                        {event.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {event.access_code}
                      </Badge>
                      {event.stream_key && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {event.stream_key}
                        </Badge>
                      )}
                    </div>

                    {event.description && <p className="text-gray-300 mb-3">{event.description}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Início: {new Date(event.start_time).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Fim: {new Date(event.end_time).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Máx: {event.max_participants || "Ilimitado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>
                          {event.libras_enabled && "Libras "}
                          {event.translation_enabled && "Tradução"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {event.stream_key && event.flue_secret && (
                      <Button
                        onClick={() => handleSelectEventForStreaming(event)}
                        size="sm"
                        variant={selectedEventForStreaming?.id === event.id ? "default" : "outline"}
                      >
                        <Radio className="w-4 h-4" />
                      </Button>
                    )}
                    <Button onClick={() => handleEdit(event)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(event.id)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

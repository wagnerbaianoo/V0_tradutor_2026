/*
  # Production Seed Data for TranslateEvent V5
  Creates demo users and events for testing all functionality
*/

-- Insert demo users with different roles
INSERT INTO users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'superadmin@translateevent.com', 'Super Admin', 'SUPER_ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'admin1@translateevent.com', 'Admin Principal', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000003', 'admin2@translateevent.com', 'Admin Secundário', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000004', 'translator1@translateevent.com', 'Maria Silva', 'TRANSLATOR'),
  ('00000000-0000-0000-0000-000000000005', 'translator2@translateevent.com', 'João Santos', 'TRANSLATOR'),
  ('00000000-0000-0000-0000-000000000006', 'translator3@translateevent.com', 'Ana Costa', 'TRANSLATOR')
ON CONFLICT (id) DO NOTHING;

-- Insert demo events with proper streaming configuration
INSERT INTO events (
  id, name, description, start_time, end_time, access_code, 
  is_active, translation_enabled, libras_enabled, 
  stream_key, flue_secret, created_by
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Conferência Tech 2025',
    'Conferência internacional de tecnologia com tradução simultânea',
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '5 hours',
    'TECH2025',
    true,
    true,
    true,
    'tech2025-principal',
    'secret_tech2025_main_stream',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Seminário de Negócios',
    'Seminário sobre estratégias de negócios digitais',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days 4 hours',
    'BIZ2025',
    true,
    true,
    false,
    'biz2025-principal',
    'secret_biz2025_main_stream',
    '00000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert translation channels with translator assignments
INSERT INTO translation_channels (
  event_id, base_language, target_language, translator_id, is_active
) VALUES
  ('10000000-0000-0000-0000-000000000001', 'pt-BR', 'en-US', '00000000-0000-0000-0000-000000000004', true),
  ('10000000-0000-0000-0000-000000000001', 'pt-BR', 'es-ES', '00000000-0000-0000-0000-000000000005', true),
  ('10000000-0000-0000-0000-000000000002', 'pt-BR', 'en-US', '00000000-0000-0000-0000-000000000006', true)
ON CONFLICT (event_id, base_language, target_language) DO NOTHING;

-- Insert demo streams
INSERT INTO streams (
  event_id, language, language_code, flag, stream_type, 
  url, is_original, input_type, flue_key, mode
) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Português', 'pt-BR', '🇧🇷', 'AUDIO', 'https://whep.flue.live/?stream=tech2025-principal', true, 'flue', 'tech2025-principal', 'audio-only'),
  ('10000000-0000-0000-0000-000000000001', 'English', 'en-US', '🇺🇸', 'TRANSLATION', 'https://whep.flue.live/?stream=tech2025-en-us', false, 'flue', 'tech2025-en-us', 'audio-only'),
  ('10000000-0000-0000-0000-000000000001', 'Español', 'es-ES', '🇪🇸', 'TRANSLATION', 'https://whep.flue.live/?stream=tech2025-es-es', false, 'flue', 'tech2025-es-es', 'audio-only'),
  ('10000000-0000-0000-0000-000000000002', 'Português', 'pt-BR', '🇧🇷', 'AUDIO', 'https://whep.flue.live/?stream=biz2025-principal', true, 'flue', 'biz2025-principal', 'audio-only'),
  ('10000000-0000-0000-0000-000000000002', 'English', 'en-US', '🇺🇸', 'TRANSLATION', 'https://whep.flue.live/?stream=biz2025-en-us', false, 'flue', 'biz2025-en-us', 'audio-only')
ON CONFLICT (event_id, language_code) DO NOTHING;

-- Insert demo polls
INSERT INTO polls (
  event_id, question, options, status, created_by
) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Qual tecnologia mais te interessa?', ARRAY['IA/Machine Learning', 'Blockchain', 'Cloud Computing', 'IoT'], 'ACTIVE', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Qual o maior desafio nos negócios digitais?', ARRAY['Transformação Digital', 'Segurança', 'Escalabilidade', 'Experiência do Cliente'], 'ACTIVE', '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

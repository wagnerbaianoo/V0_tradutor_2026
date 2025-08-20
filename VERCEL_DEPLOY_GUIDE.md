# TranslateEvent V5 - Guia de Deploy na Vercel

## Configuração das Variáveis de Ambiente

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

### Supabase Configuration
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://hnqkqjlowqjqjqjqjqjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Database Configuration
\`\`\`
DATABASE_URL=postgresql://postgres.hnqkqjlowqjqjqjqjqjq:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.hnqkqjlowqjqjqjqjqjq:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
\`\`\`

### NextAuth Configuration
\`\`\`
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
\`\`\`

### App Configuration
\`\`\`
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
\`\`\`

### Flue.live Configuration
\`\`\`
FLUE_LIVE_SECRET=your-flue-live-secret
\`\`\`

## Passos para Deploy

1. **Conectar Repositório**: Conecte seu repositório GitHub à Vercel
2. **Configurar Variáveis**: Adicione todas as variáveis acima no painel da Vercel
3. **Deploy**: Faça o deploy - a Vercel detectará automaticamente que é um projeto Next.js
4. **Verificar**: Teste a aplicação após o deploy

## Troubleshooting

- Se houver erro de build, verifique se todas as variáveis estão configuradas
- Para problemas de Supabase, verifique se as URLs e chaves estão corretas
- Para problemas de autenticação, verifique o NEXTAUTH_URL e NEXTAUTH_SECRET

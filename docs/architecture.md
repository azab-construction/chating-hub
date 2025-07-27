# نظام الهندسة المعمارية والتقنيات

## التقنيات المستخدمة
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL + Redis (للتخزين المؤقت)
- **AI APIs**: OpenAI GPT-4, Anthropic Claude, DeepSeek
- **Authentication**: NextAuth.js + JWT
- **File Storage**: AWS S3 / Cloudinary
- **Real-time**: Socket.io
- **Internationalization**: next-i18next (دعم العربية الكامل)

## هيكل النظام
\`\`\`
ai-chat-hub/
├── apps/
│   ├── web/                 # Next.js Frontend
│   └── api/                 # Express Backend
├── packages/
│   ├── ui/                  # Shared UI Components
│   ├── database/            # Prisma Schema
│   └── types/               # TypeScript Types
└── docs/                    # Documentation
\`\`\`

## تدفق المصادقة
1. OAuth مع Google/GitHub
2. JWT Tokens مع Refresh Token
3. Role-based Access (Free/Pro/Enterprise)

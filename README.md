# مركز الذكاء الاصطناعي - AI Chat Hub

منصة متكاملة للذكاء الاصطناعي مع دعم كامل للعربية وتكاملات متقدمة مع GPT-4، Claude، وDeepSeek.

## ✨ الميزات الرئيسية

### 🤖 ذكاء اصطناعي متقدم
- **تدفق عمل ذكي**: تعاون بين GPT-4 للتخطيط، Claude للتحليل، وDeepSeek للتنفيذ
- **نماذج متعددة**: GPT-4، Claude Opus/Sonnet، DeepSeek Coder
- **معالجة السياق**: إدارة ذكية للرموز والذاكرة

### 🌍 دعم كامل للعربية
- **واجهة RTL**: تصميم مُحسَّن للغة العربية
- **ترجمة شاملة**: جميع النصوص متوفرة بالعربية
- **خطوط محسَّنة**: دعم خط Noto Sans Arabic

### 📁 معالجة الملفات المتقدمة
- **أنواع متعددة**: PDF، Word، صور، نصوص، Markdown
- **استخراج المحتوى**: تحليل ذكي للملفات
- **رفع بالسحب والإفلات**: واجهة سهلة الاستخدام

### 🔗 تكاملات قوية
- **Gmail**: قراءة وإرسال الرسائل
- **Google Drive**: البحث والوصول للملفات
- **Google Calendar**: إدارة المواعيد
- **Stripe**: معالجة المدفوعات
- **GitHub**: تصفح المستودعات

### 💳 نظام الاشتراكات
- **خطة مجانية**: وصول محدود
- **خطة احترافية**: جميع الميزات
- **خطة مؤسسية**: ميزات متقدمة للفرق

### 🎙️ الصوت والتعاون
- **إدخال صوتي**: التعرف على الكلام العربي
- **إخراج صوتي**: تحويل النص لكلام
- **تعاون فوري**: مشاركة المحادثات مع الفريق

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- PostgreSQL
- Redis (اختياري)

### 1. استنساخ المشروع
\`\`\`bash
git clone https://github.com/your-username/ai-chat-hub.git
cd ai-chat-hub
\`\`\`

### 2. تثبيت التبعيات
\`\`\`bash
npm install
\`\`\`

### 3. إعداد متغيرات البيئة
انسخ ملف \`.env.example\` إلى \`.env\` وأضف المفاتيح المطلوبة:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chat_hub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# AI APIs
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
DEEPSEEK_API_KEY="your-deepseek-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# API
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"
\`\`\`

### 4. إعداد قاعدة البيانات
\`\
NEXT_PUBLIC_API_URL="http://localhost:3001"
\`\`\`

### 4. إعداد قاعدة البيانات
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 5. تشغيل التطبيق
\`\`\`bash
# تشغيل الخادم الخلفي
npm run dev:api

# تشغيل الواجهة الأمامية (في terminal آخر)
npm run dev:web
\`\`\`

## 📁 هيكل المشروع

\`\`\`
ai-chat-hub/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── app/            # App Router Pages
│   │   ├── components/     # React Components
│   │   ├── lib/           # Utilities & Config
│   │   └── store/         # Zustand State Management
│   └── api/               # Express Backend
│       ├── src/
│       │   ├── routes/    # API Routes
│       │   ├── services/  # Business Logic
│       │   └── middleware/ # Express Middleware
├── packages/
│   ├── database/          # Prisma Schema
│   ├── ui/               # Shared UI Components
│   └── types/            # TypeScript Types
└── docs/                 # Documentation
\`\`\`

## 🔧 التكوين المتقدم

### إعداد Redis للتخزين المؤقت
\`\`\`bash
# تثبيت Redis
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# تشغيل Redis
redis-server
\`\`\`

### إعداد Stripe Webhooks
1. قم بإنشاء webhook endpoint في لوحة تحكم Stripe
2. أضف URL: `https://yourdomain.com/api/billing/webhook`
3. اختر الأحداث: `checkout.session.completed`, `customer.subscription.updated`

### إعداد OAuth Apps

#### Google OAuth
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google+ API و Gmail API
4. أنشئ OAuth 2.0 credentials
5. أضف redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. اذهب إلى GitHub Settings > Developer settings > OAuth Apps
2. أنشئ OAuth App جديد
3. أضف Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 🧪 الاختبار

\`\`\`bash
# تشغيل الاختبارات
npm test

# اختبارات التكامل
npm run test:integration

# اختبارات الأداء
npm run test:performance
\`\`\`

## 📊 المراقبة والتحليلات

### إعداد التحليلات
- **استخدام الرموز**: تتبع استهلاك API
- **أداء النماذج**: قياس أوقات الاستجابة
- **تفاعل المستخدمين**: إحصائيات الاستخدام

### لوحة المراقبة
\`\`\`bash
# الوصول للتحليلات
http://localhost:3000/analytics
\`\`\`

## 🔒 الأمان

### أفضل الممارسات المطبقة
- **تشفير البيانات**: جميع البيانات الحساسة مشفرة
- **معدل الطلبات**: حماية من الإفراط في الاستخدام
- **التحقق من الهوية**: JWT tokens آمنة
- **CORS**: إعدادات أمان صارمة

### متغيرات البيئة الآمنة
\`\`\`bash
# إنشاء مفتاح سري قوي
openssl rand -base64 32
\`\`\`

## 🚀 النشر

### Vercel (الواجهة الأمامية)
\`\`\`bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر التطبيق
vercel --prod
\`\`\`

### Railway/Heroku (الخادم الخلفي)
\`\`\`bash
# إعداد متغيرات البيئة
# نشر التطبيق
\`\`\`

### Docker
\`\`\`dockerfile
# Dockerfile متوفر في المشروع
docker build -t ai-chat-hub .
docker run -p 3000:3000 ai-chat-hub
\`\`\`

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

### خطوات المساهمة
1. Fork المشروع
2. أنشئ branch للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم

### الحصول على المساعدة
- **الوثائق**: [docs.ai-chat-hub.com](https://docs.ai-chat-hub.com)
- **المجتمع**: [Discord Server](https://discord.gg/ai-chat-hub)
- **البريد الإلكتروني**: support@ai-chat-hub.com

### الإبلاغ عن المشاكل
استخدم [GitHub Issues](https://github.com/your-username/ai-chat-hub/issues) للإبلاغ عن الأخطاء أو طلب ميزات جديدة.

## 🎯 خارطة الطريق

### الإصدار القادم (v2.0)
- [ ] دعم المزيد من اللغات
- [ ] تكاملات إضافية (Slack, Discord)
- [ ] ميزات الذكاء الاصطناعي المتقدمة
- [ ] تطبيق الهاتف المحمول
- [ ] API عامة للمطورين

### المساهمون

شكر خاص لجميع المساهمين في هذا المشروع:

<a href="https://github.com/your-username/ai-chat-hub/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-username/ai-chat-hub" />
</a>

---

<div align="center">
  <p>صُنع بـ ❤️ للمجتمع العربي</p>
  <p>
    <a href="https://ai-chat-hub.com">الموقع الرسمي</a> •
    <a href="https://docs.ai-chat-hub.com">الوثائق</a> •
    <a href="https://discord.gg/ai-chat-hub">Discord</a>
  </p>
</div>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

ShipAny Template Two 是一个企业级 AI SaaS 应用模板，基于 Next.js 16 (App Router) + React 19 + TypeScript 构建。项目采用模块化架构，支持多种 AI 提供商、支付系统和认证方式。

**技术栈核心**:
- 框架: Next.js 16.0.7 (Turbopack 开发模式)
- 数据库: Drizzle ORM + PostgreSQL/MySQL/SQLite/Turso
- 认证: Better Auth 1.3.7 (支持 OAuth + 邮箱密码)
- 国际化: next-intl (支持中英双语)
- UI: Radix UI + Tailwind CSS 4.x
- 包管理: pnpm

## 常用开发命令

### 启动与构建
```bash
# 开发模式 (使用 Turbopack 加速)
pnpm dev

# 生产构建
pnpm build

# 快速构建 (增加内存限制)
pnpm build:fast

# 启动生产服务器
pnpm start

# 代码检查和格式化
pnpm lint
pnpm format
pnpm format:check
```

### 数据库操作 (Drizzle ORM)
```bash
# 生成迁移文件 (基于 schema 变更)
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 直接推送 schema 到数据库 (开发环境)
pnpm db:push

# 启动 Drizzle Studio (可视化数据库管理)
pnpm db:studio
```

### 认证系统
```bash
# 生成 Better Auth 类型定义
pnpm auth:generate
```

### RBAC 权限系统初始化
```bash
# 初始化角色和权限表 (首次运行)
pnpm rbac:init

# 为用户分配角色
pnpm rbac:assign
```

### 测试与分析
```bash
# 生成 AI 提示词快照测试
pnpm test:prompts

# 构建时进行包体积分析
ANALYZE=true pnpm build
```

### Cloudflare Workers 部署
```bash
# 预览 Cloudflare 部署
pnpm cf:preview

# 部署到 Cloudflare Workers
pnpm cf:deploy

# 上传静态资源
pnpm cf:upload

# 生成 Cloudflare 环境类型定义
pnpm cf:typegen
```

## 核心架构设计

### 目录结构
```
src/
├── core/                    # 核心基础设施层
│   ├── auth/               # Better Auth 认证配置
│   ├── db/                 # Drizzle 数据库连接
│   ├── i18n/               # next-intl 国际化配置
│   ├── rbac/               # RBAC 权限检查
│   └── theme/              # 主题提供者
│
├── extensions/              # 功能扩展模块 (插件式)
│   ├── ai/                 # AI 管理器 (支持 KIE/Replicate 等)
│   ├── payment/            # 支付管理器 (Stripe/PayPal/Creem)
│   ├── email/              # 邮件管理器 (Resend)
│   └── storage/            # 文件存储
│
├── shared/                  # 共享资源库
│   ├── models/             # 数据模型层 (业务逻辑)
│   ├── services/           # 服务层 (调用 models + extensions)
│   ├── components/         # React 组件
│   ├── lib/                # 工具函数库
│   ├── hooks/              # React Hooks
│   ├── types/              # TypeScript 类型定义
│   └── prompt/             # AI 提示词模板
│
├── app/                     # Next.js App Router
│   ├── api/                # API 路由
│   └── [locale]/           # 国际化页面路由
│       ├── (auth)/         # 认证页面
│       ├── (landing)/      # 首页和功能页面
│       ├── (chat)/         # 聊天应用
│       ├── (admin)/        # 管理后台
│       └── (docs)/         # 文档系统
│
└── config/                  # 应用配置
    ├── db/                 # 数据库 schema 和迁移
    └── locale/             # 国际化翻译文件
```

### 数据库架构 (Drizzle ORM)

**连接模式**: 项目支持三种数据库连接模式
- **单例模式**: `DB_SINGLETON_ENABLED=true` - 适用于传统服务器/VPS
- **无服务器模式**: 默认 - 适用于 Vercel/AWS Lambda
- **Cloudflare Workers**: 自动检测 Hyperdrive 连接

**核心数据表** (19 张):
```
认证表:
- user, session, account, verification

业务表:
- order (订单: 支持一次性购买+订阅)
- subscription (订阅管理)
- credit (积分系统: 支持过期管理)
- apikey (API 密钥)

内容表:
- post (文章/博客)
- taxonomy (分类: 支持 category/tag/custom)
- careerShowcase (职业案例展示)

AI 相关:
- aiTask (AI 任务追踪)
- chat, chatMessage (聊天系统)

RBAC:
- role, permission, userRole, rolePermission

系统:
- config (配置键值对: OAuth/支付/AI 凭证)
```

**数据库配置**: `src/core/db/config.ts`
- Schema 定义: `src/config/db/schema.ts`
- 迁移文件: `src/config/db/migrations/`

### 认证系统 (Better Auth)

**配置文件**: `src/core/auth/index.ts`

**双层初始化策略**:
1. **静态配置** (`authOptions`): 构建时零数据库调用
   - 基础配置: appName, baseURL, secret
   - 邮箱密码认证: `emailAndPassword: true`

2. **动态配置** (`getAuthOptions`): 运行时加载
   - 从 `config` 表读取 OAuth 凭证
   - 支持的提供商:
     - Google OAuth (`google_client_id` + `google_client_secret`)
     - GitHub OAuth (`github_client_id` + `github_client_secret`)
     - Google One-Tap (可选插件: `google_one_tap_enabled`)

**API 端点**: `/api/auth/[...all]` (Better Auth 自动路由)

**用户权限扩展**:
- 通过 `shared/services/auth.ts` 中的 `getUserInfo()` 获取用户信息
- 自动附加: `isAdmin`, `credits`, `roles`, `permissions`

### AI 功能架构 (Manager + Provider 模式)

**AI 管理器**: `src/extensions/ai/manager.ts`

**支持的媒体类型**:
- `music` - 音乐生成 (KIE 提供商)
- `image` - 图像生成 (Replicate)
- `video` - 视频生成 (Replicate)
- `text` - 文本生成
- `speech` - 语音合成

**AI 提供商实现**:
```typescript
interface AIProvider {
  name: string
  generate(params): Promise<AITaskResult>  // 创建任务
  query(taskId): Promise<AITaskResult>     // 查询任务状态
}
```

**工作流程**:
1. 前端调用 `/api/ai/generate` (验证积分)
2. 调用 `AIProvider.generate()` 创建任务
3. 保存到 `aiTask` 表 (状态: pending)
4. 异步查询 `/api/ai/query` 获取结果
5. 任务完成后扣除积分 (调用 `models/credit.ts`)

**配置来源**: `config` 表中的 API 密钥
- `kie_api_key` - KIE AI 音乐生成
- `replicate_api_token` - Replicate 多媒体生成

### 支付系统架构 (Manager + Provider 模式)

**支付管理器**: `src/extensions/payment/manager.ts`

**支持的支付提供商**:
- Stripe (订阅 + 一次性购买)
- PayPal (Checkout + Webhook)
- Creem (Web3 支付)

**支付类型**:
```typescript
PaymentType: 'one-time' | 'subscription' | 'renew'
PaymentInterval: 'one-time' | 'day' | 'week' | 'month' | 'year'
```

**支付流程**:
```
POST /api/payment/checkout
  → 创建 PaymentOrder
  → 调用 PaymentProvider.createPayment()
  → 返回 checkoutUrl (跳转到支付页面)

GET /api/payment/callback?order_no=XXX
  → 验证支付状态
  → 创建 Credit 记录
  → 创建 Subscription (如果是订阅)
  → 重定向到成功页面

POST /api/payment/notify/[provider]
  → Webhook 处理支付事件
  → 更新订单状态
```

**配置来源**: `config` 表
- `stripe_secret_key`, `stripe_publishable_key`
- `paypal_client_id`, `paypal_client_secret`
- `creem_api_key`

### 积分系统设计

**积分模型**: `src/shared/models/credit.ts`

**积分类型**:
```typescript
CreditTransactionType: 'grant' | 'consume'
CreditTransactionScene: 'payment' | 'subscription' | 'renewal' | 'gift' | 'award'
```

**积分过期逻辑**:
- 从 `Order.creditsValidDays` 读取有效期
- 订阅积分过期时间 = `subscription.currentPeriodEnd`
- `null` 表示永不过期

**积分消耗**:
- 在 AI 任务创建前验证 (`models/credit.ts` 的 `getUserCredits()`)
- 任务完成后扣除 (调用 `consumeCredits()`)

### 国际化系统 (next-intl)

**配置文件**: `src/core/i18n/config.ts` + `src/core/i18n/request.ts`

**支持语言**: `['en', 'zh']`

**路由模式**: `localePrefix: 'always'` (URL 中始终显示 `/en/` 或 `/zh/`)

**翻译文件位置**: `src/config/locale/messages/[locale]/`

**命名空间组织**:
```
common          # 通用文本
landing         # 首页
pricing         # 定价页面
settings/*      # 设置页面 (profile, billing, apikeys, etc.)
admin/*         # 管理后台
ai/*            # AI 功能
activity/*      # 用户活动
```

**使用方式**:
```typescript
// 客户端组件
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')

// 服务端组件/API 路由
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')
```

### RBAC 权限系统

**内置角色**: `super_admin`, `admin`, `editor`, `viewer`

**权限关系**:
```
User ←→ UserRole ←→ Role
                     ↓
              RolePermission ←→ Permission
```

**权限检查**:
```typescript
// 在 API 路由中
import { checkPermission } from '@/core/rbac/permission'

const hasPermission = await checkPermission(
  user.id,
  'permission_code'
)

if (!hasPermission) {
  return respErr('no permission')
}
```

**初始化脚本**:
- `scripts/init-rbac.ts` - 创建默认角色和权限
- `scripts/assign-role.ts` - 为用户分配角色

## API 响应标准化

**工具函数**: `src/shared/lib/resp.ts`

```typescript
// 成功响应
respData(data)  → { code: 0, message: 'ok', data }

// 错误响应
respErr(message)  → { code: -1, message }

// 自定义响应
respJson(code, message, data?)
```

**在 API 路由中的使用**:
```typescript
export async function POST(req: Request) {
  const user = await getUserInfo()
  if (!user) {
    return respErr('no auth, please sign in')
  }

  // 业务逻辑...

  return respData({ result: 'success' })
}
```

## 环境变量配置

**必需环境变量** (参考 `.env.example`):
```bash
# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Your App Name"

# 数据库
DATABASE_URL="postgresql://..."
DATABASE_PROVIDER="postgresql"  # postgresql | mysql | sqlite | turso
DB_SINGLETON_ENABLED="true"     # true (服务器) | false (无服务器)

# 认证密钥 (生成方式: openssl rand -base64 32)
AUTH_SECRET="your-secret-key"

# AI 提供商 (可选)
ARK_API_KEY=""                  # v0 AI Dream Maker

# Supabase (可选)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

**配置优先级**:
1. 环境变量 (`.env.local`)
2. 数据库 `config` 表 (运行时覆盖)

## 工具脚本使用

### 创建用户
```bash
npx tsx scripts/create-user.ts
```

### 设置配置项
```bash
npx tsx scripts/config-set.ts
```

### 数据库迁移工具
```bash
# Supabase 迁移
npx tsx scripts/migrate-supabase.ts
```

### 职业案例数据初始化
```bash
npx tsx scripts/create-table-showcase.ts      # 创建表
npx tsx scripts/seed-showcases.ts             # 导入数据
npx tsx scripts/generate-career-images-and-seed.ts  # 生成图片和数据
```

## 部署注意事项

### Vercel 部署
- 确保设置所有必需的环境变量
- `DB_SINGLETON_ENABLED=false` (使用无服务器模式)
- 数据库建议使用 Vercel Postgres / Neon / PlanetScale

### Cloudflare Workers 部署
```bash
# 构建并预览
pnpm cf:preview

# 部署到生产环境
pnpm cf:deploy

# 生成环境类型定义
pnpm cf:typegen
```

- 使用 Hyperdrive 连接数据库
- 配置 `wrangler.toml` 中的环境变量

### 自托管 (VPS/Docker)
- 设置 `DB_SINGLETON_ENABLED=true`
- 使用传统 PostgreSQL/MySQL 数据库
- 运行 `pnpm build && pnpm start`

## 开发最佳实践

### 添加新的 AI 提供商
1. 在 `src/extensions/ai/providers/` 创建新提供商类
2. 实现 `AIProvider` 接口
3. 在 `src/extensions/ai/manager.ts` 中注册
4. 在 `config` 表添加 API 密钥配置

### 添加新的支付提供商
1. 在 `src/extensions/payment/providers/` 创建新提供商类
2. 实现 `PaymentProvider` 接口 (包含 Webhook 处理)
3. 在 `src/extensions/payment/manager.ts` 中注册
4. 创建 `/api/payment/notify/[provider]/route.ts` 处理回调

### 添加新的数据模型
1. 在 `src/config/db/schema.ts` 定义表结构
2. 运行 `pnpm db:generate` 生成迁移
3. 在 `src/shared/models/` 创建对应的模型文件
4. 在 `src/shared/services/` 创建服务层函数

### 添加新的 API 端点
1. 在 `src/app/api/` 创建路由文件
2. 使用 `getUserInfo()` 验证用户身份
3. 使用 `respData()` / `respErr()` 返回标准化响应
4. 必要时使用 `checkPermission()` 验证权限

### 添加新的翻译
1. 在 `src/config/locale/messages/en/` 和 `zh/` 添加 JSON 文件
2. 在 `src/core/i18n/config.ts` 的 `localeMessagesPaths` 注册命名空间
3. 使用 `useTranslations('namespace')` 访问翻译

## 故障排查

### 数据库连接问题
- 检查 `DATABASE_URL` 是否正确
- 检查 `DATABASE_PROVIDER` 与实际数据库类型是否匹配
- 无服务器环境: `DB_SINGLETON_ENABLED=false`
- Cloudflare Workers: 确保配置了 Hyperdrive

### Better Auth 初始化失败
- 检查 `AUTH_SECRET` 是否设置
- 确保数据库表已创建 (运行 `pnpm db:push`)
- OAuth 凭证: 在 `config` 表中设置 `google_client_id` 等

### AI 功能不可用
- 检查 `config` 表中的 API 密钥 (`kie_api_key`, `replicate_api_token`)
- 确认提供商服务可用
- 查看 `aiTask` 表中的错误信息

### 支付流程异常
- 检查 `config` 表中的支付凭证
- 确认 Webhook URL 已在支付平台配置
- 查看 `order` 表中的 `checkoutResult` 字段

### 翻译文件未加载
- 确认文件路径正确: `src/config/locale/messages/[locale]/[namespace].json`
- 检查命名空间是否在 `localeMessagesPaths` 中注册
- 重启开发服务器

## 相关文档

- [ShipAny 官方文档](https://shipany.ai/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team)
- [Better Auth 文档](https://www.better-auth.com)
- [next-intl 文档](https://next-intl-docs.vercel.app)
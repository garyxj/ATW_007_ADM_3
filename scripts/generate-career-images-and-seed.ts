import fs from 'fs'
import path from 'path'
import { createOrUpdateShowcase } from '@/shared/models/showcase'

type CareerSpec = {
  slug: string
  zh: { title: string; summary: string; responsibilities: string; significance: string; how: string }
  en: { title: string; summary: string; responsibilities: string; significance: string; how: string }
}

const careers: CareerSpec[] = [
  {
    slug: 'software-engineer-kids-chibi',
    zh: {
      title: '软件工程师',
      summary:
        '用代码构建数字产品与服务，推动产业数字化与智能化进程，并为大众创造更便捷与丰富的生活体验。\n软件工程师需要兼顾技术实现与用户体验，注重稳定性、安全性与可维护性。',
      responsibilities:
        '• 需求分析与可行性评估\n• 系统设计（架构、模块与接口）\n• 编码实现与代码评审\n• 自动化测试与质量保障\n• 部署与运维监控\n• 性能优化与安全加固\n• 团队协作与持续迭代',
      significance:
        '• 赋能行业数字化与智能化\n• 降本增效，提升社会运行效率\n• 开源协作促进技术创新生态\n• 以软件为载体推动文化与教育普及',
      how:
        '• 夯实编程与数据结构基础\n• 掌握工程实践（Git、测试、部署、CI/CD）\n• 参与开源与代码评审，提升协作能力\n• 构建真实项目与作品集\n• 持续学习框架与云原生技术',
    },
    en: {
      title: 'Software Engineer',
      summary:
        "Build digital products and services with code; drive digital transformation and enrich everyday life.\nEngineers balance implementation with UX, reliability, security and maintainability.",
      responsibilities:
        '• Requirements analysis & feasibility\n• System architecture, modules & APIs\n• Implementation & code reviews\n• Automated testing & QA\n• Deployment & operations monitoring\n• Performance tuning & security hardening\n• Team collaboration & iterative delivery',
      significance:
        '• Empower industry digitalization & intelligence\n• Reduce cost and improve efficiency\n• Open‑source collaboration accelerates innovation\n• Software spreads culture and education at scale',
      how:
        '• Solid programming & data structures\n• Engineering practices (Git, testing, deployment, CI/CD)\n• Join open‑source & reviews to learn collaboration\n• Build real projects & portfolio\n• Keep learning frameworks & cloud‑native tech',
    },
  },
  {
    slug: 'engineer-kids-chibi',
    zh: {
      title: '工程师',
      summary: '用科学与技术解决问题、设计与优化系统或产品，推动社会生产力与创新发展。',
      responsibilities: '方案设计、研发试验、测试与优化、质量控制、协作交付。',
      significance: '以工程实践驱动产业升级与基础设施建设，提升生活品质与效率。',
      how: '动手做实验与小制作；夯实数学和物理基础；参与科技社团与竞赛；学习工程方法论。',
    },
    en: {
      title: 'Engineer',
      summary: 'Solves problems with science and technology, designs and optimizes systems or products to drive innovation.',
      responsibilities: 'Design, R&D experiments, testing & optimization, quality control, collaborative delivery.',
      significance: 'Engineering practice upgrades industries & infrastructure, improving life quality and efficiency.',
      how: 'Hands‑on experiments; solid math & physics; STEM clubs & competitions; engineering methodology.',
    },
  },
  {
    slug: 'doctor-kids-chibi',
    zh: {
      title: '医生',
      summary: '诊治疾病、守护生命健康，提升人群健康水平并减轻疾病负担。\n强调医德与规范，重视循证医学与多学科协作。',
      responsibilities: '• 问诊与体格检查\n• 诊断与制定治疗方案\n• 手术/处置与随访\n• 预防与健康教育\n• 多学科协同救治',
      significance: '• 保障公共健康与医疗服务质量\n• 提升社会福祉与生命质量\n• 推动医学科研与临床转化',
      how: '• 夯实生物与化学基础\n• 培养同理心与耐心\n• 志愿服务与健康科普\n• 持续专业学习与规范培训',
    },
    en: {
      title: 'Doctor',
      summary: 'Diagnoses and treats illnesses, protects public health and reduces disease burden.\nEmphasizes ethics, evidence‑based medicine and multidisciplinary collaboration.',
      responsibilities: '• Consultation & physical exam\n• Diagnosis & treatment planning\n• Procedures/surgery & follow‑up\n• Prevention & health education\n• Multidisciplinary care',
      significance: '• Safeguards public health & service quality\n• Improves wellbeing & life quality\n• Advances medical research & clinical translation',
      how: '• Strong biology & chemistry\n• Empathy & patience\n• Volunteering & outreach\n• Continuous learning & standardized training',
    },
  },
  {
    slug: 'police-officer-kids-chibi',
    zh: {
      title: '警察',
      summary: '维护社会治安与公共安全，增强公民安全感。\n重视依法履职与文明执法，强调公众沟通。',
      responsibilities: '• 巡逻与秩序维护\n• 警情处置与应急响应\n• 案件调查与取证\n• 社区宣教与安全培训',
      significance: '• 守护法治与社会秩序\n• 保障人民安全与稳定\n• 建设互信的社区关系',
      how: '• 强化体能与纪律意识\n• 学习法律与安全知识\n• 培养责任心与团队协作\n• 参与社区服务',
    },
    en: {
      title: 'Police Officer',
      summary: 'Maintains public order and safety; strengthens community trust.\nHighlights lawful conduct, professionalism and public communication.',
      responsibilities: '• Patrol & order maintenance\n• Incident response & emergency handling\n• Investigations & evidence collection\n• Community outreach & safety training',
      significance: '• Safeguards rule of law & order\n• Protects citizens and stability\n• Builds trusted community relations',
      how: '• Physical fitness & discipline\n• Law & safety basics\n• Responsibility & teamwork\n• Community service',
    },
  },
  {
    slug: 'scientist-kids-chibi',
    zh: {
      title: '科学家',
      summary: '探索自然规律、发现新知，推动科技与社会进步。\n强调科学精神与严谨求证。',
      responsibilities: '• 提出科学问题与假设\n• 设计实验并收集数据\n• 分析与发表成果\n• 学术交流与合作',
      significance: '• 拓展人类认知边界\n• 促进技术创新与应用\n• 培育科学素养',
      how: '• 保持好奇与求证\n• 阅读科普并动手做实验\n• 参与科普活动与竞赛',
    },
    en: {
      title: 'Scientist',
      summary: 'Explores laws of nature and discovers knowledge to advance society.\nEmphasizes scientific spirit and rigorous verification.',
      responsibilities: '• Pose questions & hypotheses\n• Design experiments & collect data\n• Analyze, publish & share\n• Academic exchange & collaboration',
      significance: '• Expands human knowledge\n• Drives innovation & application\n• Cultivates scientific literacy',
      how: '• Curiosity & verification\n• Read & do experiments\n• Science fairs & competitions',
    },
  },
  {
    slug: 'teacher-kids-chibi',
    zh: {
      title: '教师',
      summary: '传授知识、启发思维与塑造品格，影响一代人的成长。\n重视因材施教与终身学习。',
      responsibilities: '• 备课授课与课堂组织\n• 学业评估与反馈\n• 因材施教与个性化指导\n• 家校沟通与成长支持',
      significance: '• 提升社会文明与教育质量\n• 促进个体成长与社会进步\n• 传播知识与价值观',
      how: '• 热爱阅读与分享\n• 提升表达与组织能力\n• 参与公益辅导与社团活动\n• 终身学习与专业发展',
    },
    en: {
      title: 'Teacher',
      summary: 'Teaches knowledge, inspires thinking and shapes character.\nValues personalized teaching and lifelong learning.',
      responsibilities: '• Lesson planning & classroom organization\n• Assessment & feedback\n• Personalized guidance\n• School–home communication & support',
      significance: '• Shapes future generations\n• Promotes social progress\n• Spreads knowledge & values',
      how: '• Reading & sharing\n• Communication & organization skills\n• Tutoring & clubs\n• Lifelong learning & professional growth',
    },
  },
  {
    slug: 'nurse-kids-chibi',
    zh: {
      title: '护士',
      summary: '为病患提供护理与关怀，提升医疗服务质量。\n强调人文关怀与安全规范。',
      responsibilities: '• 护理评估与照护\n• 健康宣教与用药指导\n• 病患沟通与心理支持\n• 安全与规范执行',
      significance: '• 守护患者身心并促进康复\n• 提升医院服务品质\n• 促进健康与福祉',
      how: '• 培养同理心与耐心\n• 学习生理与健康知识\n• 志愿护理与社区服务\n• 持续培训与资格提升',
    },
    en: {
      title: 'Nurse',
      summary: 'Provides care and support to patients and improves healthcare quality.\nEmphasizes humanistic care and safety standards.',
      responsibilities: '• Nursing assessment & care\n• Health education & medication guidance\n• Communication & mental support\n• Safety & standards compliance',
      significance: '• Protects patients’ wellbeing & recovery\n• Improves hospital service quality\n• Promotes public health',
      how: '• Empathy & patience\n• Physiology & health knowledge\n• Volunteering & community service\n• Ongoing training & qualifications',
    },
  },
  {
    slug: 'lawyer-kids-chibi',
    zh: {
      title: '律师',
      summary: '运用法律维护公平与正义，保障法治秩序。\n重视职业伦理与合规。',
      responsibilities: '• 法律咨询与合规建议\n• 诉讼代理与证据整理\n• 合同起草与审查\n• 普法宣传与培训',
      significance: '• 守护社会公平正义与法治文明\n• 保障商业与公共秩序\n• 促进公民法治意识',
      how: '• 培养逻辑思维与表达\n• 学习法治与合规常识\n• 参与辩论与模拟法庭\n• 保持独立与专业精神',
    },
    en: {
      title: 'Lawyer',
      summary: 'Uses law to protect fairness and justice; ensures rule of law.\nValues ethics and compliance.',
      responsibilities: '• Legal consultation & compliance\n• Litigation & evidence preparation\n• Contract drafting & review\n• Legal education & training',
      significance: '• Ensures justice and rule of law\n• Safeguards business & public order\n• Promotes legal literacy',
      how: '• Logic & communication\n• Legal & compliance basics\n• Debate & mock trials\n• Independent & professional mindset',
    },
  },
  {
    slug: 'pilot-kids-chibi',
    zh: {
      title: '飞行员',
      summary: '驾驶航空器并保障航班安全，连接世界。\n强调安全规范与团队协作。',
      responsibilities: '• 飞行操作与检查\n• 航线规划与导航\n• 应急处置与沟通\n• 机组协作与流程执行',
      significance: '• 促进全球交流与经济发展\n• 提升交通效率与安全\n• 推动航空科技与人才培养',
      how: '• 保持健康与纪律\n• 学习科学与英语\n• 参与航模与航空科普活动\n• 严格训练与资质提升',
    },
    en: {
      title: 'Pilot',
      summary: 'Operates aircraft and ensures flight safety; connects the world.\nEmphasizes safety standards and teamwork.',
      responsibilities: '• Flight operations & checks\n• Route planning & navigation\n• Emergency handling & communication\n• Crew teamwork & procedures',
      significance: '• Fosters global communication & growth\n• Improves efficiency & safety\n• Advances aviation tech & talent',
      how: '• Health & discipline\n• Science & English\n• Aeromodelling & outreach\n• Rigorous training & qualifications',
    },
  },
  {
    slug: 'chef-kids-chibi',
    zh: {
      title: '厨师',
      summary: '用美食服务大众，提升生活品质与饮食文化。\n强调营养均衡与食品安全。',
      responsibilities: '• 食材处理与存储\n• 菜品设计与烹饪\n• 厨房管理与卫生\n• 食品安全与质量控制',
      significance: '• 丰富文化生活\n• 推动健康饮食\n• 促进餐饮服务品质',
      how: '• 练习烹饪与搭配\n• 了解营养与卫生\n• 参加兴趣班与实践活动\n• 培养审美与创新',
    },
    en: {
      title: 'Chef',
      summary: 'Serves people with delicious food; enhances life quality and food culture.\nHighlights nutrition balance and food safety.',
      responsibilities: '• Ingredient handling & storage\n• Recipe design & cooking\n• Kitchen management & hygiene\n• Food safety & quality control',
      significance: '• Enriches culture\n• Promotes healthy diet\n• Improves service quality',
      how: '• Cooking & pairing\n• Nutrition & hygiene\n• Classes & practice\n• Aesthetics & innovation',
    },
  },
  {
    slug: 'artist-kids-chibi',
    zh: {
      title: '艺术家',
      summary: '用艺术表达情感与审美，丰富文化生活。\n强调原创性与跨界合作。',
      responsibilities: '• 艺术创作与研究\n• 展演与策展\n• 交流与跨界合作\n• 艺术教育与推广',
      significance: '• 提升审美与创造力\n• 活跃社会文化\n• 促进多元表达与包容',
      how: '• 练习绘画/音乐/舞蹈\n• 参加展演与社团\n• 培养审美与观察力\n• 与不同领域合作',
    },
    en: {
      title: 'Artist',
      summary: 'Expresses emotions and aesthetics through art; enriches culture.\nValues originality and cross‑disciplinary collaboration.',
      responsibilities: '• Artistic creation & research\n• Exhibitions & curation\n• Communication & collaboration\n• Arts education & outreach',
      significance: '• Boosts aesthetics & creativity\n• Enlivens cultural life\n• Promotes diversity & inclusion',
      how: '• Practice painting/music/dance\n• Showcases & clubs\n• Aesthetics & observation\n• Cross‑disciplinary work',
    },
  },
  {
    slug: 'firefighter-kids-chibi',
    zh: {
      title: '消防员',
      summary: '应对火灾与灾害救援，守护生命与财产安全。',
      responsibilities: '灭火救援、隐患排查、安全宣传、应急演练。',
      significance: '提升社会防灾减灾能力与公共安全水平。',
      how: '加强体能训练；学习安全与急救常识；参与户外活动与团队协作训练。',
    },
    en: {
      title: 'Firefighter',
      summary: 'Responds to fires and disasters to protect lives and property.',
      responsibilities: 'Firefighting & rescue, hazard inspection, safety education, emergency drills.',
      significance: 'Improves disaster resilience and public safety.',
      how: 'Physical fitness; safety & first aid basics; outdoor teamwork training.',
    },
  },
]

/**
 * 使用 Ark Seedream 生成 PNG 图片（儿童Q版、照片级拟人）
 */
async function generatePngImage(prompt: string, size = '2048x2048'): Promise<Buffer> {
  const apiKey = process.env.ARK_API_KEY || ''
  if (!apiKey) throw new Error('ARK_API_KEY is missing')
  const resp = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'doubao-seedream-4-5-251128', prompt, size, watermark: false }),
  })
  const text = await resp.text()
  if (!resp.ok) throw new Error(text)
  const data = JSON.parse(text)
  const url: string | undefined = data?.data?.[0]?.url
  if (!url) throw new Error('No image url returned')
  const imgResp = await fetch(url)
  const arrayBuf = await imgResp.arrayBuffer()
  return Buffer.from(arrayBuf)
}

/**
 * 为单个职业生成图片并写入数据库（中英文）
 */
async function processCareer(c: CareerSpec) {
  const outDir = path.join(process.cwd(), 'public', 'images', 'showcases')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${c.slug}.png`)

  const basePrompt = `photo-realistic chibi child portrait, ${c.en.title}, clean studio background, soft lighting, glossy eyes, delicate skin texture, high quality, PNG, 1024x1024, warm tone`
  const pngBuf = await generatePngImage(basePrompt, '2048x2048')
  fs.writeFileSync(outPath, pngBuf)

  const imageUrl = `/images/showcases/${c.slug}.png`

  await createOrUpdateShowcase({
    slug: c.slug,
    locale: 'zh',
    title: c.zh.title,
    subtitle: '儿童Q版职业形象',
    imageUrl,
    summary: c.zh.summary,
    responsibilities: c.zh.responsibilities,
    significance: c.zh.significance,
    howToBecome: c.zh.how,
    status: 'active',
  })

  await createOrUpdateShowcase({
    slug: c.slug,
    locale: 'en',
    title: c.en.title,
    subtitle: 'Chibi Kids Career Portrait',
    imageUrl,
    summary: c.en.summary,
    responsibilities: c.en.responsibilities,
    significance: c.en.significance,
    howToBecome: c.en.how,
    status: 'active',
  })
}

/**
 * 主流程：批量生成职业图片并批量接入数据库
 */
async function main() {
  for (const c of careers) {
    try {
      await processCareer(c)
      console.log('OK:', c.slug)
    } catch (e: any) {
      console.error('FAIL:', c.slug, e?.message)
    }
  }
  console.log('All done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

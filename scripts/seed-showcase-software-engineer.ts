import { createOrUpdateShowcase } from '@/shared/models/showcase'

/**
 * 生成并写入“软件工程师（儿童Q版）”职业案例（中英文）
 */
async function main() {
  const slug = 'software-engineer-kids-chibi'
  const imageUrl = '/images/showcases/software-engineer-child-chibi.svg'

  await createOrUpdateShowcase({
    slug,
    locale: 'zh',
    title: '软件工程师',
    subtitle: '用代码构建世界的创造者',
    imageUrl,
    summary:
      '软件工程师以代码为工具，构建数字产品与服务，推动产业数字化与智能化进程，并为大众创造更便捷与丰富的生活体验。',
    responsibilities:
      '需求分析、系统设计、编码实现、测试与迭代、部署与运维、与团队协作完成产品交付。',
    significance:
      '软件系统是现代社会的基础设施：教育、医疗、交通、金融等领域均依赖稳定可靠的软件；开源与社区加速创新，形成可持续生态。',
    howToBecome:
      '循序渐进学习编程与数据结构；掌握工程实践（Git、测试、部署）；做真实项目积累作品集；参与开源社区与协作；持续学习新技术与框架。',
    status: 'active',
  })

  await createOrUpdateShowcase({
    slug,
    locale: 'en',
    title: 'Software Engineer',
    subtitle: 'Creators who build the digital world with code',
    imageUrl,
    summary:
      "Software engineers build digital products and services with code, driving digital transformation, improving efficiency, and enriching people's lives.",
    responsibilities:
      'Requirements analysis, system design, implementation, testing & iteration, deployment & operations, teamwork for product delivery.',
    significance:
      'Software systems underpin modern society—education, healthcare, transportation, finance rely on reliable software; open-source and communities accelerate innovation.',
    howToBecome:
      'Learn programming & data structures; master engineering practices (Git, testing, deployment); build real projects and a portfolio; participate in open-source; keep learning.',
    status: 'active',
  })

  console.log('Seeded showcase: software-engineer-kids-chibi (zh/en)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

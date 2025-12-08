import { createOrUpdateShowcase } from '@/shared/models/showcase';

type Career = {
  slug: string;
  zh: { title: string; summary: string; responsibilities: string; significance: string; how: string };
  en: { title: string; summary: string; responsibilities: string; significance: string; how: string };
  image?: string;
};

const careers: Career[] = [
  {
    slug: 'police-officer',
    image: '/images/careers/police.svg',
    zh: {
      title: '警察',
      summary: '维护社会治安，保护人民安全的职业。',
      responsibilities: '巡逻、处置警情、调查案件、宣传安全知识等。',
      significance: '保障社会秩序与公共安全，增强公民安全感。',
      how: '培养规则意识与责任心；学习法治与安全知识；积极参加体育锻炼，提高体能与协作能力。',
    },
    en: {
      title: 'Police Officer',
      summary: 'A profession that maintains public order and keeps people safe.',
      responsibilities: 'Patrol, respond to incidents, investigate cases, promote safety education.',
      significance: 'Safeguards social order and public security, strengthens community trust.',
      how: 'Develop discipline and responsibility; learn law & safety; join sports to improve fitness and teamwork.',
    },
  },
  {
    slug: 'doctor',
    image: '/images/careers/doctor.svg',
    zh: {
      title: '医生',
      summary: '诊治疾病、守护生命健康的职业。',
      responsibilities: '问诊、诊断、治疗、健康科普与预防。',
      significance: '提升人群健康水平，减轻疾病负担。',
      how: '培养耐心与同理心；打好生物与化学基础；参与志愿与科普活动，了解医学伦理。',
    },
    en: {
      title: 'Doctor',
      summary: 'Treats illnesses and protects human health.',
      responsibilities: 'Consultation, diagnosis, treatment, health education and prevention.',
      significance: 'Improves public health and reduces disease burden.',
      how: 'Develop patience and empathy; build strong biology/chemistry; join volunteering and learn medical ethics.',
    },
  },
  {
    slug: 'teacher',
    image: '/images/careers/teacher.svg',
    zh: {
      title: '教师',
      summary: '传授知识、启发思维与塑造品格的职业。',
      responsibilities: '备课授课、评估学习、因材施教、沟通家校。',
      significance: '影响一代人的成长与社会的文明程度。',
      how: '热爱阅读与分享；练习表达与组织能力；参加公益辅导与社团活动。',
    },
    en: {
      title: 'Teacher',
      summary: 'Teaches knowledge, inspires thinking and shapes character.',
      responsibilities: 'Lesson planning, teaching, assessment, personalized guidance, school–home communication.',
      significance: 'Shapes future generations and promotes social civilization.',
      how: 'Love reading and sharing; practice communication; join tutoring and campus clubs.',
    },
  },
  {
    slug: 'firefighter',
    image: '/images/careers/firefighter.svg',
    zh: {
      title: '消防员',
      summary: '应对火灾与灾害救援的职业。',
      responsibilities: '灭火、救援、隐患排查、宣传安全。',
      significance: '守护生命与财产安全，提高社会防灾减灾能力。',
      how: '加强体能训练；学习安全常识；参加户外活动，锻炼勇敢与团队协作。',
    },
    en: {
      title: 'Firefighter',
      summary: 'Responds to fires and rescues in disasters.',
      responsibilities: 'Firefighting, rescue, hazard inspection, safety education.',
      significance: 'Protects lives and property, improves disaster resilience.',
      how: 'Strengthen physical fitness; learn safety basics; outdoor activities to build courage and teamwork.',
    },
  },
  {
    slug: 'engineer',
    image: '/images/careers/engineer.svg',
    zh: {
      title: '工程师',
      summary: '用科学与技术解决问题、创造价值的职业。',
      responsibilities: '设计、研发、测试与优化系统或产品。',
      significance: '推动社会生产力与创新发展。',
      how: '动手做实验与小制作；打好数学与物理基础；参与科技社团与竞赛。',
    },
    en: {
      title: 'Engineer',
      summary: 'Applies science and technology to solve problems and create value.',
      responsibilities: 'Design, R&D, testing and optimization.',
      significance: 'Drives productivity and innovation.',
      how: 'Hands-on experiments; build solid math/physics; join STEM clubs and competitions.',
    },
  },
  {
    slug: 'scientist',
    image: '/images/careers/scientist.svg',
    zh: {
      title: '科学家',
      summary: '探索自然规律、发现新知的职业。',
      responsibilities: '提出假设、实验验证、论文发表、学术交流。',
      significance: '拓展人类认知边界，促进科技与社会进步。',
      how: '保持好奇与求证精神；阅读科普与做实验；参加科学活动与展览。',
    },
    en: {
      title: 'Scientist',
      summary: 'Explores the laws of nature and discovers new knowledge.',
      responsibilities: 'Hypotheses, experiments, publications, academic exchange.',
      significance: 'Expands human knowledge and advances society.',
      how: 'Stay curious; read science books and experiment; attend science fairs and labs.',
    },
  },
  {
    slug: 'pilot',
    image: '/images/careers/pilot.svg',
    zh: {
      title: '飞行员',
      summary: '驾驶航空器、保障航班安全的职业。',
      responsibilities: '飞行操作、航线规划、应急处置与机组协作。',
      significance: '连接世界、促进交流与经济发展。',
      how: '保持身体健康；学习英语与科学知识；参与航模与航空科普活动。',
    },
    en: {
      title: 'Pilot',
      summary: 'Operates aircraft and ensures flight safety.',
      responsibilities: 'Flight operation, route planning, emergency handling, crew teamwork.',
      significance: 'Connects the world and fosters communication and economy.',
      how: 'Stay healthy; learn English and science; join aeromodelling and aviation activities.',
    },
  },
  {
    slug: 'nurse',
    image: '/images/careers/nurse.svg',
    zh: {
      title: '护士',
      summary: '为病患提供护理与关怀的职业。',
      responsibilities: '护理操作、健康宣教、病患沟通与心理支持。',
      significance: '提升医疗服务质量，守护患者身心。',
      how: '培养耐心与同理心；学习生理与健康知识；参与志愿护理活动。',
    },
    en: {
      title: 'Nurse',
      summary: 'Provides care and support to patients.',
      responsibilities: 'Nursing care, health education, patient communication and mental support.',
      significance: 'Improves quality of healthcare and protects patients.',
      how: 'Develop patience and empathy; learn physiology & health; join volunteer care.',
    },
  },
  {
    slug: 'software-engineer',
    image: '/images/careers/software-engineer.svg',
    zh: {
      title: '软件工程师',
      summary: '用代码构建软件与数字产品的职业。',
      responsibilities: '需求分析、编码实现、测试与迭代优化。',
      significance: '驱动数字化与智能化转型。',
      how: '学习编程与数据结构；做小项目；参与开源与编程社团。',
    },
    en: {
      title: 'Software Engineer',
      summary: 'Builds software and digital products with code.',
      responsibilities: 'Requirements, coding, testing and iterative optimization.',
      significance: 'Drives digital and intelligent transformation.',
      how: 'Learn coding & data structures; build side projects; join open source/community.',
    },
  },
  {
    slug: 'artist',
    image: '/images/careers/artist.svg',
    zh: {
      title: '艺术家',
      summary: '用艺术作品表达情感与审美的职业。',
      responsibilities: '创作、展览、交流与跨界合作。',
      significance: '丰富文化生活，提升审美与创造力。',
      how: '练习绘画/音乐/舞蹈；参加艺术社团与展演；培养审美与观察力。',
    },
    en: {
      title: 'Artist',
      summary: 'Expresses emotions and aesthetics through art.',
      responsibilities: 'Creation, exhibitions, communication and collaboration.',
      significance: 'Enriches culture and boosts creativity and aesthetics.',
      how: 'Practice arts; join clubs and showcases; cultivate aesthetics and observation.',
    },
  },
  {
    slug: 'lawyer',
    image: '/images/careers/lawyer.svg',
    zh: {
      title: '律师',
      summary: '运用法律维护公平与正义的职业。',
      responsibilities: '法律咨询、诉讼代理、合同审核与普法宣传。',
      significance: '保障社会公平正义与法治秩序。',
      how: '培养逻辑与表达能力；学习法治常识；参加辩论与模拟法庭活动。',
    },
    en: {
      title: 'Lawyer',
      summary: 'Uses law to protect fairness and justice.',
      responsibilities: 'Legal consultation, litigation, contract review, legal education.',
      significance: 'Ensures justice and rule of law.',
      how: 'Develop logic and communication; learn legal basics; join debate/mock trial.',
    },
  },
  {
    slug: 'chef',
    image: '/images/careers/chef.svg',
    zh: {
      title: '厨师',
      summary: '用美食服务大众的职业。',
      responsibilities: '食材处理、烹饪、菜品设计与食品安全。',
      significance: '提升生活品质与饮食文化。',
      how: '练习烹饪与搭配；了解营养与卫生；参加烹饪兴趣班。',
    },
    en: {
      title: 'Chef',
      summary: 'Serves people with delicious food.',
      responsibilities: 'Ingredient handling, cooking, recipe design, food safety.',
      significance: 'Improves life quality and food culture.',
      how: 'Practice cooking; learn nutrition and hygiene; join cooking classes.',
    },
  },
];

/**
 * 运行脚本：
 * npx tsx scripts/seed-showcases.ts
 * 将预设的 12 个职业案例写入数据库，生成中英文两套内容
 */
async function main() {
  for (const c of careers) {
    await createOrUpdateShowcase({
      slug: c.slug,
      locale: 'zh',
      title: c.zh.title,
      imageUrl: c.image,
      summary: c.zh.summary,
      responsibilities: c.zh.responsibilities,
      significance: c.zh.significance,
      howToBecome: c.zh.how,
      status: 'active',
    });
    await createOrUpdateShowcase({
      slug: c.slug,
      locale: 'en',
      title: c.en.title,
      imageUrl: c.image,
      summary: c.en.summary,
      responsibilities: c.en.responsibilities,
      significance: c.en.significance,
      howToBecome: c.en.how,
      status: 'active',
    });
  }
  console.log('Seeded career_showcase (zh/en)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export type CareerPreset = {
  id: string;
  nameZh: string;
  nameEn: string;
  shortZh: string;
  attire: string[];
  scene: string[];
  props: string[];
};

export const CAREER_PRESETS: Record<string, CareerPreset> = {
  astronaut: {
    id: "astronaut",
    nameZh: "宇航员",
    nameEn: "Astronaut",
    shortZh: "穿太空服，站在空间站",
    attire: ["spacesuit"],
    scene: ["space station", "Mars base", "spacecraft interior"],
    props: ["helmet", "mission patch"],
  },
  doctor: {
    id: "doctor",
    nameZh: "医生",
    nameEn: "Doctor",
    shortZh: "穿白大褂、挂听诊器",
    attire: ["white coat"],
    scene: ["hospital corridor", "clinic"],
    props: ["stethoscope", "ID badge"],
  },
  scientist: {
    id: "scientist",
    nameZh: "科学家",
    nameEn: "Scientist",
    shortZh: "在实验室穿实验服",
    attire: ["lab coat"],
    scene: ["laboratory", "research center"],
    props: ["test tubes", "notebook"],
  },
  pilot: {
    id: "pilot",
    nameZh: "飞行员",
    nameEn: "Pilot",
    shortZh: "穿飞行员制服，在驾驶舱",
    attire: ["pilot uniform"],
    scene: ["cockpit", "airport gate"],
    props: ["aviator sunglasses", "wings pin"],
  },
  chef: {
    id: "chef",
    nameZh: "厨师",
    nameEn: "Chef",
    shortZh: "穿厨师服，在专业厨房",
    attire: ["chef uniform"],
    scene: ["professional kitchen"],
    props: ["chef hat", "knife"],
  },
  artist: {
    id: "artist",
    nameZh: "艺术家",
    nameEn: "Artist",
    shortZh: "在画室拿画笔",
    attire: ["casual studio wear"],
    scene: ["art studio"],
    props: ["paintbrush", "palette"],
  },
  athlete: {
    id: "athlete",
    nameZh: "运动员",
    nameEn: "Athlete",
    shortZh: "穿运动装备，在运动场",
    attire: ["sportswear"],
    scene: ["stadium", "sports field"],
    props: ["medal"],
  },
  musician: {
    id: "musician",
    nameZh: "音乐家",
    nameEn: "Musician",
    shortZh: "在舞台上演奏乐器",
    attire: ["concert outfit"],
    scene: ["concert stage", "recording studio"],
    props: ["instrument"],
  },
  teacher: {
    id: "teacher",
    nameZh: "教师",
    nameEn: "Teacher",
    shortZh: "在明亮的教室教学",
    attire: ["smart casual"],
    scene: ["bright classroom"],
    props: ["books", "chalk"],
  },
  firefighter: {
    id: "firefighter",
    nameZh: "消防员",
    nameEn: "Firefighter",
    shortZh: "穿消防服，英勇形象",
    attire: ["firefighter suit"],
    scene: ["fire station"],
    props: ["helmet"],
  },
  police: {
    id: "police",
    nameZh: "警察",
    nameEn: "Police Officer",
    shortZh: "穿警服，端庄正气",
    attire: ["police uniform"],
    scene: ["police office"],
    props: ["badge"],
  },
  programmer: {
    id: "programmer",
    nameZh: "程序员",
    nameEn: "Programmer",
    shortZh: "在科技公司办公室编写代码",
    attire: ["business casual"],
    scene: ["tech company office"],
    props: ["laptop"],
  },
};

export function getCareerById(id?: string): CareerPreset | undefined {
  if (!id) return undefined;
  return CAREER_PRESETS[id];
}

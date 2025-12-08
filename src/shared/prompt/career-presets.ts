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
    shortZh: "Wearing a spacesuit, standing in a space station",
    attire: ["spacesuit"],
    scene: ["space station", "Mars base", "spacecraft interior"],
    props: ["helmet", "mission patch"],
  },
  doctor: {
    id: "doctor",
    nameZh: "医生",
    nameEn: "Doctor",
    shortZh: "Wearing a white coat with a stethoscope",
    attire: ["white coat"],
    scene: ["hospital corridor", "clinic"],
    props: ["stethoscope", "ID badge"],
  },
  scientist: {
    id: "scientist",
    nameZh: "科学家",
    nameEn: "Scientist",
    shortZh: "In a laboratory wearing a lab coat",
    attire: ["lab coat"],
    scene: ["laboratory", "research center"],
    props: ["test tubes", "notebook"],
  },
  pilot: {
    id: "pilot",
    nameZh: "飞行员",
    nameEn: "Pilot",
    shortZh: "Wearing a pilot uniform in the cockpit",
    attire: ["pilot uniform"],
    scene: ["cockpit", "airport gate"],
    props: ["aviator sunglasses", "wings pin"],
  },
  chef: {
    id: "chef",
    nameZh: "厨师",
    nameEn: "Chef",
    shortZh: "Wearing a chef uniform in a professional kitchen",
    attire: ["chef uniform"],
    scene: ["professional kitchen"],
    props: ["chef hat", "knife"],
  },
  artist: {
    id: "artist",
    nameZh: "艺术家",
    nameEn: "Artist",
    shortZh: "Holding a paintbrush in an art studio",
    attire: ["casual studio wear"],
    scene: ["art studio"],
    props: ["paintbrush", "palette"],
  },
  athlete: {
    id: "athlete",
    nameZh: "运动员",
    nameEn: "Athlete",
    shortZh: "In sportswear on a sports field",
    attire: ["sportswear"],
    scene: ["stadium", "sports field"],
    props: ["medal"],
  },
  musician: {
    id: "musician",
    nameZh: "音乐家",
    nameEn: "Musician",
    shortZh: "Performing on stage with an instrument",
    attire: ["concert outfit"],
    scene: ["concert stage", "recording studio"],
    props: ["instrument"],
  },
  teacher: {
    id: "teacher",
    nameZh: "教师",
    nameEn: "Teacher",
    shortZh: "Teaching in a bright classroom",
    attire: ["smart casual"],
    scene: ["bright classroom"],
    props: ["books", "chalk"],
  },
  firefighter: {
    id: "firefighter",
    nameZh: "消防员",
    nameEn: "Firefighter",
    shortZh: "Wearing firefighting gear, heroic stance",
    attire: ["firefighter suit"],
    scene: ["fire station"],
    props: ["helmet"],
  },
  police: {
    id: "police",
    nameZh: "警察",
    nameEn: "Police Officer",
    shortZh: "In police uniform, poised and professional",
    attire: ["police uniform"],
    scene: ["police office"],
    props: ["badge"],
  },
  programmer: {
    id: "programmer",
    nameZh: "程序员",
    nameEn: "Programmer",
    shortZh: "Coding in a tech company office",
    attire: ["business casual"],
    scene: ["tech company office"],
    props: ["laptop"],
  },
};

export function getCareerById(id?: string): CareerPreset | undefined {
  if (!id) return undefined;
  return CAREER_PRESETS[id];
}

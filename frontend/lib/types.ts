export type Application = {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string;
  description: string;
};

export type Bullet = { id: string; text: string };

export type Experience = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: Bullet[];
};

export type Project = {
  id: string;
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  bullets: Bullet[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: Bullet[];
};

export type SkillGroup = {
  id: string;
  category: string;
  skills: string;
};

export type Profile = {
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: SkillGroup[];
};

export type Workspace = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  order: number;
  created_at: string;
};

export type Section = {
  id: string;
  group_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  order: number;
  created_at: string;
};

export type Link = {
  id: string;
  section_id: string;
  label: string;
  url: string;
  icon: string | null;
  order: number;
  created_at: string;
};

export type SectionWithLinks = Section & { links: Link[] };
export type GroupWithSections = Group & { sections: SectionWithLinks[] };

export type Theme = "light" | "dark";

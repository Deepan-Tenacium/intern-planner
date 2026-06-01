export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface InternSkill {
  skill: Skill;
  proficiency: number;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "planning" | "completed";
  owner: string;
  start_date: string;
  end_date: string;
}

export interface Allocation {
  id: number;
  intern_id: number;
  project_id: number;
  hours_per_week: number;
  start_date: string;
  end_date: string;
}

export interface Intern {
  id: number;
  name: string;
  email: string;
  cohort_start: string;
  cohort_end: string;
  weekly_capacity_hours: number;
  status: "active" | "on_leave" | "finished";
  skills: InternSkill[];
}

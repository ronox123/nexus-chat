export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  chat_id: string;
  role: Role;
  content: string;
  model?: string | null;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  model: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface UserSettings {
  user_id: string;
  theme: string;
  default_model: string;
  system_prompt: string | null;
  send_on_enter: boolean;
}

export interface AIModel {
  id: string;
  label: string;
  description: string;
  provider: "openai" | "mock";
  badge?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o-mini",
    label: "Nexus Swift",
    description: "Fast, efficient — ideal for everyday conversations.",
    provider: "openai",
    badge: "Fast",
  },
  {
    id: "gpt-4o",
    label: "Nexus Pro",
    description: "Most capable — deep reasoning and rich answers.",
    provider: "openai",
    badge: "Pro",
  },
  {
    id: "gpt-4-turbo",
    label: "Nexus Reason",
    description: "Balanced precision for complex, multi-step tasks.",
    provider: "openai",
  },
];

export function getModel(id: string): AIModel {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}

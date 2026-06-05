export interface ScreenplayMeta {
  title: string;
  author: string;
  genre: string;
  logline: string;
  source_title: string;
  created_at: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  age: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
}

export interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT' | 'INT/EXT';
  description: string;
}

export interface SceneContent {
  type: 'action' | 'dialogue' | 'transition' | 'note';
  text: string;
  character_id?: string;
  parenthetical?: string;
}

export interface Scene {
  id: string;
  chapter_ref: number;
  heading: string;
  location_id: string;
  time_of_day: string;
  summary: string;
  content: SceneContent[];
}

export interface ActStructure {
  act: number;
  scene_ids: string[];
  summary: string;
}

export interface Screenplay {
  meta: ScreenplayMeta;
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  act_structure?: ActStructure[];
}

export interface Chapter {
  title: string;
  content: string;
  index: number;
}

export interface ConvertRequest {
  apiKey: string;
  baseURL: string;
  model: string;
  chapterText: string;
  existingCharacters: Character[];
  existingScenes: Scene[];
}

export interface ConvertResponse {
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
}

export interface ModelProvider {
  name: string;
  baseURL: string;
  models: string[];
  defaultModel: string;
}

export enum PipelineStage {
  IDLE = 'IDLE',
  SCRIPTING = 'SCRIPTING',
  VOICE_SYNTHESIS = 'VOICE_SYNTHESIS',
  MATH_VISUALS = 'MATH_VISUALS',
  AVATAR_SYNC = 'AVATAR_SYNC',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ScriptContent {
  intro: string;
  explanation: string;
  conclusion: string;
}

export interface ProjectData {
  id: string;
  topic: string;
  status: PipelineStage;
  progress: number; // 0 to 100
  script: ScriptContent | null;
  manimCode: string | null;
  videoUrl: string | null;
  lastUpdated: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  stage: PipelineStage;
}

export interface AuraState {
  currentProject: ProjectData | null;
  logs: LogEntry[];
  useMockApi: boolean;
  isProcessing: boolean;
  
  // Actions
  setTopic: (topic: string) => void;
  toggleMockApi: () => void;
  addLog: (message: string, type?: LogEntry['type'], stage?: PipelineStage) => void;
  updateProjectStatus: (status: PipelineStage, progress: number) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  resetProject: () => void;
}

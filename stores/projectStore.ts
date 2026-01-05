import { create } from 'zustand';
import { AuraState, LogEntry, PipelineStage, ProjectData } from '../types';

const INITIAL_PROJECT: ProjectData = {
  id: '',
  topic: '',
  status: PipelineStage.IDLE,
  progress: 0,
  script: null,
  manimCode: null,
  videoUrl: null,
  lastUpdated: Date.now(),
};

export const useProjectStore = create<AuraState>((set, get) => ({
  currentProject: { ...INITIAL_PROJECT },
  logs: [],
  useMockApi: true,
  isProcessing: false,

  setTopic: (topic: string) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject!,
        id: crypto.randomUUID(),
        topic,
        status: PipelineStage.IDLE,
        progress: 0,
      }
    }));
  },

  toggleMockApi: () => {
    set((state) => ({ useMockApi: !state.useMockApi }));
  },

  addLog: (message: string, type: LogEntry['type'] = 'info', stage: PipelineStage = PipelineStage.IDLE) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message,
      type,
      stage
    };
    set((state) => ({ logs: [newLog, ...state.logs] }));
  },

  updateProjectStatus: (status: PipelineStage, progress: number) => {
    set((state) => ({
      isProcessing: status !== PipelineStage.COMPLETED && status !== PipelineStage.ERROR && status !== PipelineStage.IDLE,
      currentProject: {
        ...state.currentProject!,
        status,
        progress,
        lastUpdated: Date.now(),
      }
    }));
  },

  updateProjectData: (data: Partial<ProjectData>) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject!,
        ...data,
      }
    }));
  },

  resetProject: () => {
    set({
      currentProject: { ...INITIAL_PROJECT },
      logs: [],
      isProcessing: false
    });
  }
}));
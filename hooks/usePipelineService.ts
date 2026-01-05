import { useCallback, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { PipelineStage } from '../types';
import { getMockData, simulateDelay } from '../services/mockPipeline';
import { generateLessonPlan } from '../services/geminiService';
import { startBackendPipeline, getBackendStatus } from '../services/api';

export const usePipelineService = () => {
  const { 
    currentProject, 
    useMockApi, 
    updateProjectStatus, 
    updateProjectData, 
    addLog,
    isProcessing
  } = useProjectStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const mapBackendStatusToStage = (backendStatus: string): PipelineStage => {
    switch (backendStatus) {
      case 'PENDING': return PipelineStage.IDLE;
      case 'GENERATING_SCRIPT': return PipelineStage.SCRIPTING;
      case 'SYNTHESIZING_AUDIO': return PipelineStage.VOICE_SYNTHESIS;
      case 'RENDERING_MATH': return PipelineStage.MATH_VISUALS;
      case 'COMPOSITING': return PipelineStage.AVATAR_SYNC;
      case 'COMPLETED': return PipelineStage.COMPLETED;
      case 'FAILED': return PipelineStage.ERROR;
      default: return PipelineStage.IDLE;
    }
  };

  const startPipeline = useCallback(async () => {
    if (!currentProject?.topic) return;

    // Reset abort controller
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      // --- MOCK MODE ---
      if (useMockApi) {
        // STAGE 1: SCRIPTING
        updateProjectStatus(PipelineStage.SCRIPTING, 10);
        addLog(`Initializing AI Agents for topic: "${currentProject.topic}"...`, 'info', PipelineStage.SCRIPTING);
        await simulateDelay(2000);
        
        const mock = getMockData(currentProject.topic);
        addLog("Mock Logic Agent: Script generated successfully.", 'success', PipelineStage.SCRIPTING);
        updateProjectData({ script: mock.script, manimCode: mock.manimCode });
        
        // STAGE 2: VOICE
        updateProjectStatus(PipelineStage.VOICE_SYNTHESIS, 35);
        addLog("Sending script to ElevenLabs (Turbo v2)...", 'info', PipelineStage.VOICE_SYNTHESIS);
        await simulateDelay(1500);
        addLog("Audio assets synthesized and cached.", 'success', PipelineStage.VOICE_SYNTHESIS);

        // STAGE 3: MATH
        updateProjectStatus(PipelineStage.MATH_VISUALS, 60);
        addLog("Spinning up Manim rendering container...", 'info', PipelineStage.MATH_VISUALS);
        await simulateDelay(2000);
        addLog("Scene rendering complete (1080p/60fps).", 'success', PipelineStage.MATH_VISUALS);

        // STAGE 4: AVATAR
        updateProjectStatus(PipelineStage.AVATAR_SYNC, 85);
        addLog("Syncing HeyGen avatar lip-sync...", 'info', PipelineStage.AVATAR_SYNC);
        await simulateDelay(1500);
        addLog("Avatar overlay composited.", 'success', PipelineStage.AVATAR_SYNC);

        // STAGE 5: COMPLETE
        updateProjectStatus(PipelineStage.COMPLETED, 100);
        updateProjectData({ videoUrl: mock.videoUrl });
        addLog("Pipeline completed. Video ready for review.", 'success', PipelineStage.COMPLETED);
        return;
      }

      // --- LIVE API (BACKEND) MODE ---
      addLog("Connecting to Aura Engine Backend (FastAPI)...", 'info', PipelineStage.IDLE);
      
      let taskId = "";
      try {
        const result = await startBackendPipeline(currentProject.topic);
        taskId = result.taskId;
        addLog(`Task initiated. ID: ${taskId}`, 'success', PipelineStage.SCRIPTING);
        updateProjectData({ id: taskId });
      } catch (err: any) {
        addLog(`Connection Failed: Ensure FastAPI is running on localhost:8000. ${err.message}`, 'error', PipelineStage.ERROR);
        
        // Fallback or retry suggestion
        addLog("Attempting client-side Gemini fallback...", 'warning', PipelineStage.SCRIPTING);
        try {
           const fallbackData = await generateLessonPlan(currentProject.topic);
           updateProjectData({ script: fallbackData.script, manimCode: fallbackData.manimCode });
           addLog("Client-side fallback successful (Script & Code only).", 'success', PipelineStage.SCRIPTING);
           updateProjectStatus(PipelineStage.COMPLETED, 100); // Partial completion
        } catch (fallbackErr: any) {
           addLog(`Fallback failed: ${fallbackErr.message}`, 'error', PipelineStage.ERROR);
           updateProjectStatus(PipelineStage.ERROR, 0);
        }
        return;
      }

      // Polling Loop
      let currentStage = PipelineStage.SCRIPTING;
      let isComplete = false;
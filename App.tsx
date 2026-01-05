import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  Mic, 
  User, 
  Settings, 
  Play, 
  Code as CodeIcon, 
  FileText, 
  Video, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from './stores/projectStore';
import { usePipelineService } from './hooks/usePipelineService';
import { PipelineStage } from './types';
import clsx from 'clsx';
// Note: In a real environment, we'd import KaTeX CSS here, but we did it in index.html

// --- COMPONENTS ---

const Sidebar = () => (
  <div className="w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-10">
    <div className="p-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
        <span className="text-white font-bold text-lg">A</span>
      </div>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
        Aura Math
      </span>
    </div>
    
    <nav className="flex-1 px-4 space-y-2 mt-4">
      {[
        { icon: LayoutDashboard, label: "Projects", active: true },
        { icon: Library, label: "Asset Library" },
        { icon: Mic, label: "Voice Profiles" },
        { icon: User, label: "Avatars" },
        { icon: Settings, label: "Settings" },
      ].map((item, idx) => (
        <button 
          key={idx}
          className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
            item.active 
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          )}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-400 mb-1">Aura Engine v2.1</p>
            <p>System Status: <span className="text-emerald-500">Online</span></p>
        </div>
    </div>
  </div>
);

const Header = () => {
    const { useMockApi, toggleMockApi } = useProjectStore();
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-slate-200 font-medium">New Project / Untitled Lesson</h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-full border border-slate-800">
                    <button 
                        onClick={() => !useMockApi && toggleMockApi()}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            useMockApi ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        Mock Mode
                    </button>
                    <button 
                        onClick={() => useMockApi && toggleMockApi()}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2",
                            !useMockApi ? "bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.2)]" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Zap size={12} />
                        Live API
                    </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
            </div>
        </header>
    );
}

const PipelineStepper = () => {
    const { currentProject } = useProjectStore();
    const stages = [
        { id: PipelineStage.SCRIPTING, label: "AI Scripting" },
        { id: PipelineStage.VOICE_SYNTHESIS, label: "Voice Gen" },
        { id: PipelineStage.MATH_VISUALS, label: "Math Visuals" },
        { id: PipelineStage.AVATAR_SYNC, label: "Avatar Sync" },
        { id: PipelineStage.COMPLETED, label: "Final Export" },
    ];

    const getCurrentStageIndex = () => {
        if (!currentProject) return -1;
        if (currentProject.status === PipelineStage.IDLE) return -1;
        if (currentProject.status === PipelineStage.COMPLETED) return 5;
        return stages.findIndex(s => s.id === currentProject.status);
    };

    const activeIndex = getCurrentStageIndex();

    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                
                {/* Progress Line */}
                <motion.div 
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 -z-10"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(Math.max(0, activeIndex) / (stages.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />

                {stages.map((stage, idx) => {
                    const isActive = idx === activeIndex;
                    const isCompleted = idx < activeIndex || currentProject?.status === PipelineStage.COMPLETED;
                    
                    return (
                        <div key={stage.id} className="flex flex-col items-center gap-3">
                            <motion.div 
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-slate-950 transition-colors duration-300",
                                    isActive ? "border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" :
                                    isCompleted ? "border-indigo-500 bg-indigo-500 text-white" :
                                    "border-slate-700 text-slate-700"
                                )}
                                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                            >
                                {isCompleted ? <CheckCircle2 size={18} /> : 
                                 isActive ? <Loader2 size={18} className="animate-spin" /> : 
                                 <span className="text-xs font-bold">{idx + 1}</span>}
                            </motion.div>
                            <span className={clsx(
                                "text-xs font-medium uppercase tracking-wider",
                                isActive ? "text-cyan-400" : isCompleted ? "text-indigo-400" : "text-slate-600"
                            )}>{stage.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScriptEditor = () => {
    const { currentProject } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'intro' | 'explanation' | 'conclusion'>('intro');
    
    if (!currentProject?.script) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2 text-slate-300">
                    <FileText size={16} />
                    <span className="font-semibold text-sm">Script Editor</span>
                </div>
                <div className="flex bg-slate-950 rounded-lg p-1">
                    {(['intro', 'explanation', 'conclusion'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-3 py-1 rounded text-xs font-medium capitalize transition-all",
                                activeTab === tab ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 flex-1">
                <textarea 
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-300 text-sm leading-relaxed"
                    value={currentProject.script[activeTab]}
                    readOnly
                />
            </div>
        </div>
    );
};

const CodePreview = () => {
    const { currentProject } = useProjectStore();
    
    if (!currentProject?.manimCode) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2 text-slate-300">
                    <CodeIcon size={16} />
                    <span className="font-semibold text-sm">Manim Code</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Python 3.9</span>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-950/50">
                <pre className="font-mono text-xs text-cyan-300/90 whitespace-pre-wrap">
                    <code>{currentProject.manimCode}</code>
                </pre>
            </div>
        </div>
    );
};

const LogConsole = () => {
    const { logs } = useProjectStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-black border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[200px]">
             <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-xs font-mono text-slate-400">System Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1" ref={scrollRef}>
                {logs.length === 0 && <span className="text-slate-600 italic">Waiting for process initialization...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute:"2-digit", second:"2-digit" })}]</span>
                        <span className={clsx(
                            log.type === 'error' ? 'text-red-500' :
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                        )}>
                            {log.type === 'info' && '> '}
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MagicInput = () => {
    const [inputValue, setInputValue] = useState('');
    const { startPipeline, isProcessing } = usePipelineService();
    const { setTopic, currentProject } = useProjectStore();

    const handleStart = () => {
        if (!inputValue.trim()) return;
        setTopic(inputValue);
        // Defer pipeline start slightly to allow state update
        setTimeout(() => startPipeline(), 100);
    };

    // If processing, don't show input
    if (isProcessing || currentProject?.status === PipelineStage.COMPLETED) return null;

    return (
        <div className="w-full max-w-3xl mx-auto text-center space-y-8 mt-20">
            <div className="space-y-2">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 pb-2">
                    What shall we teach today?
                </h1>
                <p className="text-slate-400 text-lg">Generate cinematic math lessons from a single prompt.</p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900 rounded-xl p-1 flex items-center">
                    <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. Visualize Eigenvectors in 3D space..."
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 p-4 resize-none h-20 text-lg"
                    />
                    <button 
                        onClick={handleStart}
                        className="h-16 px-8 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 mr-1"
                    >
                        <Sparkles size={20} />
                        Generate
                    </button>
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                {['Calculus: Chain Rule', 'Linear Algebra: Dot Product', 'Statistics: Bayesian Inference'].map(suggestion => (
                    <button 
                        key={suggestion}
                        onClick={() => setInputValue(suggestion)}
                        className="px-4 py-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

const VideoPreview = () => {
     const { currentProject } = useProjectStore();
    
     if (!currentProject?.videoUrl) return null;

     return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col relative group">
             <img 
                src={currentProject.videoUrl} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                alt="Video Preview"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                 <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-transform">
                     <Play size={32} fill="currentColor" />
                 </button>
             </div>
             <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                 <p className="text-white font-medium truncate">{currentProject.topic}</p>
                 <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                     <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">1080p</span>
                     <span>01:42</span>
                 </div>
             </div>
        </div>
     );
}

// --- MAIN LAYOUT ---

export default function App() {
  const { currentProject, resetProject } = useProjectStore();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar />
      
      <main className="ml-64 flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Input Stage */}
          <MagicInput />

          {/* Processing/Result Stage */}
          {currentProject?.status !== PipelineStage.IDLE && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{currentProject?.topic}</h2>
                        <p className="text-slate-400 text-sm">Task ID: {currentProject?.id.slice(0, 8)}</p>
                    </div>
                    {currentProject?.status === PipelineStage.COMPLETED && (
                        <button 
                            onClick={resetProject}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Start New Project
                        </button>
                    )}
                </div>

                <PipelineStepper />

                {/* Grid Layout */}
                <div className="grid grid-cols-12 gap-6 h-[600px]">
                    {/* Left Column: Script & Code */}
                    <div className="col-span-5 flex flex-col gap-6 h-full">
                        <div className="flex-1 min-h-0">
                            <ScriptEditor />
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodePreview />
                        </div>
                    </div>

                    {/* Right Column: Preview & Logs */}
                    <div className="col-span-7 flex flex-col gap-6 h-full">
                        <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {currentProject?.status === PipelineStage.COMPLETED ? (
                                <VideoPreview />
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                                        <Cpu className="absolute inset-0 m-auto text-cyan-500 animate-pulse" size={32} />
                                    </div>
                                    <p className="text-slate-400 animate-pulse">Processing Assets...</p>
                                </div>
                            )}
                        </div>
                        
                        <LogConsole />
                    </div>
                </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

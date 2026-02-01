import React, { useState, useRef } from 'react';
import ConfigurationPanel from './components/ConfigurationPanel';
import ChatPanel from './components/ChatPanel';
import ResultPanel from './components/ResultPanel';
import { PfeData, ChatMessage, GenerationStatus } from './types';
import { createPfeSession, generateInitialReport, extractLatex } from './services/gemini';
import { Chat } from '@google/genai';

function App() {
  const [pfeData, setPfeData] = useState<PfeData>({
    university: 'Université Mohammed Premier',
    school: 'Ecole Nationale des Sciences Appliquées Oujda',
    year: '2025-2026',
    title: '',
    studentName: '',
    supervisors: [''],
    juryMembers: [''],
    filiere: '',
    description: '',
    keywords: '',
    customInstructions: ''
  });

  const [latexCode, setLatexCode] = useState<string>('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'config' | 'chat'>('config');
  
  const chatSession = useRef<Chat | null>(null);

  const handleConfigChange = (field: keyof PfeData, value: any) => {
    setPfeData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!pfeData.title || !pfeData.description) {
      alert("Please fill in at least the Title and Description.");
      return;
    }

    setStatus(GenerationStatus.LOADING);
    setActiveSidebarTab('config');
    
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    try {
      const session = createPfeSession();
      chatSession.current = session;
      setMessages([]);

      const responseText = await generateInitialReport(session, pfeData);
      
      const code = extractLatex(responseText);
      setLatexCode(code);
      
      setMessages([
        {
          id: 'init-req',
          role: 'user',
          text: `Génère le rapport PFE pour : ${pfeData.title}`,
          timestamp: new Date(Date.now() - 2000)
        },
        {
          id: 'init-res',
          role: 'model',
          text: "Voici la structure LaTeX préliminaire. Vous pouvez utiliser cet assistant pour modifier le code.",
          timestamp: new Date()
        }
      ]);

      setActiveSidebarTab('chat');
      setStatus(GenerationStatus.SUCCESS);

    } catch (error) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      alert("An error occurred while generating the report. Please check your API key and try again.");
    }
  };

  const isLoading = status === GenerationStatus.LOADING;

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc]">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm z-10 shrink-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 mr-3 rounded-md text-gray-500 hover:bg-gray-100 hover:text-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <line x1="9" x2="9" y1="3" y2="21"/>
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="block">
            <h1 className="text-lg font-bold text-[#1e293b] leading-tight">ENSAO PFE Generator</h1>
            <p className="text-xs text-[#64748b]">École Nationale des Sciences Appliquées d'Oujda</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
           <div className="text-xs text-gray-400 font-mono">v1.3.5</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Configuration & Chat */}
        <div 
          className={`
            flex-shrink-0 h-full overflow-hidden z-20 bg-white
            ${isSidebarOpen ? 'w-full lg:w-[450px] border-r border-gray-200 shadow-xl lg:shadow-none opacity-100 flex flex-col' : 'w-0 border-none opacity-0'}
          `}
        >
           {/* Sidebar Tabs */}
           <div className="flex border-b border-gray-200">
             <button
               onClick={() => !isLoading && setActiveSidebarTab('config')}
               disabled={isLoading}
               className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                 activeSidebarTab === 'config' 
                   ? 'border-[#1e3a8a] text-[#1e3a8a] bg-gray-50' 
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
               } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               Configuration
             </button>
             <button
               onClick={() => !isLoading && setActiveSidebarTab('chat')}
               disabled={isLoading}
               className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                 activeSidebarTab === 'chat' 
                   ? 'border-[#1e3a8a] text-[#1e3a8a] bg-gray-50' 
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
               } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               Assistant Éditeur
             </button>
           </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden relative bg-white">
            <div 
              className={`absolute inset-0 w-full h-full bg-white ${activeSidebarTab === 'config' ? 'block' : 'hidden'}`}
            >
              <ConfigurationPanel 
                data={pfeData} 
                onChange={handleConfigChange} 
                onGenerate={handleGenerate}
                isGenerating={status === GenerationStatus.LOADING}
              />
            </div>
            <div 
              className={`absolute inset-0 w-full h-full bg-white ${activeSidebarTab === 'chat' ? 'block' : 'hidden'}`}
            >
              <ChatPanel 
                 chatSession={chatSession} 
                 messages={messages} 
                 setMessages={setMessages}
                 currentCode={latexCode}
                 onCodeUpdate={setLatexCode}
               />
            </div>
          </div>
        </div>

        {/* Right Panel: Result (Always Code) */}
        <div className="flex-1 h-full min-w-0 bg-[#f8fafc] relative">
          <ResultPanel 
            latexCode={latexCode}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
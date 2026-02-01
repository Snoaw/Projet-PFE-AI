import React, { useState } from 'react';
import Button from './Button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ResultPanelProps {
  latexCode: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  latexCode
}) => {
  const [copyFeedback, setCopyFeedback] = useState('Copier le code');

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopyFeedback('Copié !');
    setTimeout(() => setCopyFeedback('Copier le code'), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#e2e8f0] text-gray-900 relative">
      {/* Header / Toolbar */}
      <div className="h-16 flex items-center justify-between px-6 bg-[#0f172a] border-b border-[#334155] shrink-0 z-20 text-white">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Code LaTeX
        </div>
        
        {/* Copy Button - Only visible when there is code */}
        {latexCode && (
          <Button 
            variant="ghost" 
            className="text-xs !text-gray-300 hover:!text-white hover:!bg-[#334155] border border-[#334155] transition-all" 
            onClick={handleCopy}
          >
            {copyFeedback === 'Copié !' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
            <span className={copyFeedback === 'Copié !' ? 'text-green-500 font-bold' : ''}>{copyFeedback}</span>
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
          {latexCode ? (
            <div className="h-full w-full relative group custom-scrollbar overflow-auto bg-[#1e293b]">
              <SyntaxHighlighter 
                language="latex" 
                style={dracula} 
                customStyle={{ 
                  margin: 0, 
                  minHeight: '100%', 
                  padding: '1.5rem', 
                  fontSize: '0.875rem', 
                  lineHeight: '1.5',
                  backgroundColor: '#1e293b' // Match parent bg for smoothness
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {latexCode}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 p-8 text-center bg-[#1e293b]">
              <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mb-2 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
              </div>
              <h3 className="text-xl font-medium text-gray-300">Aucun code généré</h3>
              <p className="text-sm max-w-sm">Configurez votre projet dans le panneau de gauche et cliquez sur <span className="text-[#fbbf24]">Générer</span> pour voir le code LaTeX ici.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ResultPanel;
import React from 'react';
import { PfeData } from '../types';
import Button from './Button';

interface ConfigurationPanelProps {
  data: PfeData;
  onChange: (field: keyof PfeData, value: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  data, 
  onChange, 
  onGenerate, 
  isGenerating 
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.name as keyof PfeData, e.target.value);
  };

  // Supervisors Logic
  const handleSupervisorChange = (index: number, value: string) => {
    const newSupervisors = [...data.supervisors];
    newSupervisors[index] = value;
    onChange('supervisors', newSupervisors);
  };

  const addSupervisor = () => {
    if (data.supervisors.length < 2) {
      onChange('supervisors', [...data.supervisors, '']);
    }
  };

  const removeSupervisor = (index: number) => {
    const newSupervisors = data.supervisors.filter((_, i) => i !== index);
    onChange('supervisors', newSupervisors);
  };

  // Jury Logic
  const handleJuryChange = (index: number, value: string) => {
    const newJury = [...data.juryMembers];
    newJury[index] = value;
    onChange('juryMembers', newJury);
  };

  const addJuryMember = () => {
    if (data.juryMembers.length < 5) {
      onChange('juryMembers', [...data.juryMembers, '']);
    }
  };

  const removeJuryMember = (index: number) => {
    const newJury = data.juryMembers.filter((_, i) => i !== index);
    onChange('juryMembers', newJury);
  };

  // Generate Academic Years dynamically
  const getAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth(); // 0-11
    // If month is < 8 (before September), the academic year started the previous year
    const startYear = month < 8 ? currentYear - 1 : currentYear;
    
    const years = [];
    for(let i = 0; i < 5; i++) {
      const y = startYear + i;
      years.push(`${y}-${y + 1}`);
    }
    return years;
  };

  const academicYears = getAcademicYears();
  
  // Standardized input classes as requested (White bg, Slate borders/text, Blue focus)
  const inputClasses = "w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:border-transparent rounded-md outline-none transition-shadow text-sm";

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
          Configuration
        </h2>
        <p className="text-sm text-[#64748b] mt-1">Enter your project details to generate the LaTeX structure.</p>
      </div>

      <div className="flex-1 p-6 space-y-6">
        
        {/* Infos Générales Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1e3a8a] uppercase tracking-wider border-b border-gray-100 pb-2">Infos Générales</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
            <input
              type="text"
              name="university"
              value={data.university}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">École</label>
            <input
              type="text"
              name="school"
              value={data.school}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année Universitaire</label>
            <select
              name="year"
              value={data.year}
              onChange={handleChange}
              className={inputClasses}
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1e3a8a] uppercase tracking-wider border-b border-gray-100 pb-2">Détails du Projet</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du PFE</label>
            <input
              type="text"
              name="title"
              value={data.title}
              onChange={handleChange}
              placeholder="e.g. AI-Driven Traffic Management System"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant Réalisateur</label>
            <input
              type="text"
              name="studentName"
              value={data.studentName}
              onChange={handleChange}
              placeholder="Nom complet"
              className={inputClasses}
            />
          </div>

          {/* Supervisors Logic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Encadrant(s)</span>
              <span className="text-xs text-gray-500 font-normal">{data.supervisors.length}/2 Max</span>
            </label>
            <div className="space-y-2">
              {data.supervisors.map((supervisor, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={supervisor}
                    onChange={(e) => handleSupervisorChange(index, e.target.value)}
                    placeholder={`Encadrant ${index + 1}`}
                    className={inputClasses}
                  />
                  {data.supervisors.length > 1 && (
                    <button 
                      onClick={() => removeSupervisor(index)}
                      className="px-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {data.supervisors.length < 2 ? (
              <button
                onClick={addSupervisor}
                className="mt-2 text-xs font-medium text-[#1e3a8a] hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Ajouter un encadrant
              </button>
            ) : (
               <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                 Limite atteinte (Max 2)
               </p>
            )}
          </div>

          {/* Jury Members Logic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Membres du Jury</span>
              <span className="text-xs text-gray-500 font-normal">{data.juryMembers.length}/5 Max</span>
            </label>
            <div className="space-y-2">
              {data.juryMembers.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleJuryChange(index, e.target.value)}
                    placeholder={`Membre du Jury ${index + 1}`}
                    className={inputClasses}
                  />
                  {data.juryMembers.length > 1 && (
                    <button 
                      onClick={() => removeJuryMember(index)}
                      className="px-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {data.juryMembers.length < 5 ? (
              <button
                onClick={addJuryMember}
                className="mt-2 text-xs font-medium text-[#1e3a8a] hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Ajouter un membre
              </button>
            ) : (
               <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                 Limite atteinte (Max 5)
               </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
            <select
              name="filiere"
              value={data.filiere}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Sélectionner une filière</option>
              <option value="Ingénierie Data Sciences et Cloud Computing">Ingénierie Data Sciences et Cloud Computing</option>
              <option value="Ingénierie des Technologies de l'information et Réseaux de Communication">Ingénierie des Technologies de l'information et Réseaux de Communication</option>
              <option value="Sécurité Informatique et Cyber Sécurité">Sécurité Informatique et Cyber Sécurité</option>
              <option value="Génie Civil">Génie Civil</option>
              <option value="Génie Electrique">Génie Electrique</option>
              <option value="Génie Industriel">Génie Industriel</option>
              <option value="Génie Informatique">Génie Informatique</option>
              <option value="Génie des Systèmes Electroniques, Informatique et Réseaux">Génie des Systèmes Electroniques, Informatique et Réseaux</option>
              <option value="Management et Gouvernance des Systèmes d'informations">Management et Gouvernance des Systèmes d'informations</option>
            </select>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mots-clés (Contexte seulement)</label>
            <input
              type="text"
              name="keywords"
              value={data.keywords}
              onChange={handleChange}
              placeholder="React, AI, LaTeX, Automation"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Description & Custom Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1e3a8a] uppercase tracking-wider border-b border-gray-100 pb-2">Contenu & Instructions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description & Objectifs</label>
            <textarea
              name="description"
              value={data.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez le problème, la solution proposée..."
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions pour la génération</label>
            <textarea
              name="customInstructions"
              value={data.customInstructions}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Utilise un ton très formel, insiste sur l'architecture Microservices, etc."
              className={`${inputClasses} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1">Ces instructions guideront le style et le focus du rapport.</p>
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <Button 
          variant="accent" 
          className="w-full shadow-md hover:shadow-lg" 
          onClick={onGenerate}
          isLoading={isGenerating}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>
          Générer le Rapport LaTeX
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
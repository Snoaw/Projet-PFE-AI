import { GoogleGenAI, Chat } from "@google/genai";
import { PfeData } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to extract LaTeX code block if present, otherwise return full text
export const extractLatex = (text: string): string => {
  const codeBlockRegex = /```latex([\s\S]*?)```/i;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Fallback for generic code blocks
  const genericBlockRegex = /```([\s\S]*?)```/i;
  const genericMatch = text.match(genericBlockRegex);
  if (genericMatch && genericMatch[1]) {
      return genericMatch[1].trim();
  }

  // Fallback: if no block found, but starts with \documentclass, assume it's raw latex
  if (text.trim().startsWith('\\documentclass')) {
    return text.trim();
  }
  return text;
};

export const createPfeSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      temperature: 0.5, 
      systemInstruction: `Tu es un expert en rédaction académique et un développeur LaTeX chevronné, spécialisé dans la génération de rapports de PFE pour l'ENSAO (École Nationale des Sciences Appliquées d'Oujda).

TA MISSION :
Tu reçois en entrée le code LaTeX actuel d'un rapport et une instruction de l'utilisateur (ex: "Ajoute une section sur le Deep Learning"). Tu dois modifier le code intelligemment pour satisfaire la demande sans casser la structure du document.

RÈGLES DE FORMATAGE STRICTES (ENSAO) :
1. Marges : Haut 3cm, Bas 3cm, Gauche 4.5cm (reliure), Droite 2cm.
2. Police : Taille 12pt, Interligne 1.5.
3. Structure : Respecte l'ordre (Dédicace -> Remerciements -> Résumés -> Table des matières -> Liste des figures -> Contenu).
4. Langue : Le contenu doit être académique, formel, et utiliser le "nous" de modestie.

PROTOCOLE DE RÉPONSE :
Tu agis comme un assistant collaboratif.
1. Réponds avec une courte explication textuelle des changements effectués (ex: "J'ai ajouté le chapitre méthodologie").
2. Inclus TOUJOURS le code LaTeX COMPLET et mis à jour dans un bloc de code (markdown).
3. Ne donne pas juste l'extrait, renvoie tout le fichier.`
    }
  });
};

export const generateInitialReport = async (chat: Chat, data: PfeData): Promise<string> => {
  const supervisorsList = data.supervisors.filter(s => s.trim() !== '').join(', ');
  const juryList = data.juryMembers.filter(j => j.trim() !== '').join(', ');

  const prompt = `
    Génère un rapport PFE complet en LaTeX pour le projet suivant (Réponds avec du code LaTeX standard dans un bloc markdown) :
    
    Détails Académiques :
    Université : ${data.university}
    École : ${data.school}
    Année : ${data.year}
    Filière : ${data.filiere}
    
    Détails du Projet :
    Titre : ${data.title}
    Étudiant : ${data.studentName}
    Encadrant(s) : ${supervisorsList}
    Membre(s) du Jury : ${juryList}
    
    Contexte et thèmes : ${data.keywords}
    
    Description : ${data.description}

    Instructions : ${data.customInstructions}
    
    IMPORTANT : Applique les règles de formatage ENSAO (Marges 3cm/3cm/4.5cm/2cm, Interligne 1.5, etc.).
  `;

  try {
    const response = await chat.sendMessage({ message: prompt });
    return response.text || "Aucune réponse générée.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};

interface EditResponse {
  summary: string;
  code: string;
}

export const updateLatexCode = async (chat: Chat, currentCode: string, instruction: string): Promise<EditResponse> => {
  const prompt = `
    CODE ACTUEL :
    ${currentCode}

    INSTRUCTION DE L'UTILISATEUR :
    ${instruction}

    Rappel : Fournis une courte explication suivie du code LaTeX complet dans un bloc code.
  `;

  try {
    const response = await chat.sendMessage({ message: prompt });
    const text = response.text || "";

    const code = extractLatex(text);
    
    // Extract summary by removing the code blocks
    let summary = text
      .replace(/```latex([\s\S]*?)```/gi, '')
      .replace(/```([\s\S]*?)```/gi, '')
      .trim();

    if (!summary) {
      summary = "Code mis à jour avec succès.";
    }

    // Safety check: if extraction returned the full text (meaning no code block found), 
    // and the text doesn't look like code (starts with \documentclass), 
    // then the model might have just refused or chatted without code.
    // However, sticking to the simple contract:
    return {
      summary: summary,
      code: code
    };
  } catch (error) {
    console.error("Gemini update error:", error);
    throw error;
  }
};
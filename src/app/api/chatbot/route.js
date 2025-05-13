// app/api/chatbot/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const STRICT_PROMPT = `
ROLES ET DIRECTIVES ABSOLUES :
- Vous êtes un assistant EXCLUSIVEMENT spécialisé dans la réparation de scooters (50cc à 125cc)
- REFUSEZ TOUTE demande hors contexte avec : "Je ne peux répondre qu'aux questions sur les scooters"

FORMAT DE RÉPONSE OBLIGATOIRE :
[DIAGNOSTIC] : Maximum 3 possibilités classées par probabilité
[URGENCE] : Niveau 1 (bénin) à 5 (danger immédiat)
[CONSEILS] : 2-3 actions concrètes avec niveau de difficulté


`;

export async function POST(req) {
  const { messages } = await req.json();

  // Vérification du dernier message utilisateur
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
  const scooterKeywords = ['scooter', 'moto', 'cylindrée', '50cc', '125cc', 'piaggio', 'yamaha', 'moteur'];

  if (!scooterKeywords.some(keyword => lastUserMsg.includes(keyword))) {
    return NextResponse.json({
      error: "Veuillez poser une question relative aux scooters uniquement"
    });
  }

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "llama3:latest",
      prompt: `${STRICT_PROMPT}\n\nQuestion: ${lastUserMsg}`,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.3,
        num_ctx: 1024
      }
    })
  });

  if (!response.ok) {
    return NextResponse.json({ 
      error: "Le service de diagnostic est temporairement indisponible" 
    }, { status: 503 });
  }

  const result = await response.json();
  return NextResponse.json({ response: result.response });
}
// src/app/api/chatbot/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Réception du prompt actuel et de l'historique des messages
    // J'ajoute une valeur par défaut [] pour messages pour éviter l'erreur si la propriété n'est pas présente.
    const { prompt, messages = [] } = await request.json();

    console.log("API Chatbot reçue (Ollama) - Prompt:", prompt);
    console.log("API Chatbot reçue (Ollama) - Historique de conversation (messages):", messages);

    // Vérification du dernier message utilisateur ou du prompt pour le filtrage
    // Il est plus robuste de vérifier le prompt actuel si l'historique est vide
    const lastRelevantMsg = messages.length > 0 ? messages[messages.length - 1]?.content?.toLowerCase() : prompt.toLowerCase();

    const scooterKeywords = ['scooter', 'moto', 'cylindrée', '50cc', '125cc', 'piaggio', 'yamaha', 'moteur'];

    if (!scooterKeywords.some(keyword => lastRelevantMsg.includes(keyword))) {
      const genericResponse = "Je suis un assistant spécialisé dans les diagnostics de scooters. Je ne peux répondre qu'aux questions relatives aux scooters.";
      return NextResponse.json({ response: genericResponse });
    }

    // Préparer l'historique des messages pour Ollama
    // Ollama attend un tableau d'objets { role: "user" | "assistant", content: "..." }
    const ollamaMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant', // Assurez-vous que le champ 'sender' existe (user/bot)
      content: msg.content // Assurez-vous que le champ 'content' existe
    }));

    // Ajouter le message actuel de l'utilisateur
    ollamaMessages.push({ role: 'user', content: prompt });

    // Définir le prompt système pour Ollama
    const systemPrompt = `
      Tu es un assistant de diagnostic de scooter. Tu fournis des diagnostics, des niveaux d'urgence et des conseils.
      Tes réponses doivent TOUJOURS suivre ce format strict :
      [Diagnostics] :
      * Possibilité 1 : (probabilité) - (description)
      * Possibilité 2 : (probabilité) - (description)
      ...
      [Urgence] : Niveau X (modéré/élevé/faible) - (justification)
      [Conseils] :
      1. (Conseil 1) (difficulté : X/5)
      2. (Conseil 2) (difficulté : X/5)
      ...
      Note : Je ne peux répondre qu'aux questions sur les scooters, donc si vous avez des questions sur d'autres sujets, je suis désolé mais je ne peux pas vous aider.
      `;

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', { // Assurez-vous que l'URL d'Ollama est correcte
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:latest', // ou le nom de votre modèle Ollama (ex: 'mistral', 'llama2', 'phi3')
        messages: [
          { role: 'system', content: systemPrompt }, // Ajouter le prompt système
          ...ollamaMessages // Ajouter l'historique et le message actuel
        ],
        stream: false, // Important pour recevoir la réponse complète en une fois
      }),
    });

    if (!ollamaResponse.ok) {
      const errorData = await ollamaResponse.json();
      console.error('Erreur de l l\'API Ollama:', errorData);
      throw new Error(`Erreur de l'API Ollama: ${errorData.error || ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    const botResponseContent = data.message.content; // Accédez au contenu de la réponse d'Ollama

    console.log("Réponse complète d'Ollama:", data);
    console.log("Contenu de la réponse d'Ollama (botResponseContent):", botResponseContent);


    return NextResponse.json({ response: botResponseContent });

  } catch (error) {
    console.error('Erreur dans l\'API Chatbot (Ollama):', error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la communication avec l\'IA.' }, { status: 500 });
  }
}
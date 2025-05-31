// src/components/Chatbot.jsx
'use client';
import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ onDiagnosticUpdate }) {
  // Les messages stockent l'historique complet pour être envoyés à l'API
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajoute le message de l'utilisateur à l'historique local
    const userMessage = { sender: 'user', content: input }; // Utilise 'content' pour correspondre à l'API
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Met à jour l'état local

    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT : Envoie le prompt actuel ET l'historique complet des messages
        body: JSON.stringify({ prompt: input, messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la communication avec l\'IA');
      }

      const data = await response.json();
      const botResponseText = data.response; // C'est ici que tu récupères la réponse de l'IA

      console.log("Chatbot Debug: Réponse brute de l'IA reçue du backend (botResponseText):", botResponseText);

      let diagnosticPart = '';
      // Cette regex doit correspondre à ce que l'IA est censée renvoyer.
      // Si le format [Diagnostics] : ... [Urgence] : ... [Conseils] : est standard,
      // on peut essayer de capturer tout ce bloc.
      const diagnosticRegex = /\[Diagnostics\] :([\s\S]*)/; // Capture tout après [Diagnostics] :
      const match = botResponseText.match(diagnosticRegex);

      if (match && match[1]) {
        diagnosticPart = `[Diagnostics] :${match[1].trim()}`;
      } else {
        diagnosticPart = botResponseText; // Si le format spécifique n'est pas trouvé, utilise la réponse complète.
        console.warn("Chatbot Debug: Format '[Diagnostics] :' non trouvé. La réponse complète de l'IA sera utilisée comme diagnostic.");
      }

      console.log("Chatbot Debug: Diagnostic extrait (diagnosticPart):", diagnosticPart);
      console.log("Chatbot Debug: Type de diagnosticPart:", typeof diagnosticPart);
      console.log("Chatbot Debug: Longueur de diagnosticPart:", diagnosticPart.length);

      // Ajoute la réponse du bot à l'historique local
      const botMessage = { sender: 'bot', content: botResponseText }; // Utilise 'content'
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Appelle la fonction de mise à jour du parent avec le diagnostic extrait
      if (onDiagnosticUpdate) {
        console.log("Chatbot Debug: Appel de onDiagnosticUpdate avec le diagnostic:", diagnosticPart);
        onDiagnosticUpdate(diagnosticPart);
      } else {
        console.warn("Chatbot Debug: La prop onDiagnosticUpdate n'a pas été fournie ou est nulle.");
      }

    } catch (error) {
      console.error('Chatbot Debug: Erreur lors de l\'envoi du message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', content: `Désolé, une erreur est survenue: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content} {/* Affiche msg.content ici */}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800 animate-pulse">
              L'assistant réfléchit...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex p-4 border-t border-gray-300 bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez le problème du scooter..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
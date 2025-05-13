'use client'
import { useState, useRef } from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const formRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      if (!response.ok) throw new Error('Erreur du serveur')
      
      const data = await response.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.message?.content || "Désolé, je n'ai pas pu comprendre" 
      }])
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <div className="h-64 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <strong>{msg.role === 'user' ? 'Vous' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <form onSubmit={handleSubmit} ref={formRef} className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Décrivez votre problème..."
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
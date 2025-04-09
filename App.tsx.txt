import React from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { HistoryItem } from './components/HistoryItem';
import { FileUpload } from './components/FileUpload';
import type { Message, HistoryItem as HistoryItemType } from './types';

function App() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [fileContent, setFileContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItemType[]>(() => {
    const saved = localStorage.getItem('promptHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    localStorage.setItem('promptHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !fileContent) return;
    if (isLoading) return;

    const fullPrompt = fileContent 
      ? `${input}\n\n[Archivo adjunto]:\n${fileContent}`
      : input;

    // Guardar en historial
    const newHistoryItem: HistoryItemType = {
      id: crypto.randomUUID(),
      prompt: fullPrompt,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newHistoryItem, ...prev]);

    // Mensaje del usuario
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      hasFile: !!fileContent,
    };
    setMessages(prev => [...prev, userMessage]);

    // Reiniciar campos
    setInput('');
    setFileContent(null);
    setIsLoading(true);

    try {
      // ¡ESTA ES LA PARTE IMPORTANTE! Usamos NUESTRO backend en Netlify
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `😢 Error: ${error instanceof Error ? error.message : 'Algo falló'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItemType) => {
    setInput(item.prompt);
  };

  return (
    <div className="min-h-screen bg-purple-900 p-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Zona de Chat */}
        <div className="flex-[2] bg-indigo-800 rounded-xl p-6 shadow-lg border border-purple-700">
          <div className="h-[500px] overflow-y-auto mb-4 p-4 border border-purple-500 rounded-lg">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <FileUpload onFileSelect={setFileContent} />

          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje mágico..."
              className="flex-1 p-3 bg-indigo-700 text-white border-2 border-purple-500 rounded-lg placeholder-purple-300"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="flex-1 bg-indigo-800 rounded-xl p-6 shadow-lg border border-purple-700">
          <h3 className="text-lg font-semibold mb-4 text-white">✨ Mis Conversaciones</h3>
          <div className="space-y-2">
            {history.map(item => (
              <HistoryItem
                key={item.id}
                item={item}
                onSelect={handleHistorySelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
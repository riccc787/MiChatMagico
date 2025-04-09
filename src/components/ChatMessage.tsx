export const ChatMessage = ({ message }) => (
  <div className={`p-4 mb-4 ${message.type === 'user' ? 'bg-blue-800' : 'bg-green-800'} rounded-lg`}>
    {message.content}
  </div>
);
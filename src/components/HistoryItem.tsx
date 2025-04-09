export const HistoryItem = ({ item }) => (
  <div className="p-2 bg-gray-700 rounded mb-2 cursor-pointer hover:bg-gray-600">
    {item.prompt.substring(0, 50)}...
  </div>
);
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
} 
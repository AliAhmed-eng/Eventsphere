function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-white/10 border-t-purple-500 border-r-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-white/5"></div>
        </div>
      </div>
      <div className="ml-6">
        <p className="text-white font-semibold text-lg">Loading events...</p>
        <p className="text-gray-400 text-sm">Please wait</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;

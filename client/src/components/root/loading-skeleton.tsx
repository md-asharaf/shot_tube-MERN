export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-y-6 dark:text-white text-black">
      {Array(12)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex flex-col gap-2 p-2">
            <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-44 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-10 rounded-full w-10"></div>
              <div className="w-3/4 flex-1 space-y-2">
                <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-6 rounded-md w-3/4"></div>
                <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-4 rounded-md w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

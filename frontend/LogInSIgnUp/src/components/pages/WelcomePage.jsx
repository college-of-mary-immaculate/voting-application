export default function ElectionSelector() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Image */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop"
            alt="Vote illustration"
            className="w-80 h-80 object-cover rounded-3xl shadow-2xl"
          />
        </div>
        {/* Slogan */}
        <h1 className="text-6xl font-light text-slate-800 mb-6">Vote Wisely</h1>
        <p className="text-2xl text-slate-600">
          When you vote wisely today, you protect tomorrow.
        </p>
      </div>
    </div>
  );
}
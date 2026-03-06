import { useNavigate } from 'react-router-dom';

const elections = [
  {
    id: 'national',
    name: 'National Election',
    description: 'Vote for President, Vice President, and Senators',
    icon: '🇵🇭',
    color: 'from-[#1e3a8a] to-[#2563eb]',
    path: '/elections/national',
  },
  {
    id: 'barangay',
    name: 'Barangay Election',
    description: 'Vote for Barangay Captain and 8 Councilors',
    icon: '🏘️',
    color: 'from-[#f4a261] to-[#e76f51]',
    path: '/elections/barangay',
  },
  {
    id: 'class',
    name: 'Class Election',
    description: 'Vote for Class President, VP, and Representative',
    icon: '📚',
    color: 'from-[#2ecc71] to-[#27ae60]',
    path: '/elections/class',
  },
  {
    id: 'custom',
    name: 'Custom Election',
    description: 'Vote for Chairperson and Committee Members',
    icon: '⚙️',
    color: 'from-[#9b59b6] to-[#8e44ad]',
    path: '/elections/custom',
  },
];

export default function ElectionSelector() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-10 bg-repeat"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Philippines.svg/1280px-Flag_of_the_Philippines.svg.png')",
          backgroundSize: '200px 100px',
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-[#f8f9fa]/80 via-white/80 to-[#e9ecef]/80 backdrop-blur-sm py-16 px-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0f4c5c] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f4a261] opacity-20 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-light text-white tracking-tight mb-4 drop-shadow-lg">Choose an Election</h1>
            <p className="text-white/90 text-xl drop-shadow">Select the type of election you want to participate in</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {elections.map((election) => (
              <div
                key={election.id}
                onClick={() => navigate(election.path)}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${election.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {election.icon}
                </div>

                {/* Content */}
                <h2 className="text-3xl font-semibold text-[#2d3e50] mb-2">{election.name}</h2>
                <p className="text-[#5a6b7a] mb-6">{election.description}</p>

                {/* Button */}
                <button
                  className={`px-6 py-3 rounded-full bg-gradient-to-r ${election.color} text-white font-medium shadow-lg transform transition-all duration-300 group-hover:translate-x-2`}
                >
                  Vote Now →
                </button>

                {/* Decorative elements */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
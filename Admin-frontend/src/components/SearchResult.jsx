
const CandidateCard = ({ candidate }) => {
  return (
    <div>
      <div className="flex justify-between mt-12 p-2">
        <div className="relative">
          <div className="rounded-full w-[120px] h-[120px] overflow-hidden">
            <img
              src={candidate.image}
              alt={`${candidate.name} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <span 
            className={`absolute w-4 h-4 rounded-full border-2 border-white top-24 left-24 ${candidate.online ? 'bg-[#6B8E23]' : 'bg-[#828282]'}`}
          ></span>
        </div>
        
        <div className="ml-4 flex-1 space-y-2">
          <div>
            <p className="text-[#6B8E23] text-2xl font-medium">{candidate.name}</p>
            <p className="text-[#6B8E23] text-sm">{candidate.type}</p>
          </div>
          
          <div>
            <p className="text-[#6B8E23] text-xl font-medium">{candidate.jobTitle}</p>
            <p className="text-[#6B8E23] text-sm">{candidate.location}</p>
          </div>
          
          <div className="space-y-2 mt-3">
            <button className="bg-[#556B1F] hover:bg-[#6B8E23] transition-colors p-2 w-full rounded-3xl text-white font-medium">
              View Profile
            </button>
            <button className="border-2 border-[#6B8E23] hover:bg-[#6B8E23]/10 p-2 w-full rounded-3xl text-[#6B8E23] font-medium">
              Invite for interview
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#556B1F] h-1 mt-4"></div>
    </div>
  );
};

const SearchResult = () => {
  const candidates = [
    {
      id: 1,
      name: "Osakwe Prisca",
      type: "Jobseeker",
      jobTitle: "Graphics Designer",
      location: "Lagos, Nigeria",
      image: "/assets/images/photo_placeholder.png",
      online: true
    },
    {
      id: 2,
      name: "Osakwe Prisca",
      type: "Jobseeker",
      jobTitle: "Graphics Designer",
      location: "Lagos, Nigeria",
      image: "/assets/images/photo_placeholder.png",
      online: false
    },
    {
      id: 3,
      name: "Osakwe Prisca",
      type: "Jobseeker",
      jobTitle: "Graphics Designer",
      location: "Lagos, Nigeria",
      image: "/assets/images/photo_placeholder.png",
      online: true
    },
    {
      id: 4,
      name: "Osakwe Prisca",
      type: "Jobseeker",
      jobTitle: "Graphics Designer",
      location: "Lagos, Nigeria",
      image: "/assets/images/photo_placeholder.png",
      online: false
    }
  ];

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <div className="bg-[#1A3E32] w-full max-w-[400px] p-5 rounded-2xl shadow-lg">
        <div className="text-center p-5">
          <p className="text-white text-[20px] font-semibold">Search Result</p>
          <p className="text-white">{candidates.length} Candidates found</p>
        </div> 
        
        <div className="bg-[#556B1F] h-1"></div>
        
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
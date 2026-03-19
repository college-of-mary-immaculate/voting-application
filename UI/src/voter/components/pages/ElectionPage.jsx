import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getElections,
  getCandidates,
  isAuthenticated,
  castVote,
} from "../../services/api";
import ElectionContainer from "../elections/ElectionContainer";
import { processElectionData } from "../../utils/electionHelpers";

export default function ElectionPage() {
  const { electionId } = useParams(); // get from URL
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getElections();
        console.log("Elections response:", res);
        
        const electionsData = res.data?.data || [];

        // Find the election by ID from URL
        const selectedElection = electionsData.find(
          (e) => e.election_id === parseInt(electionId)
        );

        if (!selectedElection) {
          setError("Election not found or you are not assigned to it.");
          setLoading(false);
          return;
        }

        setElection(selectedElection);

        // Fetch candidates for this election
        const candidatesRes = await getCandidates();
        console.log("Candidates response:", candidatesRes);
        
        const allCandidates = candidatesRes.data?.data || [];
        const electionCandidates = allCandidates.filter(
          (c) => c.election_id === selectedElection.election_id
        );

        console.log("Election candidates:", electionCandidates);

        const { positions } = processElectionData(
          selectedElection,
          electionCandidates
        );
        
        console.log("Processed positions:", positions);
        setPositions(positions);
      } catch (err) {
        console.error("Failed to load election data:", err);
        setError("Failed to load election data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [electionId]);

  const handleSubmit = async (voteData) => {
    try {
      console.log("Raw vote data from ElectionContainer:", voteData);
      
      const votes = [];

      voteData.forEach((pos) => {
        const position = positions.find((p) => p.id === pos.positionId);
        
        if (Array.isArray(pos.selected)) {
          // Multiple votes allowed (e.g., board members)
          pos.selected.forEach((candidateId) => {
            const candidate = position?.candidates.find((c) => c.id === candidateId);
            if (candidate) {
              votes.push({
                position_id: pos.positionId,
                ballot_number: candidate.ballot_number  // Send only ballot_number as backend expects
              });
            }
          });
        } else if (pos.selected) {
          // Single vote (e.g., president)
          const candidate = position?.candidates.find((c) => c.id === pos.selected);
          if (candidate) {
            votes.push({
              position_id: pos.positionId,
              ballot_number: candidate.ballot_number  // Send only ballot_number as backend expects
            });
          }
        }
      });

      // Sort votes by position_id to match backend expectations
      votes.sort((a, b) => a.position_id - b.position_id);

      // Format exactly as backend expects
      const payload = {
        election_id: election.election_id,
        votes: votes
      };

      console.log("Final payload matching backend expectation:", payload);

      const result = await castVote(payload);
      console.log("Vote cast result:", result);
      
      alert("Vote submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Vote submission failed:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.message || "Failed to submit vote.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">❌</div>
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!election) return null;

  return (
    <ElectionContainer
      electionName={election.election_name}
      electionTagline={`Voting for ${election.election_name}`}
      positions={positions}
      onSubmitVotes={handleSubmit}
      endTime={election.end_at}
      serverTime={new Date().toISOString()}
    />
  );
}
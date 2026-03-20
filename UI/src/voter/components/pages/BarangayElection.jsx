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

export default function BarangayElection() {
  const { electionId } = useParams();
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

        const electionsRes = await getElections();
        const electionsData = electionsRes.data?.data || [];

        const foundElection = electionsData.find(
          (e) => e.election_id === parseInt(electionId)
        );

        if (!foundElection) {
          setError("Election not found or you are not assigned to it.");
          setLoading(false);
          return;
        }

        if (foundElection.has_voted) {
          navigate(`/elections/tally/${electionId}`);
          return;
        }

        setElection(foundElection);

        const candidatesRes = await getCandidates();
        const allCandidates = candidatesRes.data?.data || [];
        const electionCandidates = allCandidates.filter(
          (c) => c.election_id === foundElection.election_id
        );

        const { positions } = processElectionData(foundElection, electionCandidates);
        setPositions(positions);
      } catch (err) {
        console.error("Failed to load election data:", err);
        setError("Failed to load election data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [electionId, navigate]);

  const handleSubmit = async (voteData) => {
    try {
      const votes = [];
      voteData.forEach((pos) => {
        if (Array.isArray(pos.selected)) {
          pos.selected.forEach((candidateId) => {
            const candidate = positions
              .find((p) => p.id === pos.positionId)
              ?.candidates.find((c) => c.id === candidateId);
            if (candidate) {
              votes.push({
                position_id: pos.positionId,
                ballot_number: candidate.ballot_number,
              });
            }
          });
        } else if (pos.selected) {
          const candidate = positions
            .find((p) => p.id === pos.positionId)
            ?.candidates.find((c) => c.id === pos.selected);
          if (candidate) {
            votes.push({
              position_id: pos.positionId,
              ballot_number: candidate.ballot_number,
            });
          }
        }
      });

      await castVote({ election_id: election.election_id, votes });
      navigate(`/elections/tally/${electionId}`);
    } catch (err) {
      console.error("Vote submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit vote.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-2xl text-indigo-600">Loading Barangay Election...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center text-red-600 text-xl p-8 bg-white rounded-2xl shadow-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!election) return null;

  return (
    <ElectionContainer
      electionName={election.election_name}
      electionTagline="Choose your barangay officials"
      positions={positions}
      onSubmitVotes={handleSubmit}
      endTime={election.end_at}
      serverTime={new Date().toISOString()}
      electionTypeId={election.election_type_id} 
    />
  );
}
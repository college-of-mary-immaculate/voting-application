import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getElections,
  getCandidates,
  isAuthenticated,
  castVote,
} from "../../services/api";
import ElectionContainer from "../elections/ElectionContainer";
import { processElectionData } from "../../utils/electionHelpers";

export default function BarangayElection() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [electionId, setElectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const electionsRes = await getElections();
        const electionsData = electionsRes.data.data;

        // normalize to array
        const elections = Array.isArray(electionsData)
          ? electionsData
          : [electionsData];

        const barangayElection = elections.find(
          (e) => e.election_type_id === 2 && e.status !== "Closed",
        );
        if (!barangayElection) {
          setError("No active barangay election found.");
          setLoading(false);
          return;
        }

        const candidatesRes = await getCandidates();
        const allCandidates = candidatesRes.data.data || [];
        const electionCandidates = allCandidates.filter(
          (c) => c.election_id === barangayElection.election_id,
        );

        const { electionId, positions } = processElectionData(
          barangayElection,
          electionCandidates,
        );
        setElectionId(electionId);
        setPositions(positions);
      } catch (err) {
        console.error("Failed to load election data:", err);
        setError("Failed to load election data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      await castVote({ election_id: electionId, votes });
      return Promise.resolve();
    } catch (err) {
      console.error("Vote submission failed:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-2xl text-indigo-600">
          Loading Barangay Election...
        </div>
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

  return (
    <ElectionContainer
      electionName={election.election_name}
      electionTagline="Choose your barangay officers"
      positions={positions}
      onSubmitVotes={handleSubmit}
      endTime={election.end_at}
      serverTime={new Date().toISOString()}
    />
  );
}

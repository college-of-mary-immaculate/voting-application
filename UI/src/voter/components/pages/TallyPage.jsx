import { useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../utils/socket";

export default function TallyPage() {
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- Fetch the election assigned to the voter
  const fetchElection = async () => {
    try {
      const res = await API.get("/elections/my-election");
      setElection(res.data.data);

      if (res.data.data) {
        fetchResults(res.data.data.election_id);
      }
    } catch (err) {
      console.error("Error fetching election:", err);
    }
  };

  // --- Fetch election results
  const fetchResults = async (id) => {
    try {
      const res = await API.get(`/elections/${id}/results`);
      setResults(res.data.results);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hrs > 0 || days > 0) parts.push(`${hrs}h`);
  parts.push(`${mins}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}
  // --- Initial load
  useEffect(() => {
    fetchElection();
  }, []);

  // --- WebSocket vote listener
  useEffect(() => {
    if (!election) return;

    socket.emit("joinElection", election.election_id);

    socket.on("voteUpdate", () => {
      fetchResults(election.election_id);
    });

    return () => {
      socket.off("voteUpdate");
    };
  }, [election]);

  // --- Countdown timer
  useEffect(() => {
    if (!election) return;

    const PH_OFFSET_MIN = 8 * 60; // UTC+8
    const updateTimeLeft = () => {
      const nowUTC = new Date();
      const nowPH = new Date(nowUTC.getTime() + PH_OFFSET_MIN * 60000);

      const endUTC = new Date(election.end_at); // ISO string from backend
      const endPH = new Date(endUTC.getTime() + PH_OFFSET_MIN * 60000);

      const diff = Math.floor((endPH - nowPH) / 1000);
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(updateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(updateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [election]);


  if (!election) return <div>No active election</div>;

  return (
    <div>
      <h2>{election.election_name}</h2>
      <p>Time left: {formatTime(timeLeft)}</p>

      {results.map((pos) => (
        <div key={pos.position_id}>
          <h3>{pos.position_name}</h3>
          {pos.candidates.map((c) => (
            <div key={c.candidate_id}>
              {c.full_name} - {c.votes} votes
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

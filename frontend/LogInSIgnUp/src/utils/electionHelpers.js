/**
 * Groups candidates by position and returns an array suitable for ElectionContainer.
 * Also returns election_id and endTime from the election object.
 */
export const processElectionData = (election, candidates) => {
  if (!election || !candidates) return { electionId: null, endTime: null, positions: [] };

  const positionsMap = {};

  candidates.forEach(candidate => {
    const posName = candidate.position_name;
    const posId = candidate.position_id;
    const maxVotes = candidate.max_vote_allowed;

    if (!positionsMap[posId]) {
      positionsMap[posId] = {
        id: posId,
        title: posName,
        maxVotes: maxVotes,
        candidates: []
      };
    }

    positionsMap[posId].candidates.push({
      id: candidate.candidate_id,
      ballot_number: candidate.ballot_number,
      name: candidate.full_name,
      party: candidate.party_name || 'Independent',
      image: candidate.photo_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(candidate.full_name)}`,
    });
  });

  return {
    electionId: election.election_id,
    endTime: new Date(election.end_at),
    positions: Object.values(positionsMap).sort((a, b) => a.id - b.id)
  };
};
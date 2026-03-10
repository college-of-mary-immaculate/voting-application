# Voting System API

This API allows frontend developers to interact with the voting system backend. It supports voter registration, login, viewing elections, and casting votes.

Base URL: `http://localhost:3000/api`

---

## 1. Register Voter

**Endpoint:** `/voters/register`  
**Method:** `POST`  
**Description:** Register a new voter.

### Request Body
```json
{
  "fullname": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "securepassword"
}
```

## 2. Login Voter
### Request Body
**Endpoint:** `/voters/login`  
**Method:** `POST`  
**Description:** Login for voter.

```json
{
    "email": "juan@gmail.com",
    "password": "securepassword"
}
```
### RESPONSE (SUCCESS)
``` json

{

}
```
## 3. Cast Vote
### Request Body
**Endpoint:** `/voters/vote`  
**Method:** `POST`  
**Description:** Cast vote for voters.

```json
{
  "voter_id": 1,
  "election_id": 1,
  "votes": [
    {
      "position_id": 1,
      "candidate_ids": [3]
    },
    {
      "position_id": 2,
      "candidate_ids": [5]
    },
    {
      "position_id": 3,
      "candidate_ids": [8,9,10]
    }
  ]
}
```
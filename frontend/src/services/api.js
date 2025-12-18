import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (voterId, electionId) => 
    api.post('/auth/login', { voterId, electionId }),
  
  verify: (sessionId) => 
    api.post('/auth/verify', { sessionId }),
  
  logout: (sessionId) => 
    api.post('/auth/logout', { sessionId }),
};

// Elections API
export const electionsAPI = {
  getAll: () => 
    api.get('/elections'),
  
  getById: (electionId) => 
    api.get(`/elections/${electionId}`),
  
  create: (electionData) => 
    api.post('/elections/create', electionData),
  
  start: (electionId) => 
    api.post(`/elections/${electionId}/start`),
  
  end: (electionId) => 
    api.post(`/elections/${electionId}/end`),
  
  registerVoters: (electionId, voterIds) =>
    api.post(`/elections/${electionId}/register-voters`, { voterIds }),
  
  getVoterProof: (electionId, credential) =>
    api.post(`/elections/${electionId}/get-voter-proof`, { credential }),
};

// Votes API
export const votesAPI = {
  submit: (voteData) => 
    api.post('/votes/submit', voteData),
  
  verify: (electionId, receiptHash) => 
    api.post('/votes/verify', { electionId, receiptHash }),
  
  getCount: (electionId) => 
    api.get(`/votes/${electionId}/count`),
  
  tally: (electionId) => 
    api.post(`/votes/${electionId}/tally`),
  
  getResults: (electionId) => 
    api.get(`/votes/${electionId}/results`),
};

// Audit API
export const auditAPI = {
  getTrail: (electionId) => 
    api.get(`/audit/${electionId}/trail`),
  
  verify: (electionId) => 
    api.get(`/audit/${electionId}/verify`),
  
  getStats: (electionId) => 
    api.get(`/audit/${electionId}/stats`),
  
  getMerkleTree: (electionId) =>
    api.get(`/audit/${electionId}/merkle`),
};

// Admin API
export const adminAPI = {
  checkAccess: () => 
    api.get('/admin/check'),
};

export default api;

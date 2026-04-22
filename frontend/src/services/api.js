const API_BASE_URL = 'http://localhost:5000/api';

export const getAssignments = async ({ tas, sections }) => {
  const response = await fetch(`${API_BASE_URL}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tas, sections })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Unable to fetch assignments.');
  }

  return response.json();
};

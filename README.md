# TAFlow Optimizer

A full-stack prototype for assigning teaching assistants (TAs) to course sections using a simple matching heuristic.

## Tech Stack

- Frontend: React (Vite, JavaScript/JSX)
- Backend: Node.js + Express
- API: REST JSON
- Styling: Basic CSS

## Project Structure

```text
taflow-optimizer/
	frontend/
		src/
			components/
				TAInput.jsx
				SectionInput.jsx
				AssignmentTable.jsx
			services/
				api.js
			App.jsx
			main.jsx
	backend/
		routes/
			assign.js
		controllers/
			assignController.js
		services/
			matchingService.js
		server.js
```

## Features

- Add TAs with name, skills, and availability
- Add course sections with name, time slot, and required skill
- POST all data to backend optimizer
- Display assignment results in a table
- Highlight statuses: `OK`, `Conflict`, `Overloaded`

## Assignment Rules

- TA must have required skill
- TA availability is preferred for matching
- Workload balancing is applied by preferring TAs with fewer assignments
- Conflicts flagged when:
	- TA is unavailable for assigned time
	- TA is assigned overlapping time slots
- Overloaded flagged when TA has more than 2 assignments

## Run Locally

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## API Contract

### POST `/api/assign`

Request body:

```json
{
	"tas": [
		{
			"name": "Ali",
			"skills": ["python", "algorithms"],
			"availability": ["Mon 2PM", "Tue 10AM"]
		}
	],
	"sections": [
		{
			"courseName": "CS101",
			"timeSlot": "Mon 2PM",
			"requiredSkill": "python"
		}
	]
}
```

Response example:

```json
{
	"assignments": [
		{
			"ta": "Ali",
			"section": "CS101",
			"time": "Mon 2PM",
			"status": "OK"
		}
	]
}
```

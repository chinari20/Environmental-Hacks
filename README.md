# LeakLens — Smart Water Issue Reporting

A hackathon MVP for the Bharat Builds Tour — Heat and Water track.

## MVP features
- Report a water leak, waterlogging, shortage, or flooding issue.
- View and filter reports.
- Set priority and track status: Reported → In Progress → Resolved.
- Dashboard counts for total, open, in-progress, and resolved issues.
- Data persists in the browser using localStorage, so the demo works immediately without credentials.

## Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Before submission
1. Replace demo/sample data with real test reports.
2. Test the complete report → status update flow.
3. Add a clear, truthful impact statement; do not claim measured impact without evidence.
4. Record a 3-minute demo showing the problem, workflow, and technology.
5. The event rules require at least one AWS open-source tool or deployment on AWS for prize eligibility. This starter currently runs locally and **is not yet AWS-eligible** until you add an eligible AWS component/deployment and verify it works.
6. Check the official event portal for the exact submission form and deadline.

## Suggested AWS path
For a fast static frontend deployment, use AWS Amplify Hosting. Follow the current AWS Amplify Hosting documentation, connect your repository, set the app root to `frontend` if you later split this starter, and verify the deployed URL. For this single-package Vite app, set the build command to `npm run build` and output directory to `dist`. A static frontend deployment counts as AWS deployment if successfully deployed and accessible; verify current event rules before submission.

## Honest scope
This MVP records user-submitted reports. It does not independently verify locations, contact municipal authorities, predict floods, or use live sensor data.

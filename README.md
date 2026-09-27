<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/669f521a-a3e3-4c95-aefa-626a1f682f9f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Image-to-Video backend

The video generator uses the server-side Kie.ai proxy and real Kling 3.0 Omni Image-to-Video tasks. The Image-to-Video client first uses the existing `/api/generate-image` POST route with `generationType: 'video'` as an AI Studio preview compatibility path. The server forwards that request to the real Kie.ai video handler. Dedicated video routes remain as aliases. Video status first uses `/api/kie/status?taskId=...`, then falls back to dedicated status aliases. Health uses `/api/kie-video-health`. Do not convert these calls to client-side Kie.ai requests; the Kie.ai API key remains server-side.

# MAAD Webhook Server

Simple Express server for Facebook webhook verification and event handling.

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Environment Variables

- `VERIFY_TOKEN`: Set to `maad_verify_2025`
- `PORT`: Will be set automatically by Render

## Usage

1. Deploy to Render
2. Get your app URL (e.g., `https://your-app.onrender.com`)
3. Use `https://your-app.onrender.com/webhook` as your Facebook webhook URL
4. Use `maad_verify_2025` as your verify token
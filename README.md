# Cookbook Cabinet API

Small backend for parsing recipe text without exposing the OpenAI API key in the iOS app.

## Render settings

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Root directory: leave blank if these files are at the repository root, or set it to `cookbook-backend` if this folder is pushed as a subfolder.

## Environment variables

Set these in Render's Environment tab:

- `OPENAI_API_KEY`: your OpenAI API key
- `OPENAI_MODEL`: optional, defaults to `gpt-5.4-mini`

Do not commit `.env` files or API keys to GitHub.

## Endpoint

POST `/parse-recipe`

Request:

```json
{
  "text": "recipe text"
}
```

Response:

```json
{
  "title": "Recipe title",
  "ingredients": ["ingredient"],
  "instructions": ["step"]
}
```

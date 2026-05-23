import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (_request, response) => {
  response.json({ status: "ok", service: "Cookbook Cabinet API" });
});

app.post("/parse-recipe", async (request, response) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      response.status(500).json({ error: "Server is missing OPENAI_API_KEY." });
      return;
    }

    const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";

    if (!text) {
      response.status(400).json({ error: "Recipe text is required." });
      return;
    }

    const aiResponse = await client.responses.create({
      model,
      store: false,
      instructions: [
        "Extract a structured recipe from the user's text.",
        "Return only valid JSON with this exact shape:",
        "{\"title\":\"...\",\"ingredients\":[\"...\"],\"instructions\":[\"...\"]}",
        "Do not include markdown, commentary, or extra keys.",
      ].join(" "),
      input: text.slice(0, 12000),
    });

    const recipe = parseRecipeJSON(aiResponse.output_text);

    if (!recipe || recipe.ingredients.length === 0 || recipe.instructions.length === 0) {
      response.status(422).json({ error: "Could not extract a complete recipe." });
      return;
    }

    response.json(recipe);
  } catch {
    response.status(500).json({ error: "Could not parse recipe." });
  }
});

app.listen(port, () => {
  console.log(`Cookbook Cabinet API listening on port ${port}`);
});

function parseRecipeJSON(text = "") {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const ingredients = cleanStringArray(parsed.ingredients);
    const instructions = cleanStringArray(parsed.instructions);

    if (!title || ingredients.length === 0 || instructions.length === 0) {
      return null;
    }

    return { title, ingredients, instructions };
  } catch {
    return null;
  }
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

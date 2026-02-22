import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if the API key is present
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export async function POST(req: Request) {
    if (!openai) {
        return NextResponse.json({
            joke: "Why did the student eat his homework? Because the teacher told him it was a piece of cake! (Mocked due to missing API Key)",
            writingPrompt: "Imagine you discovered a hidden door in your classroom that leads to another dimension. Write a short story about what you found on the other side.",
            researchTopicTitle: "The Deep Sea",
            researchTopicDesc: "Explore the mysteries of the Mariana Trench. What kind of adaptations do creatures need to survive in total darkness and extreme pressure?"
        });
    }

    try {
        const { prompts } = await req.json();

        // Prepare the system message
        const systemMessage = `
            You are a creative educational assistant for a homeschool platform. 
            Generate three separate items for kids based on their current interests.
            Format the response strictly as a JSON object with these exact keys:
            - 'joke': A clean, school-appropriate joke with the setup and punchline.
            - 'writingPrompt': A creative, imaginative short writing prompt (2-3 sentences max).
            - 'researchTopicTitle': A short, catchy title for a research topic (max 5 words).
            - 'researchTopicDesc': A brief 2-3 sentence description instructing the student on what to explore about the topic.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: `Generate learning content. Previous prompts/interests: ${prompts ? JSON.stringify(prompts) : "General topics"}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });

        const result = completion.choices[0].message.content;

        if (!result) {
            throw new Error("No content generated");
        }

        const data = JSON.parse(result);

        return NextResponse.json(data);

    } catch (error) {
        console.error("OpenAI generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}

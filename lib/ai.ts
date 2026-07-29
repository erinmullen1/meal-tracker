import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const MealAnalysisSchema = z.object({
  foods_identified: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
    fiber_g: z.number(),
    sugar_g: z.number(),
    saturated_fat_g: z.number(),
    sodium_mg: z.number(),
  }),
  score: z.number().min(1).max(10),
  score_reason: z.string(),
  highlights: z.array(z.string()),
  concerns: z.array(z.string()),
});

export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;

export async function analyzeMeal(description: string): Promise<MealAnalysis> {
  const { object } = await generateObject({
    model: anthropic("claude-opus-4-8"),
    schema: MealAnalysisSchema,
    prompt: `You are a nutrition expert. Analyze the following meal description and provide accurate nutritional estimates.

Meal description: "${description}"

Provide:
- A list of foods you identified in the meal
- Nutritional values (be realistic based on typical serving sizes for the description given)
- A score from 1-10 based on overall nutritional quality (10 = excellent balance of macros, micronutrients, low in saturated fat/sugar/sodium; 1 = very poor)
- A brief score reason (2-3 sentences max)
- Key nutritional highlights (positive aspects, e.g. "high protein", "good fibre")
- Any nutritional concerns (e.g. "high saturated fat", "low fibre")

If portions aren't specified, use typical/average restaurant or home serving sizes. Be specific and realistic with values.`,
  });

  return object;
}

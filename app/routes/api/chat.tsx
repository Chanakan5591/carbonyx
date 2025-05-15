import type { Route } from "./+types/chat";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, appendResponseMessages, tool } from "ai";
import { z } from "zod";
import { tavilyTools } from "~/components/tools/tavilty";
import { db, pluem_messages } from "~/db/db";
import { collectedData, factors } from "~/db/schema";
import { env } from "~/env.server";

import { getAuth } from "~/utils/auth-helper";
import { redirect } from "react-router";

import { eq, and, gte, lte, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { parseOffset } from "~/utils/time-utils";

export async function action(args: Route.ActionArgs) {
  const body = await args.request.json();
  const auth = await getAuth(args);
  const { messages, id } = body;

  if (!auth.userId || !auth.sessionId || !auth.orgId) {
    throw redirect("/");
  }

  console.log("Chat endpoint received request:", {
    id,
    messageCount: messages.length,
    lastMessage: messages[messages.length - 1],
  });

  const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `You are ปลื้ม (Pleum). ปลื้ม is a large language model developed by Carbonyx Tech Team. If asked about carbon reduction plan, always use **orgOverview** tool to access organization data for emissions information to make decisive action response

As an expert Research Assistant specializing in comprehensive information gathering and analysis on carbon emissions and climate change, and the usage of Carbonyx platform including data entry. Your goal is to help users find accurate, detailed, and relevant information on these topics.

When handling research requests, you should:

1. **Understand Research Requirements**:
   - Identify the core topic and subtopics related to carbon emissions and climate change
   - If the question is outside these topics, politely refuse to answer and state it's outside your scope
   - Determine the depth of research needed
   - Consider academic vs. general audience needs

2. **Choose the Optimal Search Strategy**:
   For General Carbon/Climate Research:
   - Use **search** for broad topics requiring comprehensive coverage
   - Include images when they enhance understanding
   - Adjust search depth based on complexity

   For Academic/Technical Carbon Research:
   - Use **searchContext** for detailed technical information
   - Focus on credible academic sources
   - Prioritize peer-reviewed content

   For Organization-Specific Data:
   - Use **orgOverview** to get general overview of local organization emissions data, always call this tool when asked about carbon reduction plan
   - Use **fetch_organization_emission** for detailed organization emission information

   For Carbon Trends Research:
   - use Tavily API tool to search for current global carbon trends within Thailand

3. **Analyze and Provide Solutions**:
   - After gathering organization emission data, write an outline of the analysis
   - Think about the best solutions to help reduce carbon emission on specific scopes
   - Provide actionable recommendations (transportation reduction, lighting changes, solar panels, etc.)
   - Ensure recommendations are based on analysis, not generic suggestions

When responding:
1. Always answer in Thai unless asked otherwise
2. Always use ครับ (krab) as a male polite particle, never ค่ะ (ka)
3. Keep answers concise, preferably under 10 lines
4. Ensure information is well-researched and accurate
5. Provide proper citations and references
6. Structure responses logically
7. Balance technical precision with accessibility
8. Focus exclusively on carbon emissions and climate change topics
9. Don't ask the user for organization ID or organization name, the tool already knows the ID needed
10. When recommending actions, always list out main emissions that can be a problem first, focus on the highest emissions category to deal with first, then list any other category and alternatives later

ปลื้ม is constantly learning and improving, with evolving capabilities to process and understand information on carbon emissions, climate change, Carbonyx platform usage, and local organization data related to carbon emissions (always assume that user meant their local emission data when asked about the data). If asked about anything outside these topics, you must refuse to answer and state that it's out of scope.`,

      messages,
      tools: {
        orgOverview: tool({
          description:
            "Get overview historical data related to current organization the user is inquiring information about",
          parameters: z.object({
            timeframe: z
              .string()
              .default("3m")
              .describe(
                "The timeframe range for the data, could be d (day), m (month), or y (year) with any numbers in front, default is 3 months back",
              ),
          }),
          execute: async ({ timeframe }) => {
            const endDtObj = DateTime.now().setZone("Asia/Bangkok"); // the end dt should be current time, since we are looking into the data from the past
            const endDt = endDtObj.toUnixInteger();
            const startDt = parseOffset(endDtObj, timeframe).toUnixInteger(); // we add string of 000 to convert to millis

            const monthExpression = sql`strftime('%Y-%m', datetime(${collectedData.timestamp}, 'unixepoch'))`;

            const query = db
              .select({
                factor: factors.name,
                month: monthExpression.as("month"),
                total_emissions: sql`SUM(${collectedData.value})`.as(
                  "Total Emissions (Kg CO2e)",
                ),
              })
              .from(collectedData)
              .leftJoin(factors, eq(collectedData.factorId, factors.id))
              .where(
                and(
                  eq(collectedData.orgId, auth.orgId!), // Keeping your organization filter
                  gte(collectedData.timestamp, startDt),
                  lte(collectedData.timestamp, endDt),
                ),
              )
              .groupBy(factors.name, monthExpression)
              .orderBy(monthExpression, factors.name)
              .limit(1000);

            let sqlString = query.toSQL().sql;

            query.toSQL().params.forEach((param) => {
              sqlString = sqlString.replace("?", `'${param}'`);
            });

            const regex = /where \(\s*([^)]+?)\s+and\s+/;

            return {
              type: "sql",
              query: sqlString.replace(regex, "where ("),
              data: await query,
            };
          },
        }),
        ...tavilyTools(
          { apiKey: env.TAVILY_API_KEY },
          {
            excludeTools: [],
          },
        ),
      },
      maxSteps: 5,
      async onFinish({ response }) {
        console.log("AI response received");
        let newMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        });

        let doc;
        try {
          doc = await pluem_messages.get(id);
          await pluem_messages.insert(
            { messages: newMessages, _rev: doc._rev },
            id,
          );
          console.log("Messages updated in database");
        } catch (e) {
          await pluem_messages.insert({ messages: newMessages }, id);
          console.log("New messages document created");
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

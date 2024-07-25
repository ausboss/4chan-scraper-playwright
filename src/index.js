import { extract4chanThread } from "./utils/threadExtractor.js";
import ollama from "ollama";
import fs from "fs/promises";

function preprocessPosts(posts) {
  // Skip the first post (OP) and filter out posts with blank messages
  return posts
    .slice(1)
    .filter((post) => post.message.trim() !== "")
    .map((post) => `${post.name} No.${post.postId}\n${post.message.trim()}\n\n`)
    .join("");
}

async function saveToFile(content, filename) {
  try {
    await fs.writeFile(filename, content, "utf8");
    console.log(`Content saved to ${filename}`);
  } catch (error) {
    console.error(`Error writing to file: ${error}`);
  }
}

async function generateDetailedReport(processedPosts) {
  const systemPrompt = {
    role: "system",
    content: `You are an AI assistant tasked with analyzing discussions from the 4chan /g/ board's "Local Models General" (LMG) thread. Your goal is to produce a detailed report covering the following aspects:
1. New Language Models: Identify and describe any new models mentioned, including their features and potential impact.
2. Popular Models: List and analyze the most frequently discussed or recommended models.
3. Current Trends: Identify and explain emerging trends in local language model usage and development.
4. Interesting Applications: Describe novel or noteworthy use cases for local language models.
5. Technical Discussions: Summarize any significant technical debates, breakthroughs, or challenges mentioned.
6. Community Sentiment: Analyze the overall mood and opinions of the community regarding local language models.
7. Comparisons and Benchmarks: Note any performance comparisons or benchmark results shared.
8. Resources and Tools: List any helpful resources, tools, or tutorials mentioned for working with local language models.
Provide a comprehensive report that captures the most relevant and insightful information from the thread, offering a deep dive into the current state of the local language model community. Use concrete examples and quotes where relevant.`,
  };

  const userPrompt = {
    role: "user",
    content: `Please analyze the following posts from a 4chan LMG thread and generate a detailed report:\n\n${processedPosts}`,
  };

  const response = await ollama.chat({
    model: "llama3.1",
    messages: [systemPrompt, userPrompt],
  });

  return response.message.content;
}

async function main() {
  console.log("Extracting posts from the most popular /lmg/ thread...");
  const extractedPosts = await extract4chanThread("g", [
    "/lmg/",
    "Local Models General",
  ]);

  if (extractedPosts.length > 0 && !extractedPosts[0].error) {
    const processedPosts = preprocessPosts(extractedPosts);

    console.log("Thread Analysis:");
    console.log(`Total Original Posts: ${extractedPosts.length}`);
    console.log(`Processed Posts: ${extractedPosts.length - 1}`); // Subtract 1 for the skipped OP

    if (processedPosts.length > 0) {
      // Save processed posts to a file
      const filename = "processed_posts.txt";
      await saveToFile(processedPosts, filename);

      console.log("\nGenerating detailed report...");
      const report = await generateDetailedReport(processedPosts);
      console.log("\nDetailed Report:");
      console.log(report);

      // Optionally, save the report to a file as well
      await saveToFile(report, "llm_report.txt");
    } else {
      console.log("\nNo valid posts found for analysis after preprocessing.");
    }
  } else {
    console.error("Error:", extractedPosts[0].error);
  }
}

main().catch(console.error);

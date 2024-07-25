import { extract4chanThread } from "./utils/threadExtractor.js";

async function main() {
  console.log("Extracting posts from the most popular /lmg/ thread...");
  const extractedText = await extract4chanThread("g", [
    "/lmg/",
    "Local Models General",
  ]);
  console.log(extractedText);
}

main().catch(console.error);

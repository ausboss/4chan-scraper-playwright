import { chromium } from "playwright";

async function extract4chanThread(board, subjectTexts) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let extractedText = "";

  try {
    await page.goto(`https://boards.4chan.org/${board}/catalog`);

    // Construct regex from subjectTexts
    const subjectRegex = new RegExp(
      subjectTexts
        .map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|"),
      "i"
    );

    // Find all matching threads
    const threadLocators = page.locator(".thread", {
      has: page.locator(".teaser", { hasText: subjectRegex }),
    });

    // Wait for the threads to be visible
    await page.waitForSelector(".thread", { state: "visible", timeout: 30000 });

    // Get all matching threads
    const threads = await threadLocators.all();

    if (threads.length === 0) {
      throw new Error("No matching threads found");
    }

    // Find the thread with the most replies
    let maxReplies = 0;
    let selectedThread;

    for (const thread of threads) {
      const metaElement = await thread.locator(".meta").first();
      const replyCountText = await metaElement.locator("b").first().innerText();
      const replyCount = parseInt(replyCountText, 10);

      if (replyCount > maxReplies) {
        maxReplies = replyCount;
        selectedThread = thread;
      }
    }

    // Get the URL of the selected thread
    const threadUrl = await selectedThread
      .locator("a:not(.postMenuBtn)")
      .first()
      .getAttribute("href");

    if (!threadUrl) {
      throw new Error("Failed to extract thread URL");
    }

    // Navigate to the thread
    await page.goto(`https:${threadUrl}`, { timeout: 30000 });

    // Extract all posts
    const posts = await page.$$eval(".post", (elements) => {
      return elements.map((el) => {
        const postInfo = el.querySelector(".postInfo");
        const postMessage = el.querySelector(".postMessage");
        const fileText = el.querySelector(".fileText");

        const name = postInfo.querySelector(".name")?.innerText || "Anonymous";
        const dateTime = postInfo.querySelector(".dateTime")?.innerText || "";
        const postId =
          postInfo.querySelector(".postNum a:last-child")?.innerText || "";
        const message = postMessage?.innerText || "";

        let imageInfo = null;
        if (fileText) {
          const imageLink = fileText.querySelector("a");
          if (imageLink) {
            imageInfo = {
              filename: imageLink.innerText,
              url: imageLink.href,
            };
          }
        }

        return { name, dateTime, postId, message, imageInfo };
      });
    });

    // Format the extracted posts
    posts.forEach((post) => {
      let formattedPost = `${post.name} ${post.dateTime} No.${post.postId}\n`;
      formattedPost += `${post.message}\n`;
      if (post.imageInfo) {
        formattedPost += `Image: ${post.imageInfo.filename} (${post.imageInfo.url})\n`;
      }
      formattedPost += "---\n";
      extractedText += formattedPost;
    });
  } catch (error) {
    console.error("An error occurred:", error);
    extractedText = `Error: ${error.message}`;
  } finally {
    await browser.close();
  }

  return extractedText;
}

export { extract4chanThread };

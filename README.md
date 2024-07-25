# 4chan Thread Extractor

This project is a Node.js application that extracts posts from the most popular thread matching specific subjects on any 4chan board.

## Features

- Flexibly search for 'general' threads or any thread by subject on any 4chan board
- Specify multiple subject texts to match threads subject line
- Automatically finds the most popular matching thread
- Extracts all posts from the thread, including text and image information
- Returns the extracted data as a formatted string

## Todo

- Improve the formatting of the extracted text

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/4chan-thread-extractor.git
   ```
2. Navigate to the project directory:
   ```
   cd 4chan-thread-extractor
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Project Structure

```
4chan-thread-extractor/
├── src/
│   ├── index.js
│   └── utils/
│       └── threadExtractor.js
├── package.json
└── README.md
```

- `src/index.js`: The entry point of the application
- `src/utils/threadExtractor.js`: Contains the main function for extracting the thread data
- `package.json`: Project configuration and dependencies

## Usage

The main function `extract4chanThread` in `src/utils/threadExtractor.js` takes two parameters:

1. `board`: The 4chan board to search (e.g., "g" for /g/, "v" for /v/, etc.)
2. `subjectTexts`: An array of strings to match in thread subjects

To run the script, you can modify `src/index.js` to search for specific threads. For example, to search for "/lmg/" threads on /g/:

```javascript
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
```

Then run the script using:

```
npm start
```

This will execute the script and print the extracted posts to the console.

### Examples

1. To scrape the local models general thread on /g/:

   ```javascript
   const extractedText = await extract4chanThread("g", [
     "/lmg/",
     "Local Models General",
   ]);
   ```

2. To scrape the Fortnite General on /vg/:
   ```javascript
   const extractedText = await extract4chanThread("vg", [
     "/fng/",
     "Fortnite General",
   ]);
   ```

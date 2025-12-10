/**
 * @file generate-docs.ts
 * @description Automatic documentation generation from code annotations
 * @chapter documentation
 *
 * This script generates comprehensive documentation by:
 * - Parsing JSDoc/TSDoc comments from contracts and tests
 * - Extracting metadata tags (category, chapter, description)
 * - Creating markdown files organized by category
 * - Generating API reference documentation
 * - Creating GitBook-compatible structure
 */

import * as fs from "fs";
import * as path from "path";

interface DocMetadata {
  name: string;
  category: string;
  chapter: string;
  description: string;
  example?: string;
}

interface ApiDoc {
  contract: string;
  functions: {
    name: string;
    params: string[];
    returns: string;
    description: string;
  }[];
}

/**
 * Extract JSDoc comments from Solidity code
 */
function extractSolidityDocs(filePath: string): DocMetadata[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const docs: DocMetadata[] = [];

  // Match JSDoc comments followed by function/contract declarations
  const docRegex = /\/\*\*\n([\s\S]*?)\*\/\s*(contract|function)/g;
  let match;

  while ((match = docRegex.exec(content)) !== null) {
    const commentBlock = match[1];
    const type = match[2];

    const titleMatch = commentBlock.match(/@title\s+(.+)/);
    const categoryMatch = commentBlock.match(/@category\s+(.+)/);
    const chapterMatch = commentBlock.match(/@chapter\s+(.+)/);
    const descMatch = commentBlock.match(/@notice\s+(.+)/);

    if (titleMatch) {
      docs.push({
        name: titleMatch[1].trim(),
        category: categoryMatch ? categoryMatch[1].trim() : "general",
        chapter: chapterMatch ? chapterMatch[1].trim() : "general",
        description: descMatch ? descMatch[1].trim() : "",
      });
    }
  }

  return docs;
}

/**
 * Extract test documentation from TypeScript test files
 */
function extractTestDocs(filePath: string): DocMetadata[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const docs: DocMetadata[] = [];

  // Match test descriptions with metadata
  const testRegex = /it\("([^"]+)",[\s\S]*?\{[\s\S]*?\}\);/g;
  const docRegex = /\/\*\*\n([\s\S]*?)\*\/\s*it\(/g;

  // Match comments before tests
  let match;
  const commentLines = content.split("\n");

  for (let i = 0; i < commentLines.length; i++) {
    if (commentLines[i].includes("/**")) {
      let commentBlock = "";
      let j = i;

      while (j < commentLines.length && !commentLines[j].includes("*/")) {
        commentBlock += commentLines[j] + "\n";
        j++;
      }
      commentBlock += commentLines[j];

      const testLine = commentLines[j + 1];
      if (testLine && testLine.includes('it("')) {
        const testMatch = testLine.match(/it\("([^"]+)"/);
        if (testMatch) {
          const categoryMatch = commentBlock.match(/@category\s+(.+)/);
          const chapterMatch = commentBlock.match(/@chapter\s+(.+)/);
          const descMatch = commentBlock.match(/@description\s+(.+)/);

          docs.push({
            name: testMatch[1],
            category: categoryMatch ? categoryMatch[1].trim() : "general",
            chapter: chapterMatch ? chapterMatch[1].trim() : "general",
            description: descMatch ? descMatch[1].trim() : "",
          });
        }
      }

      i = j;
    }
  }

  return docs;
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(docs: DocMetadata[], outputPath: string): void {
  // Group by chapter
  const byChapter: Record<string, DocMetadata[]> = {};

  docs.forEach((doc) => {
    if (!byChapter[doc.chapter]) {
      byChapter[doc.chapter] = [];
    }
    byChapter[doc.chapter].push(doc);
  });

  // Create chapter files
  Object.entries(byChapter).forEach(([chapter, items]) => {
    const filename = chapter.toLowerCase().replace(/\s+/g, "-");
    const filepath = path.join(outputPath, `${filename}.md`);

    let content = `# ${chapter} Examples\n\n`;

    // Group by category
    const byCategory: Record<string, DocMetadata[]> = {};
    items.forEach((item) => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    Object.entries(byCategory).forEach(([category, categoryItems]) => {
      content += `## ${category}\n\n`;

      categoryItems.forEach((item) => {
        content += `### ${item.name}\n\n`;
        if (item.description) {
          content += `${item.description}\n\n`;
        }
        content += "---\n\n";
      });
    });

    fs.writeFileSync(filepath, content);
    console.log(`Generated: ${filepath}`);
  });
}

/**
 * Generate API reference
 */
function generateAPIReference(contractPath: string, outputPath: string): void {
  const content = fs.readFileSync(contractPath, "utf-8");
  let apiDoc = `# API Reference\n\n`;

  // Extract contract name
  const contractMatch = content.match(/contract\s+(\w+)/);
  const contractName = contractMatch ? contractMatch[1] : "Contract";

  apiDoc += `## ${contractName}\n\n`;

  // Extract functions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)[^{]*\{/g;
  let match;

  const functions: string[] = [];
  while ((match = functionRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }

  if (functions.length > 0) {
    apiDoc += "### Functions\n\n";
    functions.forEach((fn) => {
      apiDoc += `- \`${fn}()\`\n`;
    });
    apiDoc += "\n";
  }

  const apiPath = path.join(outputPath, "api-reference.md");
  fs.writeFileSync(apiPath, apiDoc);
  console.log(`Generated: ${apiPath}`);
}

/**
 * Main documentation generation
 */
function generateDocumentation(): void {
  const docsDir = path.join(process.cwd(), "docs");

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Collect documentation
  const allDocs: DocMetadata[] = [];

  // Process test files
  const testDir = path.join(process.cwd(), "test");
  if (fs.existsSync(testDir)) {
    fs.readdirSync(testDir).forEach((file) => {
      if (file.endsWith(".test.ts") || file.endsWith(".spec.ts")) {
        const testDocs = extractTestDocs(path.join(testDir, file));
        allDocs.push(...testDocs);
      }
    });
  }

  // Process contract files
  const contractDir = path.join(process.cwd(), "contracts");
  if (fs.existsSync(contractDir)) {
    fs.readdirSync(contractDir).forEach((file) => {
      if (file.endsWith(".sol")) {
        const solidityDocs = extractSolidityDocs(path.join(contractDir, file));
        allDocs.push(...solidityDocs);

        // Generate API reference
        generateAPIReference(
          path.join(contractDir, file),
          docsDir
        );
      }
    });
  }

  // Generate markdown files
  if (allDocs.length > 0) {
    generateMarkdown(allDocs, docsDir);
  }

  console.log(`Documentation generated in: ${docsDir}`);
}

// Run documentation generation
generateDocumentation();

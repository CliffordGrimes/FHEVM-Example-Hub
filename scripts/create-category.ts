/**
 * @file create-category.ts
 * @description Create category-based example groups
 *
 * This script creates organized collections of examples by category,
 * making it easy to understand and learn related FHE patterns together.
 */

import * as fs from "fs";
import * as path from "path";

interface Category {
  name: string;
  description: string;
  examples: string[];
  concepts: string[];
}

/**
 * Available category definitions
 */
const CATEGORIES: Record<string, Category> = {
  "basic-operations": {
    name: "Basic Operations",
    description: "Fundamental FHE operations and patterns",
    examples: ["encrypted-counter", "encrypted-arithmetic"],
    concepts: ["Addition", "Subtraction", "Multiplication", "Storage"],
  },
  "encryption-patterns": {
    name: "Encryption Patterns",
    description: "Different approaches to encrypting data",
    examples: ["single-value-encryption", "multi-value-encryption"],
    concepts: [
      "Encryption",
      "Encrypted Types",
      "Storage",
      "Permissions",
    ],
  },
  "access-control": {
    name: "Access Control",
    description: "Managing permissions and access to encrypted data",
    examples: ["access-control-system", "role-based-permissions"],
    concepts: [
      "Authorization",
      "Roles",
      "Permissions",
      "Access Grants",
    ],
  },
  "decryption-patterns": {
    name: "Decryption Patterns",
    description: "How to decrypt and use encrypted results",
    examples: ["user-decryption", "public-decryption"],
    concepts: [
      "User Decryption",
      "Public Decryption",
      "Result Publication",
    ],
  },
  "advanced-patterns": {
    name: "Advanced Patterns",
    description: "Complex scenarios combining multiple FHE concepts",
    examples: ["inventory-management", "blind-auction"],
    concepts: [
      "Complex Computations",
      "Multi-Role Systems",
      "Event Logging",
      "State Management",
    ],
  },
};

/**
 * Generate category documentation
 */
function generateCategoryDocs(category: Category, outputPath: string): void {
  let content = `# ${category.name}\n\n`;
  content += `${category.description}\n\n`;

  content += "## Concepts Covered\n\n";
  category.concepts.forEach((concept) => {
    content += `- ${concept}\n`;
  });
  content += "\n";

  content += "## Examples\n\n";
  category.examples.forEach((example) => {
    content += `- [${example}](../examples/${example}/README.md)\n`;
  });
  content += "\n";

  content += "## Learning Path\n\n";
  content += "Start with the first example and work through each one to build your understanding of these concepts.\n";

  const filepath = path.join(outputPath, "CATEGORY.md");
  fs.writeFileSync(filepath, content);
  console.log(`Generated category docs: ${filepath}`);
}

/**
 * Create category directories and structure
 */
function createCategoryStructure(categoryKey: string, outputDir: string): void {
  const category = CATEGORIES[categoryKey];

  if (!category) {
    console.error(`Unknown category: ${categoryKey}`);
    return;
  }

  const categoryPath = path.join(outputDir, categoryKey);

  // Create directory
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }

  // Generate documentation
  generateCategoryDocs(category, categoryPath);

  // Create category index
  let indexContent = `# ${category.name}\n\n`;
  indexContent += `${category.description}\n\n`;
  indexContent += "## Contents\n\n";

  category.examples.forEach((example) => {
    indexContent += `- [${example}](${example}/)\n`;
  });

  const indexPath = path.join(categoryPath, "README.md");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Created category structure: ${categoryPath}`);
}

/**
 * List all categories
 */
function listCategories(): void {
  console.log("Available Categories:\n");

  Object.entries(CATEGORIES).forEach(([key, category]) => {
    console.log(`📚 ${category.name} (${key})`);
    console.log(`   ${category.description}`);
    console.log(`   Examples: ${category.examples.join(", ")}`);
    console.log(`   Concepts: ${category.concepts.join(", ")}`);
    console.log();
  });
}

/**
 * Generate all categories
 */
function generateAllCategories(outputDir: string): void {
  console.log("Generating all categories...\n");

  Object.keys(CATEGORIES).forEach((categoryKey) => {
    createCategoryStructure(categoryKey, outputDir);
  });

  // Create main categories index
  let mainIndex = "# FHEVM Example Categories\n\n";
  mainIndex +=
    "This section organizes examples by learning category.\n\n";

  Object.entries(CATEGORIES).forEach(([key, category]) => {
    mainIndex += `## [${category.name}](./${key}/README.md)\n\n`;
    mainIndex += `${category.description}\n\n`;
  });

  const mainIndexPath = path.join(outputDir, "CATEGORIES.md");
  fs.writeFileSync(mainIndexPath, mainIndex);
  console.log(`Generated categories index: ${mainIndexPath}`);
}

/**
 * Main entry point
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("FHEVM Category Generator");
    console.log("\nUsage: npx ts-node scripts/create-category.ts [command]");
    console.log("\nCommands:");
    console.log("  list                - List all available categories");
    console.log("  create <category>   - Create a single category");
    console.log("  create-all [dir]    - Create all categories");
    console.log("  help                - Show this help message");
    return;
  }

  const command = args[0];

  switch (command) {
    case "list":
      listCategories();
      break;

    case "create":
      if (args.length < 2) {
        console.error("Error: Please specify a category name");
        console.error("Use 'list' command to see available categories");
        process.exit(1);
      }

      const categoryKey = args[1];
      const categoryOutputDir = args[2] || "./docs/categories";

      createCategoryStructure(categoryKey, categoryOutputDir);
      break;

    case "create-all":
      const outputDir = args[1] || "./docs/categories";

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      generateAllCategories(outputDir);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error("Use --help for usage information");
      process.exit(1);
  }
}

// Run the script
main();

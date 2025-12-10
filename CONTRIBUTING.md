# Contributing Guide

Thank you for your interest in contributing to the FHEVM Example Hub! This guide will help you get started.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Adding New Examples](#adding-new-examples)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Submitting Changes](#submitting-changes)
8. [Review Process](#review-process)

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- Basic Solidity knowledge
- Understanding of FHEVM concepts

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/zama-ai/fhevm-examples.git
cd fhevm-examples

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature-name
```

### Verify Setup

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Check linting
npm run lint
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Create descriptive branch name
git checkout -b feature/add-blind-auction
# or
git checkout -b fix/storage-optimization
# or
git checkout -b docs/improve-guides
```

### 2. Make Changes

```bash
# Edit files in your favorite editor
# Follow code standards (see below)
# Add JSDoc comments
# Write tests for new code
```

### 3. Test Changes

```bash
# Compile
npm run compile

# Run tests
npm run test

# Check coverage
npm run test:coverage

# Lint code
npm run lint
npm run format
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add blind auction example"

# Or: git commit -m "fix: improve gas efficiency"
# Or: git commit -m "docs: add deployment guide"
```

### 5. Push & Create Pull Request

```bash
# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
# Add description of changes
# Link any related issues
```

---

## Code Standards

### Solidity Code Style

#### File Organization
```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ContractName
 * @notice Brief description
 * @dev Implementation details
 */
contract ContractName is ZamaEthereumConfig {
    // Events
    event EventName(parameters);

    // State variables
    euint32 private encryptedValue;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Functions
    function functionName() external {
        // Implementation
    }
}
```

#### Naming Conventions
- **Contracts**: PascalCase (`FHECounter`)
- **Functions**: camelCase (`addInventoryItem`)
- **Variables**: camelCase (`encryptedValue`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Private variables**: Leading underscore (`_privateValue`)

#### Comments & Documentation
```solidity
/// @title Contract title
/// @notice What this contract does
/// @dev Implementation details

/**
 * @notice Function description
 * @param param1 Parameter description
 * @param param2 Another parameter
 * @return Description of return value
 */
function myFunction(uint256 param1, address param2)
    external
    returns (uint256)
{
    // Implementation
}
```

#### Formatting Rules
- Max line length: 120 characters
- Indentation: 4 spaces (no tabs)
- One contract per file
- Organize by visibility: public, external, internal, private
- Organize by state mutation: pure, view, state-changing

### TypeScript Code Style

#### File Organization
```typescript
// Imports
import { ethers } from "hardhat";
import { expect } from "chai";

// Types
interface TestConfig {
    value: number;
}

// Constants
const INITIAL_VALUE = 100;

// Main code
describe("ContractName", function () {
    // Tests
});
```

#### Naming Conventions
- **Files**: kebab-case (`inventory-management.ts`)
- **Classes**: PascalCase (`InventoryManager`)
- **Functions**: camelCase (`processOrder`)
- **Variables**: camelCase (`encryptedValue`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)

#### Code Quality
- Use `const` by default
- Use `let` only when necessary
- Use `var` never
- Always use explicit types
- Avoid `any` type

### JSDoc/TSDoc Comments

```typescript
/**
 * @test Descriptive test name
 * @category Category name (e.g., encryption, access-control)
 * @chapter Chapter name for documentation
 * @description Longer description of what is being tested
 */
it("should do something specific", async function () {
    // Test implementation
});
```

### Linting & Formatting

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Check for issues without fixing
npm run lint
```

---

## Adding New Examples

### Step 1: Plan Your Example

Define:
- **Concept**: What FHE pattern does it demonstrate?
- **Complexity**: Beginner, Intermediate, or Advanced?
- **Category**: Which category does it fit?
- **Educational Value**: What will developers learn?

### Step 2: Create Contract File

1. Create file: `examples/YourExample.sol`
2. Implement smart contract
3. Add comprehensive JSDoc comments
4. Include all necessary FHE operations
5. Add security checks and validations

Example template:
```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Example Name
 * @notice One-line description
 * @dev Detailed explanation of the pattern demonstrated
 * @chapter category-name
 */
contract ExampleName is ZamaEthereumConfig {
    // Implementation
}
```

### Step 3: Create Test File

1. Create file: `test/YourExample.test.ts`
2. Write comprehensive tests (10+ test cases)
3. Test all functions and branches
4. Test error conditions
5. Add JSDoc comments with category tags

Test template:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @test Example Contract Test Suite
 * @chapter category-name
 */
describe("ExampleName", function () {
    let contract: Contract;
    let owner: Signer;

    before(async function () {
        const [ownerSigner] = await ethers.getSigners();
        owner = ownerSigner;

        const ContractFactory = await ethers.getContractFactory("ExampleName");
        contract = await ContractFactory.deploy();
        await contract.waitForDeployment();
    });

    /**
     * @test Should deploy successfully
     * @category basic
     */
    it("should deploy", async function () {
        expect(contract.target).to.not.equal(ethers.ZeroAddress);
    });

    // More tests...
});
```

### Step 4: Update Documentation

1. Add example to `EXAMPLES.md`
2. Document key concepts
3. Include code samples
4. Provide learning outcomes
5. Link to tests

### Step 5: Update Category System

1. Run category generator:
   ```bash
   npx ts-node scripts/create-category.ts create-all
   ```
2. Update `create-example.ts` with new template
3. Test example generation

### Step 6: Verify Quality

```bash
# Compile
npm run compile

# Test
npm run test test/YourExample.test.ts

# Check coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

---

## Testing

### Test Requirements

- Minimum 10 tests per example
- 90%+ code coverage target
- Test all functions
- Test error conditions
- Test edge cases
- Include integration tests

### Test Categories

```typescript
describe("Category", function () {
    describe("Subcategory", function () {
        /**
         * @test Test description
         * @category basic
         */
        it("should test specific functionality", async function () {
            // Test implementation
        });
    });
});
```

### Best Practices

```typescript
// DO: Use descriptive test names
it("should add encrypted values correctly", async function () {
    const result = await contract.add(value1, value2);
    expect(result).to.equal(expectedSum);
});

// DON'T: Use vague test names
it("should work", async function () {
    // Not clear what's being tested
});

// DO: Test error conditions
it("should reject unauthorized access", async function () {
    await expect(
        contract.connect(unauthorized).restrictedFunction()
    ).to.be.revertedWith("Not authorized");
});

// DON'T: Forget to test errors
it("should work", async function () {
    await contract.someFunction();
    // Missing error condition tests
});
```

---

## Documentation

### Update Relevant Files

1. **README.md**: Add overview of new example
2. **EXAMPLES.md**: Detailed example description
3. **DEVELOPER_GUIDE.md**: Development instructions
4. **API_REFERENCE.md**: Function documentation

### Documentation Standards

- Use clear, professional English
- Include code examples
- Explain FHE concepts
- Document security considerations
- Provide use cases
- Add links to related resources

### Generate Documentation

```bash
npm run docs:generate
```

---

## Submitting Changes

### Before Submitting

1. **Run all checks**:
   ```bash
   npm run compile
   npm run test
   npm run lint
   npm run format
   ```

2. **Update documentation**
3. **Test locally**
4. **Review your changes**

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New Example
- [ ] Bug Fix
- [ ] Documentation
- [ ] Enhancement
- [ ] Configuration

## Related Issues
Closes #123

## Testing
- [ ] All tests pass
- [ ] Added new tests
- [ ] Coverage maintained

## Documentation
- [ ] Updated README.md
- [ ] Updated EXAMPLES.md
- [ ] Added JSDoc comments
- [ ] Updated relevant guides

## Checklist
- [ ] Code follows standards
- [ ] No linting errors
- [ ] Tests passing
- [ ] Documentation complete
```

### What Gets Reviewed

- Code quality and standards
- Test coverage and quality
- Documentation completeness
- Security considerations
- FHE pattern correctness
- Gas efficiency

---

## Review Process

### Code Review Checklist

Reviewers check:

1. **Functionality**
   - Does it work as intended?
   - Are all features implemented?
   - Are edge cases handled?

2. **Quality**
   - Follows code standards
   - Proper naming conventions
   - Clear comments and documentation

3. **Testing**
   - Sufficient test coverage
   - Tests are meaningful
   - Edge cases tested

4. **Security**
   - Proper access control
   - Input validation
   - No security vulnerabilities

5. **Documentation**
   - Clear and complete
   - Examples provided
   - Links to resources

### Feedback & Changes

- Review comments explain reasoning
- Discussion encouraged
- Changes requested are clear
- Testing expectations outlined

---

## Common Contribution Types

### Adding a New Example

See [Adding New Examples](#adding-new-examples) section.

### Improving Documentation

```bash
# Edit documentation files
# Run docs generator if needed
npm run docs:generate

# Commit with type "docs:"
git commit -m "docs: improve deployment guide"
```

### Fixing Bugs

```bash
# Create bug fix branch
git checkout -b fix/issue-description

# Fix the bug
# Add test case for the bug
# Document the fix

git commit -m "fix: resolve issue with XYZ"
```

### Improving Performance

```bash
# Create optimization branch
git checkout -b perf/optimization-description

# Improve performance
# Verify tests still pass
# Document changes

git commit -m "perf: optimize gas usage in ABC"
```

### Updating Dependencies

```bash
# Update package.json
npm update

# Test thoroughly
npm run test

# Commit update
git commit -m "chore: update dependencies"
```

---

## Style Guide Summary

### Solidity
- PascalCase for contracts
- camelCase for functions/variables
- UPPER_SNAKE_CASE for constants
- Max 120 character lines
- 4-space indentation
- Comprehensive JSDoc

### TypeScript
- kebab-case for filenames
- PascalCase for classes
- camelCase for functions/variables
- Use const, avoid var
- Explicit types
- 2-space indentation

### General
- Clear, descriptive names
- Comments for complex logic
- Consistent formatting
- Following community standards

---

## Getting Help

### Questions About Contributing?

- **GitHub Discussions**: Ask questions in discussions
- **Discord**: Chat with maintainers on Discord
- **Issues**: Open an issue for clarification
- **Email**: Contact core team

### Resources

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Code of Conduct

- Be respectful and professional
- Welcome all contributors
- Provide constructive feedback
- Ask questions in good faith
- Respect diverse perspectives
- Report issues appropriately

---

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Community announcements
- Special thanks in documentation

---

**Happy Contributing!** 🚀

We appreciate your contributions to the FHEVM Example Hub community.

---

**Last Updated**: December 2025
**Version**: 1.0.0
**License**: BSD-3-Clause-Clear

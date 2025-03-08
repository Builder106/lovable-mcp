# Lovable MCP Plugin Development Protocol

⚠️ CRITICAL: DO NOT USE attempt_completion BEFORE TESTING ⚠️

## Step 1: Planning (PLAN MODE)
- Problem: Enhance Lovable.dev's AI capabilities with specialized UI/UX tools
- Core Features:
  ✓ UI Component Generation
  ✓ Design Pattern Implementation
  ✓ Frontend Bug Detection & Fixes
- Authentication:
  □ Standard API key (for accessing design resources)
  □ OAuth (for user-specific customizations)
  □ Other credentials (based on integrated services)

## Step 2: Implementation (ACT MODE)
1. Bootstrap
   - For web services, JavaScript integration, or Node.js environments:
     ```bash
     npx @modelcontextprotocol/create-server my-server
     cd my-server
     npm install
     ```
   - For data science, ML workflows, or Python environments:
     ```bash
     pip install mcp
     # Or with uv (recommended)
     uv add "mcp[cli]"
     ```

2. Core Implementation
   - Using Python MCP SDK
   - Implementing comprehensive logging:
     ```python
     import logging
     
     # Setup logging for Lovable MCP plugin
     logging.basicConfig(level=logging.INFO)
     logger = logging.getLogger('lovable_mcp')
     
     logger.info('[Setup] Initializing Lovable MCP server...')
     logger.info(f'[UI] Generating component: {component_type}')
     logger.error(f'[Error] Component generation failed: {str(error)}')
     ```
   - Type definitions with Pydantic:
     ```python
     from pydantic import BaseModel
     from enum import Enum
     
     class ComponentType(Enum):
         BUTTON = 'button'
         FORM = 'form'
         CARD = 'card'
         DIALOG = 'dialog'
         TABLE = 'table'
     
     class UIComponent(BaseModel):
         type: ComponentType
         props: dict
         styles: dict | None = None
         accessibility: dict | None = None
     
     class DesignPattern(BaseModel):
         pattern_type: str
         context: dict
         constraints: list[str] = []
     ```
   - Error handling with UI/UX context
   - Performance optimization for component generation

3. Configuration
   - Design system configuration:
     ```python
     from dotenv import load_dotenv
     import os
     
     load_dotenv()
     DESIGN_SYSTEM = os.getenv('DESIGN_SYSTEM', 'default')
     UI_FRAMEWORK = os.getenv('UI_FRAMEWORK', 'react')
     ```
   - MCP server configuration:
     ```json
     {
       "mcpServers": {
         "lovable-ui": {
           "command": "python",
           "args": ["server.py"],
           "env": {
             "DESIGN_SYSTEM": "tailwind",
             "UI_FRAMEWORK": "react"
           },
           "disabled": false,
           "autoApprove": ["generate_component", "apply_pattern"]
         }
       }
     }
     ```

## Step 3: Testing (BLOCKER ⛔️)

<thinking>
BEFORE using attempt_completion, I MUST verify:
□ Have I tested EVERY tool?
□ Have I confirmed success from the user for each test?
□ Have I documented the test results?

If ANY answer is "no", I MUST NOT use attempt_completion.
</thinking>

1. Test Each Tool (REQUIRED)
   □ Test UI Component Generation:
     - Generate basic components (buttons, forms)
     - Test complex components (tables, dialogs)
     - Verify accessibility compliance
     - Test responsive design output
   □ Test Design Pattern Implementation:
     - Apply common patterns (cards, lists)
     - Test pattern customization
     - Verify pattern constraints
   □ Test Bug Detection & Fixes:
     - Identify UI inconsistencies
     - Test fix suggestions
     - Verify fix applications
   ⚠️ DO NOT PROCEED UNTIL ALL TOOLS TESTED

## Step 4: Completion
❗ STOP AND VERIFY:
□ Every tool has been tested with valid inputs
□ Output format is correct for each tool

Only after ALL tools have been tested can attempt_completion be used.

## Key Requirements
- ✓ Using Python MCP SDK with aiohttp for async operations
- ✓ Comprehensive logging for UI/UX operations
- ✓ Type-safe component and pattern models
- ✓ Accessibility compliance checking
- ✓ Responsive design validation
- ✓ Performance optimization for component generation
- ⛔️ NEVER skip testing before completion
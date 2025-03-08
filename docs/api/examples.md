# Lovable MCP API Usage Examples

## Authentication
All requests require an API key in the `X-API-Key` header:
```bash
curl -H "X-API-Key: your_api_key" -X POST http://localhost:3000/generate_component
```

## Generate Component
Generate a button component with accessibility features:

```bash
curl -X POST http://localhost:3000/generate_component \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "button",
    "props": {
      "label": "Submit",
      "onClick": "handleSubmit"
    },
    "styles": {
      "backgroundColor": "blue",
      "color": "white",
      "padding": "10px 20px"
    },
    "accessibility": {
      "aria-label": "Submit form",
      "role": "button"
    }
  }'
```

Response:
```json
{
  "status": "success",
  "component": {
    "code": "...",
    "type": "button",
    "framework": "react",
    "design_system": "tailwind"
  }
}
```

## Apply Design Pattern
Apply a card pattern with specific constraints:

```bash
curl -X POST http://localhost:3000/apply_pattern \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_type": "card",
    "context": {
      "layout": "vertical",
      "components": ["image", "title", "description", "actions"],
      "theme": "light"
    },
    "constraints": [
      "responsive",
      "accessible",
      "theme-compatible"
    ]
  }'
```

Response:
```json
{
  "status": "success",
  "pattern": {
    "implementation": "...",
    "pattern_type": "card",
    "framework": "react"
  }
}
```

## Detect Bugs
Analyze code for UI/UX issues:

```bash
curl -X POST http://localhost:3000/detect_bugs \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function ProductCard({ title, price }) { return ( <div style={{ width: \"300px\" }}> <h3 style={{ fontSize: \"18px\" }}>{title}</h3> <p>{price}</p> <button>Add to Cart</button> </div> ); }",
    "context": {
      "framework": "react"
    }
  }'
```

Response:
```json
{
  "status": "success",
  "issues": [
    {
      "type": "style_inconsistency",
      "description": "Inline styles detected. Consider using design system classes.",
      "fix_suggestion": "Replace inline styles with Tailwind classes",
      "auto_fixable": true
    },
    {
      "type": "accessibility",
      "description": "Button missing aria-label",
      "fix_suggestion": "Add aria-label to button element",
      "auto_fixable": true
    }
  ]
}
```

## Error Handling

### Invalid Request (400)
```json
{
  "error": "Invalid component type. Allowed types are: button, form, card, dialog, table"
}
```

### Unauthorized (401)
```json
{
  "error": "API key required"
}
```

### Rate Limit Exceeded (429)
```json
{
  "error": "Too many requests. Please try again later."
}
```

### Server Error (500)
```json
{
  "error": "Internal server error occurred"
}
```

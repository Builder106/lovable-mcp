/**
 * WebView utilities for VS Code extension
 * Provides visualization of components and patterns
 */
import * as vscode from 'vscode';

/**
 * Creates and shows a component preview panel
 * 
 * @param {vscode.ExtensionContext} context The VS Code extension context
 * @param {string} componentCode The code for the component to preview
 * @param {Object} metadata Additional metadata about the component
 */
export function showComponentPreview(context, componentCode, metadata) {
  // Create and show a new webview panel
  const panel = vscode.window.createWebviewPanel(
    'lovableComponentPreview',
    `Preview: ${metadata.name || 'Component'}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'media')
      ]
    }
  );

  // Get the framework-specific wrapper
  let previewHtml;
  switch (metadata.framework) {
    case 'react':
      previewHtml = getReactPreview(componentCode, metadata);
      break;
    case 'vue':
      previewHtml = getVuePreview(componentCode, metadata);
      break;
    case 'angular':
      previewHtml = getAngularPreview(componentCode, metadata);
      break;
    case 'svelte':
      previewHtml = getSveltePreview(componentCode, metadata);
      break;
    default:
      previewHtml = getGenericPreview(componentCode, metadata);
  }
  
  // Update the webview content
  panel.webview.html = previewHtml;
  
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(message => {
    switch (message.command) {
      case 'updateProps':
        // Handle prop updates for live preview
        panel.webview.html = updatePreviewProps(previewHtml, message.props);
        return;
      case 'copyCode':
        // Copy code to clipboard
        vscode.env.clipboard.writeText(componentCode).then(() => {
          vscode.window.showInformationMessage('Component code copied to clipboard');
        });
        return;
    }
  });
  
  return panel;
}

/**
 * Creates and shows a pattern visualization panel
 * 
 * @param {vscode.ExtensionContext} context The VS Code extension context
 * @param {string} patternName The name of the pattern
 * @param {Object} visualizationData Data for visualizing the pattern structure
 */
export function showPatternVisualization(context, patternName, visualizationData) {
  // Create and show a new webview panel
  const panel = vscode.window.createWebviewPanel(
    'lovablePatternVisualization',
    `Pattern: ${patternName}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'media')
      ]
    }
  );
  
  // Get pattern HTML diagram
  const patternHtml = getPatternDiagram(patternName, visualizationData);
  
  // Update the webview content
  panel.webview.html = patternHtml;
  
  return panel;
}

/**
 * Generate React component preview HTML
 */
function getReactPreview(componentCode, metadata) {
  // Extract the component name from the code
  const componentNameMatch = componentCode.match(/export\s+(?:const|function)\s+(\w+)/);
  const componentName = componentNameMatch ? componentNameMatch[1] : 'Component';
  
  // Create sandbox HTML with React
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.name || 'Component'} Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .preview-container {
            max-width: 100%;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .preview-header h2 {
            margin: 0;
        }
        .preview-options {
            margin-bottom: 20px;
        }
        .preview-options label {
            display: block;
            margin: 10px 0 5px;
        }
        .render-area {
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 4px;
            min-height: 100px;
        }
        .preview-tabs {
            margin: 20px 0;
        }
        .preview-tabs button {
            padding: 8px 16px;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
        }
        .preview-tabs button.active {
            border-bottom: 2px solid #007acc;
        }
        .tab-content {
            display: none;
            padding: 20px 0;
        }
        .tab-content.active {
            display: block;
        }
        button {
            padding: 8px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        pre {
            background-color: var(--vscode-editor-background);
            padding: 12px;
            border-radius: 4px;
            overflow: auto;
        }
        .theme-toggle {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .theme-toggle label {
            margin-right: 10px;
        }
    </style>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    ${metadata.designSystem === 'tailwind' ? 
      '<script src="https://cdn.tailwindcss.com"></script>' : ''}
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <h2>${metadata.name} Preview</h2>
            <button id="copyButton">Copy Code</button>
        </div>
        
        <div class="preview-tabs">
            <button class="tab-button active" data-tab="preview">Preview</button>
            <button class="tab-button" data-tab="code">Code</button>
            <button class="tab-button" data-tab="props">Props</button>
        </div>
        
        <div id="preview" class="tab-content active">
            <div class="theme-toggle">
                <label for="theme-selector">Theme:</label>
                <select id="theme-selector">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
            <div class="render-area" id="component-container"></div>
        </div>
        
        <div id="code" class="tab-content">
            <pre id="component-code">${componentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        
        <div id="props" class="tab-content">
            <div class="preview-options" id="props-form">
                <!-- Will be populated dynamically -->
            </div>
            <button id="updatePreview">Update Preview</button>
        </div>
    </div>
    
    <script type="text/babel">
        // Component code will be evaluated here
        ${componentCode}
        
        // Extract prop types from the component
        const propTypes = {};
        // This is a simplified approach - in a real extension we would parse the component
        
        // Render the component with default props
        const mountNode = document.getElementById('component-container');
        ReactDOM.render(<${componentName} />, mountNode);
        
        // Handle tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Show selected tab
                const tabId = button.dataset.tab;
                document.getElementById(tabId).classList.add('active');
                button.classList.add('active');
            });
        });
        
        // Copy button
        document.getElementById('copyButton').addEventListener('click', () => {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ command: 'copyCode' });
        });
        
        // Theme switching
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            const theme = e.target.value;
            document.querySelector('.render-area').className = 
                'render-area ' + (theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800');
        });
    </script>
</body>
</html>`;
}

/**
 * Generate Vue component preview HTML
 */
function getVuePreview(componentCode, metadata) {
  // Similar to React preview but with Vue setup
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.name || 'Component'} Preview</title>
    <style>
        /* Similar styling as React preview */
    </style>
    <script src="https://unpkg.com/vue@3"></script>
</head>
<body>
    <div class="preview-container">
        <!-- Similar structure as React preview -->
    </div>
    
    <script>
        // Vue component mounting and preview logic
    </script>
</body>
</html>`;
}

/**
 * Generate Angular component preview HTML
 */
function getAngularPreview(componentCode, metadata) {
  // Simplified preview for Angular
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Angular Component Preview</title>
</head>
<body>
    <h2>Angular Component Preview</h2>
    <p>Angular components require a more complex setup for preview. Consider using the Angular CLI for a complete preview experience.</p>
    <pre>${componentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
}

/**
 * Generate Svelte component preview HTML
 */
function getSveltePreview(componentCode, metadata) {
  // Simplified preview for Svelte
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Svelte Component Preview</title>
</head>
<body>
    <h2>Svelte Component Preview</h2>
    <pre>${componentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
}

/**
 * Generate generic preview HTML for other frameworks
 */
function getGenericPreview(componentCode, metadata) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
    </style>
</head>
<body>
    <h2>${metadata.name || 'Component'} Preview</h2>
    <p>This component requires a specific runtime to preview properly.</p>
    <pre>${componentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
}

/**
 * Update preview with new props
 */
function updatePreviewProps(html, newProps) {
  // In a real implementation, this would update the props in the HTML
  return html;
}

/**
 * Generate HTML for pattern visualization
 */
function getPatternDiagram(patternName, visualizationData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${patternName} Pattern</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .pattern-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            color: #333;
        }
        .pattern-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .pattern-diagram {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
        }
        .diagram-container {
            position: relative;
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        .node {
            position: absolute;
            padding: 10px 15px;
            border-radius: 4px;
            border: 2px solid #333;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
            min-width: 100px;
        }
        .node.provider {
            background-color: #e3f2fd;
            border-color: #2196f3;
        }
        .node.logic {
            background-color: #e8f5e9;
            border-color: #4caf50;
        }
        .node.ui {
            background-color: #fff3e0;
            border-color: #ff9800;
        }
        .node.consumer {
            background-color: #f3e5f5;
            border-color: #9c27b0;
        }
        .node.context-provider {
            background-color: #e0f7fa;
            border-color: #00bcd4;
        }
        .node.child {
            background-color: #f5f5f5;
            border-color: #9e9e9e;
        }
        .edge {
            position: absolute;
            height: 2px;
            background-color: #333;
            transform-origin: 0 0;
        }
        .edge-label {
            position: absolute;
            background-color: white;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 12px;
            white-space: nowrap;
        }
        .pattern-description {
            margin: 20px 0;
        }
        .pattern-usage {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        code {
            display: block;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            white-space: pre;
            overflow-x: auto;
        }
    </style>
    <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js"></script>
</head>
<body>
    <div class="pattern-container">
        <div class="pattern-header">
            <h2>${patternName}</h2>
            <p>Pattern Type: ${visualizationData.type}</p>
        </div>
        
        <div class="pattern-description">
            <h3>Description</h3>
            <p>${getPatternDescription(patternName)}</p>
        </div>
        
        <div class="pattern-diagram">
            <h3>Pattern Structure</h3>
            <div id="diagram-container" class="diagram-container"></div>
        </div>
        
        <div class="pattern-usage">
            <h3>Usage Example</h3>
            <code id="pattern-example">${getPatternExample(patternName)}</code>
        </div>
    </div>
    
    <script>
        // Visualization data from MCP tool
        const visualizationData = ${JSON.stringify(visualizationData)};
        
        // Render diagram using D3
        renderDiagram(visualizationData);
        
        function renderDiagram(data) {
            const containerWidth = document.getElementById('diagram-container').clientWidth;
            const containerHeight = document.getElementById('diagram-container').clientHeight;
            
            // Calculate node positions based on diagram type
            const nodes = data.diagram.nodes;
            const edges = data.diagram.edges;
            
            // This is a simplified layout algorithm
            // In a real implementation, we'd use proper D3 force layout
            const nodeWidth = 120;
            const nodeHeight = 50;
            
            if (data.type === 'component-split') {
                // Simple left-right layout
                placeNodes(nodes, containerWidth, containerHeight, 'horizontal');
            } else if (data.type === 'tree') {
                // Tree layout
                placeNodes(nodes, containerWidth, containerHeight, 'tree');
            } else if (data.type === 'context') {
                // Context provider at top, consumers below
                placeNodes(nodes, containerWidth, containerHeight, 'context');
            } else {
                // Default layout
                placeNodes(nodes, containerWidth, containerHeight, 'horizontal');
            }
            
            // Create node elements
            nodes.forEach(node => {
                const nodeElem = document.createElement('div');
                nodeElem.className = 'node ' + (node.type || '');
                nodeElem.textContent = node.label;
                nodeElem.style.left = node.x + 'px';
                nodeElem.style.top = node.y + 'px';
                document.getElementById('diagram-container').appendChild(nodeElem);
                
                // Store actual dimensions for edge calculations
                node.width = nodeElem.offsetWidth;
                node.height = nodeElem.offsetHeight;
            });
            
            // Create edge elements
            edges.forEach(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                
                if (fromNode && toNode) {
                    const startX = fromNode.x + fromNode.width/2;
                    const startY = fromNode.y + fromNode.height/2;
                    const endX = toNode.x + toNode.width/2;
                    const endY = toNode.y + toNode.height/2;
                    
                    const edgeElem = document.createElement('div');
                    edgeElem.className = 'edge';
                    
                    // Calculate angle and length
                    const angle = Math.atan2(endY - startY, endX - startX);
                    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    
                    edgeElem.style.width = length + 'px';
                    edgeElem.style.left = startX + 'px';
                    edgeElem.style.top = startY + 'px';
                    edgeElem.style.transform = 'rotate(' + angle + 'rad)';
                    
                    document.getElementById('diagram-container').appendChild(edgeElem);
                    
                    // Add edge label if provided
                    if (edge.label) {
                        const labelElem = document.createElement('div');
                        labelElem.className = 'edge-label';
                        labelElem.textContent = edge.label;
                        labelElem.style.left = (startX + endX)/2 - 20 + 'px';
                        labelElem.style.top = (startY + endY)/2 - 10 + 'px';
                        document.getElementById('diagram-container').appendChild(labelElem);
                    }
                }
            });
        }
        
        function placeNodes(nodes, width, height, layout) {
            if (layout === 'horizontal') {
                const gap = width / (nodes.length + 1);
                nodes.forEach((node, i) => {
                    node.x = gap * (i + 1) - 60;
                    node.y = height / 2 - 25;
                });
            } else if (layout === 'tree') {
                const rootNode = nodes[0];
                rootNode.x = width / 2 - 60;
                rootNode.y = 30;
                
                const childNodes = nodes.slice(1);
                const gap = width / (childNodes.length + 1);
                childNodes.forEach((node, i) => {
                    node.x = gap * (i + 1) - 60;
                    node.y = 150;
                });
            } else if (layout === 'context') {
                const providerNode = nodes.find(n => n.type === 'provider');
                if (providerNode) {
                    providerNode.x = width / 2 - 60;
                    providerNode.y = 30;
                }
                
                const consumers = nodes.filter(n => n.type === 'consumer');
                const gap = width / (consumers.length + 1);
                consumers.forEach((node, i) => {
                    node.x = gap * (i + 1) - 60;
                    node.y = 180;
                });
            }
        }
    </script>
</body>
</html>`;
}

/**
 * Get description for a pattern
 */
function getPatternDescription(patternName) {
  const descriptions = {
    'Container/Presentational': 'Separates data fetching and business logic (Container) from UI rendering (Presentational). This pattern improves component reusability and separation of concerns.',
    'Compound Component': 'Creates a set of components that work together to form a cohesive UI pattern. Child components share state through React Context without prop drilling.',
    'Render Props': 'A component that takes a function as a prop, which returns React elements. This allows the component to share values and behavior with its children.',
    'Custom Hook': 'Extracts component logic into reusable functions. Hooks can manage state, side effects, and other React features without writing classes.',
    'Context Provider': 'Creates a centralized state that can be accessed by components at any level of the component tree without passing props down manually.'
  };
  
  return descriptions[patternName] || 'A UI design pattern that improves component architecture and reusability.';
}

/**
 * Get example code for a pattern
 */
function getPatternExample(patternName) {
  const examples = {
    'Container/Presentational': `// Container Component
const UserListContainer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);
  
  return (
    <UserListPresentation 
      users={users}
      loading={loading}
    />
  );
};

// Presentational Component
const UserListPresentation = ({ users, loading }) => {
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};`,
    'Compound Component': `import { createContext, useContext } from 'react';

const TabsContext = createContext();

const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.TabList = ({ children }) => {
  return <div className="tab-list">{children}</div>;
};

Tabs.Tab = ({ children, tabId }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button 
      className={\`tab \${activeTab === tabId ? 'active' : ''}\`}
      onClick={() => setActiveTab(tabId)}
    >
      {children}
    </button>
  );
};

Tabs.TabPanels = ({ children }) => {
  return <div className="tab-panels">{children}</div>;
};

Tabs.TabPanel = ({ children, tabId }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== tabId) return null;
  
  return <div className="tab-panel">{children}</div>;
};

// Usage
<Tabs defaultTab="tab1">
  <Tabs.TabList>
    <Tabs.Tab tabId="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.TabPanels>
    <Tabs.TabPanel tabId="tab1">Content 1</Tabs.TabPanel>
    <Tabs.TabPanel tabId="tab2">Content 2</Tabs.TabPanel>
  </Tabs.TabPanels>
</Tabs>`
  };
  
  return examples[patternName] || '// Example code for this pattern';
}
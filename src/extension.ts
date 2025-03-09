import * as vscode from 'vscode';
import { initializeLogger } from './utils/logger';
import { generateComponent } from './tools/component_gen';
import { applyPattern } from './tools/pattern_impl';
import { detectBugs } from './tools/bug_detector';
import { showComponentPreview, showPatternVisualization } from './utils/webview';
import { LovableTools, LovableIDE } from './modelcontextprotocol';

// Initialize logger
const logger = initializeLogger('lovable-extension');

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
  logger.info('Lovable.dev extension is now active');

  // Register the command to generate a component
  let generateComponentCommand = vscode.commands.registerCommand('lovable.generateComponent', async () => {
    try {
      // Get user configuration
      const config = vscode.workspace.getConfiguration('lovable');
      const designSystem = config.get<string>('designSystem') || 'tailwind';
      const uiFramework = config.get<string>('uiFramework') || 'react';
      const accessibilityLevel = config.get<string>('accessibilityLevel') || 'AA';
      
      // Ask user for component name
      const componentName = await vscode.window.showInputBox({
        prompt: 'Enter component name',
        placeHolder: 'Button, Card, Form, etc.'
      });
      
      if (!componentName) return;
      
      // Ask user for component description
      const componentDesc = await vscode.window.showInputBox({
        prompt: 'Describe the component',
        placeHolder: 'A primary button with hover and focus states'
      });
      
      if (!componentDesc) return;
      
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating ${componentName} component...`,
        cancellable: false
      }, async () => {
        // Call the MCP tool
        const result = await generateComponent({
          name: componentName,
          description: componentDesc,
          designSystem,
          framework: uiFramework,
          accessibilityLevel
        });
        
        // Create a new file and insert the generated component
        const document = await vscode.workspace.openTextDocument({
          language: uiFramework === 'react' ? 'typescriptreact' : 'typescript',
          content: result.code
        });
        
        await vscode.window.showTextDocument(document);
        
        // Show component preview
        showComponentPreview(context, result.code, {
          name: componentName,
          framework: uiFramework,
          designSystem
        });
        
        vscode.window.showInformationMessage(`Generated ${componentName} component`);
      });
    } catch (error) {
      logger.error('Error generating component', error);
      vscode.window.showErrorMessage(`Failed to generate component: ${error}`);
    }
  });

  // Register the command to apply a design pattern
  let applyPatternCommand = vscode.commands.registerCommand('lovable.applyPattern', async () => {
    try {
      // Get the current text editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active text editor found');
        return;
      }
      
      // Get the selected text
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      if (!selectedText) {
        vscode.window.showErrorMessage('Select code to apply a pattern');
        return;
      }
      
      // Ask user which pattern to apply
      const pattern = await vscode.window.showQuickPick([
        'Container/Presentational',
        'Compound Component',
        'Render Props',
        'Custom Hook',
        'Context Provider'
      ], {
        placeHolder: 'Select a design pattern to apply'
      });
      
      if (!pattern) return;
      
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Applying ${pattern} pattern...`,
        cancellable: false
      }, async () => {
        // Call the MCP tool
        const result = await applyPattern({
          code: selectedText,
          pattern,
          framework: vscode.workspace.getConfiguration('lovable').get<string>('uiFramework') || 'react'
        });
        
        // Replace the selected text with the transformed code
        editor.edit(editBuilder => {
          editBuilder.replace(selection, result.code);
        });
        
        // Show pattern visualization
        showPatternVisualization(context, pattern, result.visualizationData);
        
        vscode.window.showInformationMessage(`Applied ${pattern} pattern`);
      });
    } catch (error) {
      logger.error('Error applying pattern', error);
      vscode.window.showErrorMessage(`Failed to apply pattern: ${error}`);
    }
  });

  // Register the command to detect UI/UX bugs
  let detectBugsCommand = vscode.commands.registerCommand('lovable.detectBugs', async () => {
    try {
      // Get the current text editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active text editor found');
        return;
      }
      
      const documentText = editor.document.getText();
      const fileName = editor.document.fileName;
      
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing UI/UX issues...',
        cancellable: false
      }, async () => {
        // Create diagnostics collection if it doesn't exist yet
        let diagnostics = vscode.languages.createDiagnosticCollection('lovable');
        
        // Call the MCP tool
        const issues = await detectBugs({
          code: documentText,
          fileName,
          designSystem: vscode.workspace.getConfiguration('lovable').get<string>('designSystem') || 'tailwind',
          framework: vscode.workspace.getConfiguration('lovable').get<string>('uiFramework') || 'react'
        });
        
        // Process detected issues
        if (issues.length === 0) {
          // Clear any existing diagnostics
          diagnostics.delete(editor.document.uri);
          vscode.window.showInformationMessage('No UI/UX issues detected');
          return;
        }
        
        // Convert to VS Code diagnostics
        const vsDiagnostics = issues.map(issue => {
          // Create diagnostic range
          const range = new vscode.Range(
            issue.location.startLine,
            issue.location.startColumn,
            issue.location.endLine,
            issue.location.endColumn
          );
          
          // Create diagnostic with appropriate severity
          const severity = issue.severity === 'error' 
            ? vscode.DiagnosticSeverity.Error 
            : issue.severity === 'warning' 
              ? vscode.DiagnosticSeverity.Warning
              : vscode.DiagnosticSeverity.Information;
          
          const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
          
          // Add code and source to diagnostic
          diagnostic.code = issue.code;
          diagnostic.source = 'Lovable UI/UX';
          
          // Add related information for suggestions
          if (issue.suggestions && issue.suggestions.length > 0) {
            diagnostic.relatedInformation = issue.suggestions.map((suggestion, index) => {
              return new vscode.DiagnosticRelatedInformation(
                new vscode.Location(editor.document.uri, range),
                `Suggestion ${index + 1}: ${suggestion}`
              );
            });
          }
          
          return diagnostic;
        });
        
        // Set diagnostics for current document
        diagnostics.set(editor.document.uri, vsDiagnostics);
        
        vscode.window.showInformationMessage(`Found ${issues.length} UI/UX issues`);
        
        // Register code action provider for quick fixes if not already registered
        if (!context.subscriptions.some(d => d['id'] === 'lovable-code-actions')) {
          const codeActionProvider = vscode.languages.registerCodeActionsProvider(
            ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue', 'css', 'html'],
            new LovableCodeActionProvider(),
            {
              providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
            }
          );
          
          // Add ID for tracking
          codeActionProvider['id'] = 'lovable-code-actions';
          context.subscriptions.push(codeActionProvider);
        }
      });
    } catch (error) {
      logger.error('Error detecting bugs', error);
      vscode.window.showErrorMessage(`Failed to detect issues: ${error}`);
    }
  });

  // Add commands to extension context
  context.subscriptions.push(generateComponentCommand);
  context.subscriptions.push(applyPatternCommand);
  context.subscriptions.push(detectBugsCommand);
}

// Code action provider for quick fixes
class LovableCodeActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] | undefined {
    // Filter for our diagnostics
    const lovableDiagnostics = context.diagnostics.filter(
      diagnostic => diagnostic.source === 'Lovable UI/UX'
    );
    
    if (lovableDiagnostics.length === 0) {
      return undefined;
    }
    
    const codeActions: vscode.CodeAction[] = [];
    
    // Create quick fixes based on diagnostic suggestions
    for (const diagnostic of lovableDiagnostics) {
      if (diagnostic.relatedInformation && diagnostic.relatedInformation.length > 0) {
        // Create fix actions from suggestions
        diagnostic.relatedInformation.forEach(info => {
          const fix = this.createQuickFix(document, diagnostic, info.message);
          if (fix) {
            codeActions.push(fix);
          }
        });
      } else {
        // Create a generic fix if no specific suggestions
        const genericFix = this.createGenericFix(document, diagnostic);
        if (genericFix) {
          codeActions.push(genericFix);
        }
      }
    }
    
    return codeActions;
  }
  
  private createQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    suggestion: string
  ): vscode.CodeAction | undefined {
    // Extract actual suggestion from the format "Suggestion X: <suggestion>"
    const actualSuggestion = suggestion.replace(/^Suggestion \d+: /, '');
    
    // Create a code action
    const action = new vscode.CodeAction(
      actualSuggestion,
      vscode.CodeActionKind.QuickFix
    );
    
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    
    // This is a simplified implementation. In a real-world scenario,
    // you would parse the suggestion and create appropriate edits.
    action.command = {
      title: "Apply Suggestion",
      command: "lovable.applySuggestion",
      arguments: [document.uri, diagnostic.range, actualSuggestion]
    };
    
    return action;
  }
  
  private createGenericFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | undefined {
    // Create a generic fix based on the diagnostic code
    const action = new vscode.CodeAction(
      `Fix ${diagnostic.code}`,
      vscode.CodeActionKind.QuickFix
    );
    
    action.diagnostics = [diagnostic];
    
    // Command to show documentation or guidance
    action.command = {
      title: "Show Fix Documentation",
      command: "lovable.showFixDocumentation",
      arguments: [diagnostic.code]
    };
    
    return action;
  }
}

// This method is called when the extension is deactivated
export function deactivate() {
  logger.info('Lovable.dev extension is now deactivated');
}
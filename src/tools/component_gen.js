/**
 * Component generator tool for MCP
 * Enhanced for IDE integration
 */
export async function generateComponent(data) {
  const {
    name = 'DefaultComponent',
    description = 'A UI component',
    designSystem = 'tailwind',
    framework = 'react',
    accessibilityLevel = 'AA'
  } = data;
  
  console.log(`Generating ${framework} component with ${designSystem} styling`);
  
  // Framework-specific templates
  const templates = {
    react: generateReactComponent,
    vue: generateVueComponent,
    angular: generateAngularComponent,
    svelte: generateSvelteComponent
  };

  // Try to fetch component template from Lovable.dev API
  let code = await fetchLovableComponentTemplate(name, designSystem, framework, accessibilityLevel);

  // If no template is fetched, use the appropriate template generator based on framework
  if (code === null || code === undefined || code.trim() === '<div>/* Component template from Lovable.dev API */</div>') {
    const generator = templates[framework.toLowerCase()] || templates.react;
    code = generator(name, description, designSystem, accessibilityLevel);
  }
  
  return {
    success: true,
    name,
    framework,
    designSystem,
    code
  };
}

function generateReactComponent(name, description, designSystem, accessibilityLevel) {
  const componentName = formatComponentName(name);
  const styles = getDesignSystemStyles(designSystem, 'button', accessibilityLevel);
  
  return `import React from 'react';
${designSystem === 'tailwind' ? "" : `import styles from './${componentName}.module.css';`}

/**
 * ${description}
 *
 * @component ${componentName}
 * @accessibility ${accessibilityLevel}
 */
export const ${componentName} = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      className={\`${styles.button} ${styles[variant]} ${styles[size]} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default ${componentName};`;
}

function generateVueComponent(name, description, designSystem, accessibilityLevel) {
  const componentName = formatComponentName(name);
  const styles = getDesignSystemStyles(designSystem, 'button', accessibilityLevel);
  
  return `<template>
  <button
    :class="['${styles.button}', '${styles[variant]}', '${styles[size]}', className]"
    :disabled="disabled"
    :aria-disabled="disabled"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script>
/**
 * ${description}
 *
 * @component ${componentName}
 * @accessibility ${accessibilityLevel}
 */
export default {
  name: '${componentName}',
  props: {
    variant: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
/* ${designSystem} styles would be injected here */
</style>`;
}

function generateAngularComponent(name, description, designSystem, accessibilityLevel) {
  const componentName = formatComponentName(name);
  const selector = `app-${name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return `import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * ${description}
 *
 * @component ${componentName}
 * @accessibility ${accessibilityLevel}
 */
@Component({
  selector: '${selector}',
  template: \`
    <button
      [ngClass]="['${designSystem}-button', variant, size, className]"
      [disabled]="disabled"
      [attr.aria-disabled]="disabled"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  \`,
  styleUrls: ['./${selector}.component.scss']
})
export class ${componentName}Component {
  @Input() variant = 'primary';
  @Input() size = 'medium';
  @Input() disabled = false;
  @Input() className = '';
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}`;
}

function generateSvelteComponent(name, description, designSystem, accessibilityLevel) {
  const componentName = formatComponentName(name);
  
  return `<script>
  /**
   * ${description}
   *
   * @component ${componentName}
   * @accessibility ${accessibilityLevel}
   */
  
  export let variant = 'primary';
  export let size = 'medium';
  export let disabled = false;
  export let className = '';
</script>

<button
  class="${designSystem}-button {variant} {size} {className}"
  {disabled}
  aria-disabled={disabled}
  on:click
>
  <slot></slot>
</button>

<style>
  /* ${designSystem} styles would be injected here */
</style>`;
}

// Helper function to format component names in PascalCase
function formatComponentName(name) {
  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper to provide design system specific styles
function getDesignSystemStyles(designSystem, component, accessibilityLevel) {
  const styles = {
    tailwind: {
      button: 'rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      small: 'text-sm px-3 py-1',
      medium: 'text-base px-4 py-2',
      large: 'text-lg px-6 py-3'
    },
    bootstrap: {
      button: 'btn',
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      small: 'btn-sm',
      medium: '',
      large: 'btn-lg'
    },
    material: {
      button: 'mat-button',
      primary: 'mat-primary',
      secondary: 'mat-secondary',
      small: 'mat-small',
      medium: '',
      large: 'mat-large'
    },
    custom: {
      button: 'custom-button',
      primary: 'custom-primary',
      secondary: 'custom-secondary',
      small: 'custom-small',
      medium: 'custom-medium',
      large: 'custom-large'
    }
  };
  
  return styles[designSystem] || styles.tailwind;
}

// Placeholder function to fetch component templates from Lovable.dev API
async function fetchLovableComponentTemplate(componentName, designSystem, framework, accessibilityLevel) {
  // TODO: Implement API call to Lovable.dev to fetch component template
  console.log(`Fetching component template for ${componentName} from Lovable.dev API`);
  return `<div>/* Component template from Lovable.dev API */</div>`;
}

import pytest
from src.tools.component_gen import ComponentGenerator
from src.models.components import UIComponent
from enum import Enum

class TestComponentType(Enum):
    BUTTON = 'button'
    FORM = 'form'

def test_component_generator_initialization():
    generator = ComponentGenerator('tailwind', 'react')
    assert generator.design_system == 'tailwind'
    assert generator.ui_framework == 'react'

def test_generate_button_component():
    generator = ComponentGenerator('tailwind', 'react')
    component = UIComponent(
        type=TestComponentType.BUTTON,
        props={'label': 'Click me'},
        styles={'color': 'blue'},
        accessibility={'aria-label': 'Submit form'}
    )
    result = generator.generate_component(component)
    
    assert result['type'] == 'button'
    assert result['framework'] == 'react'
    assert result['design_system'] == 'tailwind'
    assert 'code' in result

def test_accessibility_validation():
    generator = ComponentGenerator('tailwind', 'react')
    component = UIComponent(
        type=TestComponentType.FORM,
        props={'fields': ['name', 'email']},
        accessibility=None
    )
    result = generator.generate_component(component)
    
    assert result['type'] == 'form'
    # Should still generate even without accessibility props
    assert 'code' in result

def test_responsive_design():
    generator = ComponentGenerator('tailwind', 'react')
    component = UIComponent(
        type=TestComponentType.BUTTON,
        props={'label': 'Click me'},
        styles={'width': '100%'}
    )
    result = generator.generate_component(component)
    
    assert 'code' in result
    # TODO: Add specific responsive design assertions once implemented

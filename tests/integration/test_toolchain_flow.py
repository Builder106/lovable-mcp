import pytest
import aiohttp
import asyncio
from src.server.server import LovableMCPServer

@pytest.fixture
async def test_server():
    server = LovableMCPServer()
    runner = aiohttp.web.AppRunner(server.app)
    await runner.setup()
    site = aiohttp.web.TCPSite(runner, 'localhost', 3000)
    await site.start()
    yield server
    await runner.cleanup()

@pytest.fixture
async def test_client(test_server):
    async with aiohttp.ClientSession() as client:
        yield client

@pytest.mark.asyncio
async def test_complete_component_generation_flow(test_client):
    """Test the complete flow of component generation, including accessibility and responsive design."""
    headers = {'X-API-Key': 'test_key'}
    test_data = {
        'type': 'form',
        'props': {
            'fields': [
                {'name': 'email', 'type': 'email', 'required': True},
                {'name': 'password', 'type': 'password', 'required': True}
            ]
        },
        'styles': {
            'width': '100%',
            'maxWidth': '400px'
        },
        'accessibility': {
            'aria-label': 'Login Form',
            'role': 'form'
        }
    }
    
    async with test_client.post(
        'http://localhost:3000/generate_component',
        headers=headers,
        json=test_data
    ) as response:
        assert response.status == 200
        data = await response.json()
        component = data['component']
        
        # Verify component structure
        assert 'code' in component
        assert 'type' in component
        assert component['type'] == 'form'
        
        # Verify accessibility implementation
        code = component['code']
        assert 'aria-label' in code
        assert 'role="form"' in code
        
        # Verify responsive design
        assert 'maxWidth' in code
        assert 'width' in code

@pytest.mark.asyncio
async def test_pattern_implementation_flow(test_client):
    """Test the complete flow of pattern implementation, including constraints and customization."""
    headers = {'X-API-Key': 'test_key'}
    test_data = {
        'pattern_type': 'card',
        'context': {
            'layout': 'vertical',
            'components': ['image', 'title', 'description', 'actions'],
            'theme': 'light'
        },
        'constraints': [
            'responsive',
            'accessible',
            'theme-compatible'
        ]
    }
    
    async with test_client.post(
        'http://localhost:3000/apply_pattern',
        headers=headers,
        json=test_data
    ) as response:
        assert response.status == 200
        data = await response.json()
        pattern = data['pattern']
        
        # Verify pattern implementation
        assert 'implementation' in pattern
        implementation = pattern['implementation']
        
        # Verify constraints are met
        assert 'role=' in implementation  # Accessibility
        assert 'className=' in implementation  # Theme compatibility
        assert '@media' in implementation  # Responsive design

@pytest.mark.asyncio
async def test_bug_detection_and_fix_flow(test_client):
    """Test the complete flow of bug detection, including static analysis and fix application."""
    headers = {'X-API-Key': 'test_key'}
    test_code = """
    function ProductCard({ title, price }) {
        return (
            <div style={{ width: '300px' }}>
                <h3 style={{ fontSize: '18px' }}>{title}</h3>
                <p>{price}</p>
                <button>Add to Cart</button>
            </div>
        );
    }
    """
    
    # First, detect bugs
    async with test_client.post(
        'http://localhost:3000/detect_bugs',
        headers=headers,
        json={'code': test_code, 'context': {'framework': 'react'}}
    ) as response:
        assert response.status == 200
        data = await response.json()
        issues = data['issues']
        
        # Verify bug detection
        assert len(issues) > 0
        assert any(i['type'] == 'style_inconsistency' for i in issues)
        assert any(i['type'] == 'accessibility' for i in issues)
        
        # Get first auto-fixable issue
        fixable_issue = next(i for i in issues if i.get('auto_fixable'))
        
        # Apply fix
        async with test_client.post(
            'http://localhost:3000/apply_fix',
            headers=headers,
            json={'code': test_code, 'issue_id': fixable_issue['id']}
        ) as fix_response:
            assert fix_response.status == 200
            fix_data = await fix_response.json()
            fixed_code = fix_data['code']
            
            # Verify fix application
            assert fixed_code != test_code
            
            # Verify fix resolved the issue
            async with test_client.post(
                'http://localhost:3000/detect_bugs',
                headers=headers,
                json={'code': fixed_code, 'context': {'framework': 'react'}}
            ) as verify_response:
                verify_data = await verify_response.json()
                new_issues = verify_data['issues']
                assert len(new_issues) < len(issues)

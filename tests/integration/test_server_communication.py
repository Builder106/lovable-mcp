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
async def test_api_key_authentication(test_client):
    # Test missing API key
    async with test_client.post('http://localhost:3000/generate_component') as response:
        assert response.status == 401
        data = await response.json()
        assert 'API key required' in data.get('reason', '')

    # Test valid API key
    headers = {'X-API-Key': 'test_key'}
    async with test_client.post(
        'http://localhost:3000/generate_component',
        headers=headers,
        json={'type': 'button', 'props': {}}
    ) as response:
        assert response.status == 200
        data = await response.json()
        assert data['status'] == 'success'

@pytest.mark.asyncio
async def test_request_response_format(test_client):
    headers = {'X-API-Key': 'test_key'}
    test_data = {
        'type': 'button',
        'props': {'label': 'Test Button'},
        'styles': {'color': 'blue'},
        'accessibility': {'aria-label': 'Test Button'}
    }
    
    async with test_client.post(
        'http://localhost:3000/generate_component',
        headers=headers,
        json=test_data
    ) as response:
        assert response.status == 200
        data = await response.json()
        assert 'status' in data
        assert 'component' in data
        assert isinstance(data['component'], dict)
        assert 'code' in data['component']

@pytest.mark.asyncio
async def test_rate_limiting(test_client):
    headers = {'X-API-Key': 'test_key'}
    test_data = {'type': 'button', 'props': {}}
    
    # Make multiple rapid requests
    responses = []
    for _ in range(10):
        async with test_client.post(
            'http://localhost:3000/generate_component',
            headers=headers,
            json=test_data
        ) as response:
            responses.append(response.status)
            await asyncio.sleep(0.1)  # Small delay between requests
    
    # Verify some requests were rate limited
    assert 429 in responses

@pytest.mark.asyncio
async def test_error_responses(test_client):
    headers = {'X-API-Key': 'test_key'}
    
    # Test malformed request
    async with test_client.post(
        'http://localhost:3000/generate_component',
        headers=headers,
        json={'invalid': 'data'}
    ) as response:
        assert response.status == 400
        data = await response.json()
        assert 'error' in data

    # Test invalid endpoint
    async with test_client.post(
        'http://localhost:3000/invalid_endpoint',
        headers=headers,
        json={}
    ) as response:
        assert response.status == 404

    # Test server error simulation
    async with test_client.post(
        'http://localhost:3000/generate_component',
        headers=headers,
        json={'type': 'invalid_type', 'props': {}}
    ) as response:
        assert response.status == 500
        data = await response.json()
        assert 'error' in data

import pytest
import aiohttp
import asyncio
import time
import psutil
import os
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

class ResourceMonitor:
    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.measurements = []

    def take_measurement(self):
        self.measurements.append({
            'timestamp': time.time(),
            'cpu_percent': self.process.cpu_percent(),
            'memory_mb': self.process.memory_info().rss / 1024 / 1024,
            'threads': self.process.num_threads()
        })

    def get_stats(self):
        if not self.measurements:
            return {}
        
        cpu_usage = [m['cpu_percent'] for m in self.measurements]
        memory_usage = [m['memory_mb'] for m in self.measurements]
        thread_counts = [m['threads'] for m in self.measurements]
        
        return {
            'cpu': {
                'avg': sum(cpu_usage) / len(cpu_usage),
                'max': max(cpu_usage)
            },
            'memory': {
                'avg': sum(memory_usage) / len(memory_usage),
                'max': max(memory_usage)
            },
            'threads': {
                'avg': sum(thread_counts) / len(thread_counts),
                'max': max(thread_counts)
            }
        }

@pytest.mark.asyncio
async def test_response_time_benchmark(test_client):
    """Test response times for different endpoints under normal load."""
    headers = {'X-API-Key': 'test_key'}
    endpoints = [
        ('generate_component', {'type': 'button', 'props': {}}),
        ('apply_pattern', {'pattern_type': 'card', 'context': {}}),
        ('detect_bugs', {'code': 'function Test() { return null; }', 'context': {}})
    ]
    
    results = {}
    for endpoint, payload in endpoints:
        start_time = time.time()
        async with test_client.post(
            f'http://localhost:3000/{endpoint}',
            headers=headers,
            json=payload
        ) as response:
            assert response.status == 200
            response_time = time.time() - start_time
            results[endpoint] = response_time
    
    # Verify response times are within acceptable range
    for endpoint, time_taken in results.items():
        assert time_taken < 1.0, f"{endpoint} response time too high: {time_taken}s"

@pytest.mark.asyncio
async def test_concurrent_requests(test_client):
    """Test server performance under concurrent load."""
    headers = {'X-API-Key': 'test_key'}
    monitor = ResourceMonitor()
    
    async def make_request():
        async with test_client.post(
            'http://localhost:3000/generate_component',
            headers=headers,
            json={'type': 'button', 'props': {}}
        ) as response:
            return response.status
    
    # Create multiple concurrent requests
    num_requests = 50
    start_time = time.time()
    monitor.take_measurement()
    
    tasks = [make_request() for _ in range(num_requests)]
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    end_time = time.time()
    monitor.take_measurement()
    
    # Analyze results
    success_count = sum(1 for r in responses if r == 200)
    rate_limited = sum(1 for r in responses if r == 429)
    total_time = end_time - start_time
    
    stats = monitor.get_stats()
    
    # Verify performance metrics
    assert success_count > 0, "No successful requests"
    assert total_time < num_requests, f"Total time too high: {total_time}s"
    assert stats['cpu']['max'] < 90, f"CPU usage too high: {stats['cpu']['max']}%"
    assert stats['memory']['max'] < 512, f"Memory usage too high: {stats['memory']['max']}MB"

@pytest.mark.asyncio
async def test_resource_usage(test_client):
    """Test resource usage under sustained load."""
    headers = {'X-API-Key': 'test_key'}
    monitor = ResourceMonitor()
    
    # Create sustained load for 30 seconds
    end_time = time.time() + 30
    request_count = 0
    
    while time.time() < end_time:
        monitor.take_measurement()
        async with test_client.post(
            'http://localhost:3000/generate_component',
            headers=headers,
            json={'type': 'button', 'props': {}}
        ) as response:
            assert response.status in (200, 429)
            request_count += 1
            await asyncio.sleep(0.1)  # Small delay between requests
    
    stats = monitor.get_stats()
    
    # Verify resource usage
    assert stats['cpu']['avg'] < 70, f"Average CPU usage too high: {stats['cpu']['avg']}%"
    assert stats['memory']['max'] < 512, f"Peak memory usage too high: {stats['memory']['max']}MB"
    assert request_count > 0, "No requests processed"

@pytest.mark.asyncio
async def test_rate_limiting_effectiveness(test_client):
    """Test effectiveness of rate limiting under burst load."""
    headers = {'X-API-Key': 'test_key'}
    
    # Send burst of requests
    burst_size = 100
    tasks = []
    
    for _ in range(burst_size):
        tasks.append(
            test_client.post(
                'http://localhost:3000/generate_component',
                headers=headers,
                json={'type': 'button', 'props': {}}
            )
        )
    
    responses = await asyncio.gather(*[t.__aenter__() for t in tasks])
    
    # Clean up
    await asyncio.gather(*[t.__aexit__(None, None, None) for t in tasks])
    
    # Count response types
    status_counts = {}
    for response in responses:
        status = response.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Verify rate limiting
    assert 429 in status_counts, "No requests were rate limited"
    assert status_counts.get(200, 0) > 0, "No successful requests"
    assert status_counts.get(429, 0) > 0, "Rate limiting not active"

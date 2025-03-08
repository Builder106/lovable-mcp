import logging
from aiohttp import web
from pydantic import BaseModel
from enum import Enum
import os
import time
from collections import defaultdict
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('lovable_mcp')

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

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, List[float]] = defaultdict(list)
    
    def is_rate_limited(self, api_key: str) -> bool:
        now = time.time()
        minute_ago = now - 60
        
        # Clean old requests
        self.requests[api_key] = [t for t in self.requests[api_key] if t > minute_ago]
        
        # Check if rate limited
        if len(self.requests[api_key]) >= self.requests_per_minute:
            return True
        
        # Add new request
        self.requests[api_key].append(now)
        return False

class LovableMCPServer:
    """Lovable Model Context Protocol Server
    
    This server provides MCP-compliant endpoints for:
    - UI component generation
    - Design pattern application
    - Frontend bug detection
    """
    
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        self.design_system = os.getenv('DESIGN_SYSTEM', 'default')
        self.ui_framework = os.getenv('UI_FRAMEWORK', 'react')
        self.rate_limiter = RateLimiter()
        logger.info('[Setup] Initializing Lovable MCP server...')

    def setup_routes(self):
        self.app.router.add_post('/generate_component', self.generate_component)
        self.app.router.add_post('/apply_pattern', self.apply_pattern)
        self.app.router.add_post('/detect_bugs', self.detect_bugs)
        logger.info('[Setup] Routes configured')

    async def validate_request(self, request: web.Request) -> str:
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            raise web.HTTPUnauthorized(reason='API key required')
        
        # Check rate limiting
        if self.rate_limiter.is_rate_limited(api_key):
            raise web.HTTPTooManyRequests(reason='Rate limit exceeded. Please try again later.')
        
        # TODO: Implement proper API key validation
        return api_key

    async def generate_component(self, request: web.Request) -> web.Response:
        try:
            api_key = await self.validate_request(request)
            try:
                data = await request.json()
            except ValueError:
                raise web.HTTPBadRequest(reason='Invalid JSON payload')
                
            try:
                component = UIComponent(**data)
            except ValueError as e:
                raise web.HTTPBadRequest(reason=f'Invalid component data: {str(e)}')
                
            logger.info(f'[UI] Generating component: {component.type}')
            # TODO: Implement component generation logic
            return web.json_response({
                'status': 'success',
                'component': component.dict()
            })
        except web.HTTPException:
            raise
        except Exception as e:
            logger.error(f'[Error] Component generation failed: {str(e)}')
            raise web.HTTPInternalServerError(reason='Internal server error occurred')

    async def apply_pattern(self, request: web.Request) -> web.Response:
        try:
            api_key = await self.validate_request(request)
            try:
                data = await request.json()
            except ValueError:
                raise web.HTTPBadRequest(reason='Invalid JSON payload')
                
            try:
                pattern = DesignPattern(**data)
            except ValueError as e:
                raise web.HTTPBadRequest(reason=f'Invalid pattern data: {str(e)}')
                
            logger.info(f'[Pattern] Applying design pattern: {pattern.pattern_type}')
            # TODO: Implement pattern application logic
            return web.json_response({
                'status': 'success',
                'pattern': pattern.dict()
            })
        except web.HTTPException:
            raise
        except Exception as e:
            logger.error(f'[Error] Pattern application failed: {str(e)}')
            raise web.HTTPInternalServerError(reason='Internal server error occurred')

    async def detect_bugs(self, request: web.Request) -> web.Response:
        try:
            api_key = await self.validate_request(request)
            try:
                data = await request.json()
            except ValueError:
                raise web.HTTPBadRequest(reason='Invalid JSON payload')
                
            if 'code' not in data or 'context' not in data:
                raise web.HTTPBadRequest(reason='Missing required fields: code and context')
                
            logger.info('[Bug] Running bug detection')
            # TODO: Implement bug detection logic
            return web.json_response({
                'status': 'success',
                'issues': []
            })
        except web.HTTPException:
            raise
        except Exception as e:
            logger.error(f'[Error] Bug detection failed: {str(e)}')
            raise web.HTTPInternalServerError(reason='Internal server error occurred')

    def run(self, host: str = 'localhost', port: int = 3000):
        logger.info(f'[Server] Starting Lovable MCP server on {host}:{port}')
        web.run_app(self.app, host=host, port=port)

def create_app():
    """Create and configure the MCP server application."""
    server = LovableMCPServer()
    return server.app

def start_server(host='localhost', port=3000):
    """Start the MCP server with the given configuration."""
    server = LovableMCPServer()
    server.run(host=host, port=port)

if __name__ == '__main__':
    start_server()

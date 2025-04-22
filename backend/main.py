from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
from datetime import datetime, timedelta
import uvicorn

app = FastAPI()

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store connected WebSocket clients
connected_clients = set()

# Initial price value
current_price = 100.0

async def generate_price_data():
    """Background task to generate price data and send to all clients"""
    global current_price
    
    while True:
        # Generate a new price with random walk
        current_price += (random.random() - 0.5) * 2
        
        # Create data point
        data_point = {
            "time": datetime.now().isoformat(),
            "price": current_price,
            "isNew": True
        }
        
        # Send to all connected clients
        if connected_clients:
            await asyncio.gather(
                *[client.send_text(json.dumps(data_point)) for client in connected_clients]
            )
        
        # Wait before generating next data point
        await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    """Start the background task when the application starts"""
    asyncio.create_task(generate_price_data())

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "real-time-chart-backend"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Add client to connected set
    connected_clients.add(websocket)
    
    try:
        # Send initial data points
        initial_data = []
        base_price = current_price - 10
        
        # Generate 20 historical data points
        for i in range(20):
            # Random walk for historical data
            base_price += (random.random() - 0.5) * 2
            
            # Create historical data point (20 seconds in the past to now)
            time_offset = 19 - i  # 19 seconds ago to now
            data_point = {
                "time": (datetime.now() - 
                         timedelta(seconds=time_offset)).isoformat(),
                "price": base_price,
                "isNew": False
            }
            initial_data.append(data_point)
        
        # Send initial data as a batch
        await websocket.send_text(json.dumps({"type": "initial", "data": initial_data}))
        
        # Keep the connection alive and handle client messages
        while True:
            data = await websocket.receive_text()
            # Handle any client messages if needed
            # For now, we're just keeping the connection open
            
    except WebSocketDisconnect:
        # Remove client when disconnected
        connected_clients.remove(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

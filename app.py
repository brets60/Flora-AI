import os
import sys

# Ensure backend is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import gradio as gr
from backend.app.main import app as fastapi_app

# Gradio Interface for testing and visual confirmation
with gr.Blocks(title="FloraAI Botanical Assistant") as demo:
    gr.Markdown("# 🌿 FloraAI — AI Botanical Assistant API")
    gr.Markdown("The production FastAPI backend is running live and healthy 24/7.")
    gr.Markdown("- Interactive Swagger Docs: [/docs](/docs)")
    gr.Markdown("- Health Endpoint: [/api/health](/api/health)")

# Mount Gradio UI to FastAPI application
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

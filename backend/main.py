from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from typing import List, Dict
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.concurrency import run_in_threadpool
# Import the new helper
from stream_helper import stream_report

from ai_engine import extract_text
from deck_builder import create_anki_deck
import shutil
import shutil
import os
import uuid
import time
import asyncio

# --- GLOBAL STATE STORE ---
# In a production app, use Redis or a database.
# Map: deck_id (str) -> full_text (str)
DECK_STORE = {}

# --- CACHE STORE ---
# Map: (deck_id, task_type) -> result_dict
RESPONSE_CACHE = {}

app = FastAPI(title="FlashDeck AI API")

# Allow CORS for React Frontend
# For security, you can list specific domains like ["http://localhost:5173", "https://your-site.vercel.app"]
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "FlashDeck Brain is Online 🧠"}

@app.post("/generate")
async def generate_initial(files: List[UploadFile] = File(...)):
    """Initial processing: extract text and name the deck."""
    print(f"📄 Processing {len(files)} files...")
    try:
        full_text = ""
        for file in files:
            # Async read
            content = await file.read()
            try:
                # Offload CPU-bound extraction
                text = await run_in_threadpool(extract_text, content)
                if text:
                    full_text += f"\n\n--- Source: {file.filename} ---\n\n" + text
            except Exception as e:
                print(f"Extraction Error for {file.filename}: {e}")
                continue
            
        if not full_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from uploaded files.")

        if len(files) == 1:
            deck_name = files[0].filename.replace(".pdf", "")
        else:
            deck_name = f"{files[0].filename.replace('.pdf', '')}_plus_{len(files)-1}"
            
        # Store text server-side
        deck_id = str(uuid.uuid4())
        DECK_STORE[deck_id] = full_text
            
        return {
            "status": "success",
            "deck_id": deck_id,
            "deck_name": deck_name,
            "message": "Text stored successfully on server."
        }
    except Exception as e:
        print(f"Initial Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TaskRequest(BaseModel):
    deck_id: str
    deck_name: str
    
def get_text_or_404(deck_id: str):
    text = DECK_STORE.get(deck_id)
    if not text:
        raise HTTPException(status_code=404, detail="Deck not found or session expired. Please re-upload.")
    return text

async def get_cached_or_run(deck_id: str, task_type: str, text: str, extra_data: Dict = None):
    cache_key = (deck_id, task_type)
    
    # Check Cache
    if cache_key in RESPONSE_CACHE:
        print(f"⚡ CACHE HIT: {cache_key}")
        return RESPONSE_CACHE[cache_key]
        
    print(f"🐢 CACHE MISS: {cache_key} - Running AI...")
    from agent_graph import run_selective_node
    
    # Run AI
    result = await run_in_threadpool(run_selective_node, text, task_type, extra_data)
    
    # Store Result
    RESPONSE_CACHE[cache_key] = result
    return result

async def ensure_min_time(start_time: float, min_seconds: float = 2.5):
    """Ensures at least min_seconds have passed since start_time."""
    elapsed = time.time() - start_time
    if elapsed < min_seconds:
        await asyncio.sleep(min_seconds - elapsed)

class AnalysisRequest(BaseModel):
    deck_id: str
    missed_questions: List[Dict]

@app.post("/generate/cards")
async def generate_cards(req: TaskRequest):
    start_time = time.time()
    print(f"--- Triggering Lazy Card Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    try:
        result = await get_cached_or_run(req.deck_id, "cards", text)
        await ensure_min_time(start_time, 3.5)
        cards = result.get("final_cards", [])
        
        # Create anki deck 
        output_file = create_anki_deck(cards, deck_name=req.deck_name)
        
        return {
            "status": "success",
            "cards": cards,
            "download_path": output_file
        }
    except Exception as e:
        print(f"Card Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/flowchart")
async def generate_flowchart(req: TaskRequest):
    start_time = time.time()
    print(f"--- Triggering Lazy Flowchart Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    try:
        result = await get_cached_or_run(req.deck_id, "flowchart", text)
        await ensure_min_time(start_time, 3.0)
        return {
            "status": "success",
            "flowchart": result.get("flowchart", "")
        }
    except Exception as e:
        print(f"Flowchart Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/quiz")
async def generate_quiz(req: TaskRequest):
    start_time = time.time()
    print(f"--- Triggering Lazy Quiz Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    try:
        result = await get_cached_or_run(req.deck_id, "quiz", text)
        await ensure_min_time(start_time, 3.0)
        return {
            "status": "success",
            "quiz": result.get("quiz", [])
        }
    except Exception as e:
        print(f"Quiz Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/report")
async def generate_report(req: TaskRequest):
    print(f"--- Triggering Streaming Report Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    
    # Check Cache first (we can cache the full string result)
    cache_key = (req.deck_id, "report")
    if cache_key in RESPONSE_CACHE:
        print(f"⚡ CACHE HIT (Report): {cache_key}")
        # If cached, we simulate a stream or just return JSON? 
        # The frontend expects a stream, so we yield the cached string.
        async def cached_stream():
            yield RESPONSE_CACHE[cache_key]['report']
        return StreamingResponse(cached_stream(), media_type="text/plain")

    async def meta_stream_generator():
        await asyncio.sleep(2.5) # Initial 'Thinking' buffer
        full_content = ""
        try:
            # We run the synchronous generator in a theoretical way, but actually
            # LLM streaming is usually async or sync-generator. 
            # Our stream_helper is a synchronous generator (yield).
            # To be safe with FastAPI async, we Iterate it direct if it's fast, 
            # or use an async wrapper. 
            # Since stream_helper calls APIs, it blocks.
            # Best practice: use iterate_in_threadpool from starlette?
            # Or just wrap the generator.
            
            # Let's simple iterate for now, assuming the underlying lib releases GIL or we accept one thread blockage per user.
            # Ideally stream_helper should be async.
            
            formatted_input = text[:50000] 
            for chunk in stream_report(formatted_input):
               full_content += chunk
               yield chunk
               
            # Update Cache after completion
            RESPONSE_CACHE[cache_key] = {"report": full_content}
            
        except Exception as e:
            yield f"\n\n[Error generating report: {e}]"

    return StreamingResponse(meta_stream_generator(), media_type="text/plain")


@app.post("/generate/slides")
async def generate_slides(req: TaskRequest):
    start_time = time.time()
    print(f"--- Triggering Lazy Slides Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    try:
        result = await get_cached_or_run(req.deck_id, "slides", text)
        await ensure_min_time(start_time, 3.0)
        return {
            "status": "success",
            "slides": result.get("slides", [])
        }
    except Exception as e:
        print(f"Slides Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/table")
async def generate_table(req: TaskRequest):
    start_time = time.time()
    print(f"--- Triggering Lazy Table Generation for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    try:
        result = await get_cached_or_run(req.deck_id, "table", text)
        await ensure_min_time(start_time, 3.0)
        return {
            "status": "success",
            "table": result.get("table", [])
        }
    except Exception as e:
        print(f"Table Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/quiz")
async def analyze_quiz(req: AnalysisRequest):
    print(f"--- Analyzing Quiz Results for Review Cards ---")
    from agent_graph import run_selective_node
    try:
        # We pass missed questions in extra_data
        result = await run_in_threadpool(run_selective_node, req.text, "review", extra_data={"missed_questions": req.missed_questions})
        return {
            "status": "success",
            "review_cards": result.get("review_cards", [])
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/guide")
async def generate_guide(req: TaskRequest):
    start_time = time.time()
    print(f"--- Generating Notebook Guide for: {req.deck_name} ---")
    text = get_text_or_404(req.deck_id)
    
    # Check Cache
    try:
        result = await get_cached_or_run(req.deck_id, "guide", text)
        await ensure_min_time(start_time, 2.5)
        return {"status": "success", "guide": result.get("guide", {})}
    except Exception as e:
        print(f"Guide Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



class ChatRequest(BaseModel):
    history: List[Dict[str, str]] 
    message: str
    context: str = "" # Optional override
    deck_id: str = None # Preferred: ID lookup

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    from agent_graph import llm, GOOGLE_API_KEY
    print(f"DEBUG: Chat endpoint called. Google Key Present: {bool(GOOGLE_API_KEY)}")
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage


    system_prompt = """You are an expert, supportive AI Tutor. Your goal is to help the user understand their study materials deeply and interactively.

    CRITICAL FORMATTING RULES:
    1. NO BOXES: Do NOT use backticks (``) or code blocks (```). Never put text inside a box.
    2. COMPARISONS & TABLES: When comparing two or more concepts, ALWAYS use a Markdown table.
       - Use clear headers: (e.g., | Feature | while loop | do-while loop |).
    3. USE CLEAN TEXT: Use **Bold** for emphasis or keywords, and *Italics* for supporting terms or definitions.
    4. STRUCTURE: Use clear Headings (###) and Lists (bullets, numbers, or letters) to organize information.
    5. QUOTES: Use blockquotes (>) for important excerpts or definitions.
    6. INTERACTIVE: Ask 'Check for Understanding' questions occasionally.
    7. TONE: Encouraging, patient, and professional.

    SUGGESTED QUESTIONS:
    At the very end of EVERY response, you MUST provide exactly 3 suggested continuation questions that the user might want to ask next based on the current context. 
    Format them EXACTLY like this on a new line:
    [SUGGESTIONS]: ["Question 1", "Question 2", "Question 3"]
    """





    
    
    # Resolve context
    doc_context = req.context
    if not doc_context and req.deck_id:
        doc_context = DECK_STORE.get(req.deck_id, "")
        
    if doc_context:
        system_prompt += f"\n\nCONTEXT FROM DOCUMENTS:\n{doc_context[:30000]}\n\nUse this context to guide the conversation. If a question isn't in the context, use your general knowledge but mention it's outside the provided documents."
    else:
        system_prompt += "\n\nProvide clear, helpful guidance based on your general knowledge."


    messages = [SystemMessage(content=system_prompt)]
    
    # Trim history
    recent_history = req.history[-10:] 
    
    for msg in recent_history:
        if msg['role'] == 'user':
            messages.append(HumanMessage(content=msg['content']))
        else:
            messages.append(AIMessage(content=msg['content']))
            
    messages.append(HumanMessage(content=req.message))

    async def stream_generator():
        await asyncio.sleep(2.5) # Initial 'Thinking' buffer
        try:
            buffer = ""
            async for chunk in llm.astream(messages):
                # Use getattr to safely check for content attribute
                content = getattr(chunk, 'content', chunk)
                
                text = ""
                if isinstance(content, list):
                    parts = [str(part.get('text', '')) if isinstance(part, dict) else str(part) for part in content]
                    text = "".join(parts)
                else:
                    text = str(content)

                if text:
                    buffer += text
                    # If we have a newline, yield line by line
                    if "\n" in buffer:
                        lines = buffer.split("\n")
                        # Yield everything except the last part (which might be incomplete)
                        for i in range(len(lines) - 1):
                            yield lines[i] + "\n"
                            # Line-by-line reveal delay
                            await asyncio.sleep(0.08) 
                        buffer = lines[-1]
                    else:
                        # Optional: If the chunk is very long with no newline, still yield some to keep it moving
                        if len(buffer) > 100:
                            yield buffer
                            buffer = ""

            # Yield any remaining content
            if buffer:
                yield buffer

        except Exception as e:
            print(f"Streaming Error: {e}")
            if "429" in str(e):
                yield "⚠️ **AI Quota Reached**: Google's free tier has a strict limit on speed. Please wait about 30 seconds and try again."
            else:
                yield f"Error: {str(e)}"


    return StreamingResponse(stream_generator(), media_type="text/plain")





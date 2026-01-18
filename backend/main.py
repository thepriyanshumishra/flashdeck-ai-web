from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from typing import List, Dict
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from ai_engine import extract_text
from deck_builder import create_anki_deck
import shutil
import os

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
            await file.seek(0)
            try:
                text = extract_text(file.file)
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
            
        return {
            "status": "success",
            "deck_name": deck_name,
            "full_text": full_text
        }
    except Exception as e:
        print(f"Initial Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TaskRequest(BaseModel):
    text: str
    deck_name: str

class AnalysisRequest(BaseModel):
    text: str
    missed_questions: List[Dict]

@app.post("/generate/cards")
async def generate_cards(req: TaskRequest):
    print(f"--- Triggering Lazy Card Generation for: {req.deck_name} ---")
    from agent_graph import run_selective_node
    try:
        result = run_selective_node(req.text, "cards")
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
    print(f"--- Triggering Lazy Flowchart Generation for: {req.deck_name} ---")
    from agent_graph import run_selective_node
    try:
        result = run_selective_node(req.text, "flowchart")
        return {
            "status": "success",
            "flowchart": result.get("flowchart", "")
        }
    except Exception as e:
        print(f"Flowchart Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/quiz")
async def generate_quiz(req: TaskRequest):
    print(f"--- Triggering Lazy Quiz Generation for: {req.deck_name} ---")
    from agent_graph import run_selective_node
    try:
        result = run_selective_node(req.text, "quiz")
        return {
            "status": "success",
            "quiz": result.get("quiz", [])
        }
    except Exception as e:
        print(f"Quiz Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/quiz")
async def analyze_quiz(req: AnalysisRequest):
    print(f"--- Analyzing Quiz Results for Review Cards ---")
    from agent_graph import run_selective_node
    try:
        # We pass missed questions in extra_data
        result = run_selective_node(req.text, "review", extra_data={"missed_questions": req.missed_questions})
        return {
            "status": "success",
            "review_cards": result.get("review_cards", [])
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    history: List[Dict[str, str]] 
    message: str
    context: str = "" # Document text context

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
    """





    
    if req.context:
        system_prompt += f"\n\nCONTEXT FROM DOCUMENTS:\n{req.context[:30000]}\n\nUse this context to guide the conversation. If a question isn't in the context, use your general knowledge but mention it's outside the provided documents."
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
        try:
            async for chunk in llm.astream(messages):
                text = ""
                # Use getattr to safely check for content attribute
                content = getattr(chunk, 'content', chunk)
                
                if isinstance(content, list):
                    # Flatten list of parts (common in Gemini 3)
                    parts = []
                    for part in content:
                        if isinstance(part, dict):
                            parts.append(str(part.get('text', '')))
                        else:
                            parts.append(str(part))
                    text = "".join(parts)
                else:
                    text = str(content)

                if text:
                    # Final safety check: ensure we are yielding a raw string for Starlette
                    yield str(text)

        except Exception as e:
            print(f"Streaming Error: {e}")
            if "429" in str(e):
                yield "⚠️ **AI Quota Reached**: Google's free tier has a strict limit on speed. Please wait about 30 seconds and try again. For higher limits, consider using a different model in settings."
            else:
                yield f"Error: {str(e)}"


    return StreamingResponse(stream_generator(), media_type="text/plain")





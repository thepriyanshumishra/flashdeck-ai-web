import os
import json
from typing import List, TypedDict, Annotated, Dict, Any
import operator
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import warnings

# Load env
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Suppress the deprecation warning for langchain_google_genai if it persists
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

# --- LLM SETUP ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "gemini-flash-latest")

# Ensure models with ':free' or other provider prefixes go to OpenRouter, not native Google
model_is_google_native = "gemini" in AI_MODEL.lower() and ":" not in AI_MODEL

# 0. Global Client for New SDK
google_client = None
if GOOGLE_API_KEY:
    google_client = genai.Client(api_key=GOOGLE_API_KEY)

# 1. Prepare Google LLM (Old SDK wrapper for LC compat)
google_llm = None
if GOOGLE_API_KEY:
    target_google_model = AI_MODEL if model_is_google_native else "gemini-flash-latest"
    google_llm = ChatGoogleGenerativeAI(
        model=target_google_model,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3,
        max_retries=1
    )

# 2. Prepare OpenRouter LLM
openrouter_llm = None
if OPENROUTER_API_KEY:
    openrouter_llm = ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        model=AI_MODEL, 
        max_retries=2,
        default_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "FlashDeck"
        }
    )

# 2.5 Prepare Groq LLM
groq_llm = None
if GROQ_API_KEY:
    target_groq_model = AI_MODEL if ("llama" in AI_MODEL.lower() or "mixtral" in AI_MODEL.lower() or "gemma" in AI_MODEL.lower()) else "llama-3.3-70b-versatile"
    print(f"--- AI Config: Groq Initialized with model {target_groq_model} ---")
    groq_llm = ChatGroq(
        model=target_groq_model,
        groq_api_key=GROQ_API_KEY,
        temperature=0.3,
        max_retries=2
    )

# 3. Create Intelligent LLM Chain with explicit error handling for fallbacks
fallbacks = []
if groq_llm: fallbacks.append(groq_llm)
if google_llm: fallbacks.append(google_llm)
if openrouter_llm: fallbacks.append(openrouter_llm)

if "llama" in AI_MODEL.lower() and groq_llm:
    print(f"--- AI Config: Using Groq (Primary) ---")
    llm = groq_llm.with_fallbacks([f for f in fallbacks if f != groq_llm])
elif model_is_google_native and google_llm:
    print(f"--- AI Config: Using Google (Primary) ---")
    llm = google_llm.with_fallbacks([f for f in fallbacks if f != google_llm])
elif openrouter_llm:
    print(f"--- AI Config: Using OpenRouter (Primary) ---")
    llm = openrouter_llm.with_fallbacks([f for f in fallbacks if f != openrouter_llm])
elif groq_llm:
    print(f"--- AI Config: Using Groq (Standalone) ---")
    llm = groq_llm
else:
    llm = None

# --- DATATYPES ---

class Flashcard(BaseModel):
    q: str = Field(description="Question")
    a: str = Field(description="Answer")

class CardList(BaseModel):
    cards: List[Flashcard]

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str
    explanation: str

class QuizList(BaseModel):
    quiz: List[QuizQuestion]

class DeckState(TypedDict):
    original_text: str
    chunks: List[str]
    partial_cards: Annotated[List[Dict], operator.add] 
    final_cards: List[Dict]
    flowchart: str

# --- NODES ---

def chunk_document(state: DeckState):
    print("--- NODE: CHUNKER ---")
    text = state['original_text']
    splitter = RecursiveCharacterTextSplitter(chunk_size=25000, chunk_overlap=500)
    docs = splitter.create_documents([text])
    chunks = [d.page_content for d in docs]
    print(f"Created {len(chunks)} chunks.")
    return {"chunks": chunks}

def generate_flowchart_node(state: DeckState):
    print("--- NODE: FLOWCHART GEN ---")
    text = state['original_text'][:15000]
    
    system_instruction = "You are an expert at creating mind maps. Generate a helper Mermaid.js flowchart syntax based on the provided text. \n\nRULES:\n1. Return ONLY the mermaid code, starting with 'graph TD'.\n2. No markdown backticks.\n3. ALWAYS use double quotes for labels: e.g., A[\"My Label\"].\n4. Avoid special characters like (), [], {{}}, or --> inside labels.\n5. Keep the graph logical and hierarchical."
    
    prompt = f"TEXT TO ANALYZE:\n{text}"

    content = ""
    try:
        # Use new Google client if available and appropriate
        if google_client and model_is_google_native:
            try:
                print(f"DEBUG: Using Google New SDK for Flowchart. Model: {target_google_model}")
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction},
                    contents=prompt
                )
                content = res.text
            except Exception as e:
                print(f"Native Flowchart Error (Falling back to LLM): {e}")

        if not content and llm:
            # Fallback to LangChain (OpenRouter or legacy Google)
            print("DEBUG: Using LangChain wrapper for Flowchart")
            full_prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("user", "{text}")
            ])
            chain = full_prompt | llm
            res = chain.invoke({"text": text})
            content = res.content
            if isinstance(content, list):
                content = " ".join([str(part.get('text', part)) if isinstance(part, dict) else str(part) for part in content])
        
        if not content:
            raise ValueError("Empty response from AI")

        content = content.replace('```mermaid', '').replace('```', '').strip()
        
        if not content.startswith('graph') and not content.startswith('flowchart'):
            # Try parsing a bit more loosely
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.strip().startswith('graph') or line.strip().startswith('flowchart'):
                    content = '\n'.join(lines[i:])
                    break
            else:
                raise ValueError("Response lacks Mermaid graph header")

        print(f"Flowchart generated successfully ({len(content)} chars)")
        return {"flowchart": content}

    except Exception as e:
        import traceback
        print(f"CRITICAL: Flowchart Gen Error: {str(e)}")
        traceback.print_exc()
        return {"flowchart": "graph TD\n  Start[\"Generation Failed\"] --> Error[\"" + str(e).replace('"', "'")[:50] + "\"]"}

def generate_cards_node(state: DeckState):
    print("--- NODE: CARD GEN ---")
    chunks = state.get('chunks', [])
    if not chunks:
        return {"partial_cards": []}
    
    system_instruction = "You are an expert educator. Based on the text, create 3-5 high-quality flashcards. Respond ONLY with JSON matching the format: {{\"cards\": [{{\"q\": \"...\", \"a\": \"...\"}}]}}"
    
    new_cards = []
    for chunk in chunks:
        try:
            content = ""
            if google_client and model_is_google_native:
                try:
                    print(f"DEBUG: Using Google New SDK for Cards. Model: {target_google_model}")
                    res = google_client.models.generate_content(
                        model=target_google_model,
                        config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                        contents=f"TEXT: {chunk}"
                    )
                    content = res.text
                except Exception as e:
                    print(f"Native Card Gen Error (Falling back to LLM): {e}")

            if not content and llm:
                print("DEBUG: Using LangChain wrapper for Cards")
                parser = JsonOutputParser(pydantic_object=CardList)
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("user", "TEXT: {text}")
                ])
                chain = prompt | llm | parser
                res = chain.invoke({"text": chunk})
                if 'cards' in res:
                    new_cards.extend(res['cards'])
                continue # Skip the manual parsing below

            if content:
                # Manual cleanup and parsing for SDK response
                content = content.replace("```json", "").replace("```", "").strip()
                data = json.loads(content)
                if 'cards' in data:
                    new_cards.extend(data['cards'])

        except Exception as e:
            print(f"Card Chunk Error: {e}")
    
    return {"partial_cards": new_cards}

def refine_deck(state: DeckState):
    print("--- NODE: REFINER ---")
    raw_cards = state.get('partial_cards', [])
    unique_map = {}
    for c in raw_cards:
        if hasattr(c, 'model_dump'):
             c = c.model_dump()
        elif hasattr(c, 'dict'):
             c = c.dict()
             
        q = c.get('q') or c.get('question') or c.get('front')
        a = c.get('a') or c.get('answer') or c.get('back')
        if q and isinstance(q, str):
            unique_map[q.strip()] = {"q": q, "a": a}
            
    final_list = list(unique_map.values())
    print(f"Refined {len(raw_cards)} cards to {len(final_list)} unique.")
    return {"final_cards": final_list}

def generate_quiz_node(state: DeckState):
    print("--- NODE: QUIZ GEN ---")
    text = state['original_text'][:25000]
    
    system_instruction = """You are an expert examiner. Create a challenging multiple-choice quiz (5-10 questions) based on the provided text. 
    Respond ONLY with JSON matching this format:
    {{
      "quiz": [
        {{
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "answer": "Exact string from options",
          "explanation": "Why this is correct"
        }}
      ]
    }}
    """
    
    try:
        content = ""
        if google_client and model_is_google_native:
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Quiz Gen Error (Falling back to LLM): {e}")

        if not content and llm:
            print("DEBUG: Using LangChain for Quiz Gen")
            parser = JsonOutputParser(pydantic_object=QuizList)
            prompt = ChatPromptTemplate.from_messages([("system", system_instruction), ("user", "TEXT: {text}")])
            chain = prompt | llm | parser
            res = chain.invoke({"text": text})
            print(f"DEBUG: Quiz Gen Result count: {len(res.get('quiz', []))}")
            return {"quiz": res.get("quiz", [])}

        if content:
            content = content.replace("```json", "").replace("```", "").strip()
            print(f"DEBUG: Native Quiz Gen Content length: {len(content)}")
            data = json.loads(content)
            return {"quiz": data.get("quiz", [])}
            
    except Exception as e:
        print(f"Quiz Gen Error: {e}")
        return {"quiz": []}

def generate_review_node(state: Dict):
    print("--- NODE: REVIEW GEN ---")
    missed_questions = state.get('missed_questions', [])
    if not missed_questions:
        return {"review_cards": []}
        
    system_instruction = "Based on the questions the student missed, create ultra-focused flashcards to help them master those specific concepts. Respond ONLY with JSON: {{\"cards\": [{{\"q\": \"...\", \"a\": \"...\"}}]}}"
    
    context = "\n".join([f"Q: {m['question']} (Missed because they answered: {m.get('user_answer', 'Unknown')})" for m in missed_questions])
    
    try:
        content = ""
        if google_client and model_is_google_native:
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"MISSED TOPICS:\n{context}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Review Gen Error (Falling back to LLM): {e}")

        if content:
            data = json.loads(content.replace("```json", "").replace("```", "").strip())
            return {"review_cards": data.get("cards", [])}
            
        if llm:
             parser = JsonOutputParser(pydantic_object=CardList)
             prompt = ChatPromptTemplate.from_messages([("system", system_instruction), ("user", "MISSED:\n{text}")])
             chain = prompt | llm | parser
             res = chain.invoke({"text": context})
             return {"review_cards": res.get("cards", [])}
    except Exception as e:
        print(f"Review Card Gen Error: {e}")
        return {"review_cards": []}

# --- GRAPH BUILD ---

workflow = StateGraph(DeckState)
workflow.add_node("chunker", chunk_document)
workflow.add_node("generator", generate_cards_node)
workflow.add_node("flowcharter", generate_flowchart_node)
workflow.add_node("refiner", refine_deck)

workflow.set_entry_point("chunker")
workflow.add_edge("chunker", "generator")
workflow.add_edge("generator", "flowcharter")
workflow.add_edge("flowcharter", "refiner")
workflow.add_edge("refiner", END)

app_graph = workflow.compile()

import time

def run_selective_node(text: str, task_type: str, extra_data: Dict = None):
    state = {"original_text": text, "chunks": [], "partial_cards": [], "final_cards": [], "flowchart": "", "quiz": [], "review_cards": []}
    if extra_data:
        state.update(extra_data)
        
    for attempt in range(2):
        try:
            if task_type in ["cards", "flowchart", "quiz"]:
                state.update(chunk_document(state))
                
            if task_type == "cards":
                state.update(generate_cards_node(state))
                state.update(refine_deck(state))
            elif task_type == "flowchart":
                state.update(generate_flowchart_node(state))
            elif task_type == "quiz":
                state.update(generate_quiz_node(state))
            elif task_type == "review":
                state.update(generate_review_node(state))
            
            return state
        except Exception as e:
            if "429" in str(e) and attempt == 0:
                print(f"--- 429 Quota Limit Hit. Retrying in 2 seconds... ---")
                time.sleep(2)
                continue
            print(f"--- Fatal selective node error: {e} ---")
            return state # Return whatever we have

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
from groq import Groq
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

# 2.6 Direct Groq Client (For high-speed, low-overhead generation)
direct_groq_client = None
if GROQ_API_KEY:
    try:
        direct_groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Failed to init direct Groq client: {e}")

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
    quiz: List[Dict]
    review_cards: List[Dict]
    report: str
    slides: List[Dict]
    table: List[Dict]
    guide: Dict
    podcast_script: List[Dict]
    overview_script: str
    options: Dict

# --- NODES ---

def chunk_document(state: DeckState):
    print("--- NODE: CHUNKER ---")
    text = state['original_text']
    splitter = RecursiveCharacterTextSplitter(chunk_size=25000, chunk_overlap=500)
    docs = splitter.create_documents([text])
    chunks = [d.page_content for d in docs]
    print(f"Created {len(chunks)} chunks.")
    return {"chunks": chunks}

from langchain_core.messages import SystemMessage

# ... (Previous imports)

# ...

def generate_report_node(state: DeckState):
    print("--- NODE: REPORT GEN ---")
    text = state['original_text'][:50000] 
    
    system_instruction = """You are an expert researcher. Create a comprehensive Deep Research Report based on the provided text.
    Format the output in beautiful, professional Markdown.
    
    Structure:
    # Title
    ## Executive Summary
    ## Key Findings (bullet points)
    ## Detailed Analysis (sections)
    ## Conclusion
    """
    
    try:
        content = ""
        if google_client and model_is_google_native:
            # ... (Google SDK code remains same)
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction},
                    contents=f"TEXT: {text}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Report Gen Error: {e}")

        if not content and llm:
            # FIX: Use SystemMessage to avoid variable parsing in the instruction
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm
            res = chain.invoke({"text": text})
            content = res.content
            
        print(f"Report generated ({len(content)} chars)")
        return {"report": content}
    except Exception as e:
        print(f"Report Gen Error: {e}")
        return {"report": "# Error generating report\n" + str(e)}

def generate_slides_node(state: DeckState):
    print("--- NODE: SLIDES GEN ---")
    text = state['original_text'][:30000]
    
    # We need to ensure braces for JSON are doubled if we were using f-strings, 
    # but here it's a static string usually, except we might have injected options (not yet for slides).
    # Since we are essentially passing this as a raw string to SystemMessage, we don't need to double-escape 
    # for LangChain if we use SystemMessage(content=...). 
    # BUT if we use simple string "system" tuple, LangChain parses it.
    
    system_instruction = """You are a presentation expert. Create a slide deck based on the text. 
    Respond ONLY with JSON matching this structure:
    {
      "slides": [
        { "title": "Slide Title", "content": "Bullet points or short text", "type": "bullet" },
        { "title": "Conclusion", "content": "Summary text", "type": "paragraph" }
      ]
    }
    Create 5-8 slides.
    """
    
    try:
        content = ""
        if google_client and model_is_google_native:
             # ... (Google SDK code)
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Slides Gen Error: {e}")

        if not content and llm:
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | JsonOutputParser()
            res = chain.invoke({"text": text})
            return {"slides": res.get("slides", [])}
            
        # ... (Parsing logic)
        if content:
             # ...
             pass

    except Exception as e:
        print(f"Slides Gen Error: {e}")
        return {"slides": []}
    return {"slides": []}

def generate_table_node(state: DeckState):
    print("--- NODE: TABLE GEN ---")
    text = state['original_text'][:30000]
    
    system_instruction = """You are a data analyst. Extract key structured data from the text into a JSON table.
    Identify the most important entities (rows) and attributes (columns).
    Respond ONLY with JSON matching:
    {
      "columns": ["Name", "Date", "Value", "Notes"],
      "rows": [
        { "Name": "Item A", "Date": "2023-01", "Value": "100", "Notes": "..." },
        { "Name": "Item B", "Date": "2023-02", "Value": "200", "Notes": "..." }
      ]
    }
    """
    
    try:
        content = ""
        if google_client and model_is_google_native:
            # ...
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Table Gen Error: {e}")

        if not content and llm:
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | JsonOutputParser()
            res = chain.invoke({"text": text})
            return {"table": [res]} if isinstance(res, dict) else {"table": res}
            
        # ...
        if content:
             # ...
             pass
    except Exception as e:
        print(f"Table Gen Error: {e}")
        return {"table": []}
    return {"table": []}


def generate_flowchart_node(state: DeckState):
    print("--- NODE: FLOWCHART GEN ---")
    text = state['original_text'][:15000]
    
    options = state.get('options', {})
    instructions = options.get('instructions', '')
    
    # Using f-string for python variable injection
    # We use single braces for JSON examples because we will pass this to SystemMessage
    system_instruction = f"""You are an expert at creating mind maps. Generate a helper Mermaid.js flowchart syntax based on the provided text. 

RULES:
1. Return ONLY the mermaid code, starting with 'graph TD'.
2. No markdown backticks.
3. ALWAYS use double quotes for labels: e.g., A["My Label"].
4. Avoid special characters like (), [], {{}}, or --> inside labels.
5. STRUCTURE: Start with EXACTLY ONE central root node representing the main topic, then branch out hierarchically. Do not create disconnected graphs.

USER PREFERENCES:
{instructions}
"""
    
    prompt_text = f"TEXT TO ANALYZE:\n{text}"

    content = ""
    try:
        # ... (Groq and Google SDK logic remains the same)
        # 3. Fallback to LangChain
        if not content and llm:
            print("DEBUG: Using LangChain wrapper for Flowchart")
            # Use SystemMessage to prevent re-templating of the instruction including potential user input chars
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "{text}")
            ]
            full_prompt = ChatPromptTemplate.from_messages(messages)
            chain = full_prompt | llm
            res = chain.invoke({"text": text})
            content = res.content
            # ...
            
        # ... (Rest of logic)

    except Exception as e:
        # ...
        pass
        
    # Re-implementing the function body briefly for the replacement:
    
    if not content and google_client and model_is_google_native:
         try:
             res = google_client.models.generate_content(
                 model=target_google_model,
                 config={'system_instruction': system_instruction},
                 contents=prompt_text
             )
             content = res.text
         except Exception as e:
             print(f"Native Flowchart Error: {e}")
             
    if not content and llm:
         messages = [
             SystemMessage(content=system_instruction),
             ("user", "{text}")
         ]
         full_prompt = ChatPromptTemplate.from_messages(messages)
         chain = full_prompt | llm
         res = chain.invoke({"text": text})
         content = res.content
         if isinstance(content, list):
             content = " ".join([str(part.get('text', part)) if isinstance(part, dict) else str(part) for part in content])
             
    if not content:
         return {"flowchart": "graph TD\nError[Generation Failed]"}

    content = content.replace('```mermaid', '').replace('```', '').strip()
    if not content.startswith('graph') and not content.startswith('flowchart') and not content.startswith('mindmap'):
         lines = content.split('\n')
         for i, line in enumerate(lines):
             if line.strip().startswith('graph') or line.strip().startswith('flowchart'):
                 content = '\n'.join(lines[i:])
                 break
         else:
             content = "graph TD\n" + content
             
    return {"flowchart": content}


def generate_cards_node(state: DeckState):
    print("--- NODE: CARD GEN ---")
    chunks = state.get('chunks', [])
    if not chunks:
        return {"partial_cards": []}
    
    options = state.get('options', {})
    count = options.get('count', 5)
    difficulty = options.get('difficulty', 'medium')
    instructions = options.get('instructions', '')

    # Use single braces for JSON schema in SystemMessage
    system_instruction = f"""You are an expert educator. Based on the text, create {count} high-quality flashcards. 
Difficulty Level: {difficulty}.
Special Instructions: {instructions}
Respond ONLY with JSON matching the format: {{ "cards": [{{ "q": "...", "a": "..." }}] }}
"""
    
    new_cards = []
    for chunk in chunks:
        try:
            content = ""
            if google_client and model_is_google_native:
                 # ...
                 try:
                     res = google_client.models.generate_content(
                         model=target_google_model,
                         config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                         contents=f"TEXT: {chunk}"
                     )
                     content = res.text
                 except Exception as e:
                     print(f"Native Card Gen Error: {e}")

            if not content and llm:
                print("DEBUG: Using LangChain wrapper for Cards")
                parser = JsonOutputParser(pydantic_object=CardList)
                messages = [
                    SystemMessage(content=system_instruction),
                    ("user", "TEXT: {text}")
                ]
                prompt = ChatPromptTemplate.from_messages(messages)
                chain = prompt | llm | parser
                res = chain.invoke({"text": chunk})
                if 'cards' in res:
                    new_cards.extend(res['cards'])
                continue 

            if content:
                content = content.replace("```json", "").replace("```", "").strip()
                data = json.loads(content, strict=False)
                if 'cards' in data:
                    new_cards.extend(data['cards'])

        except Exception as e:
            print(f"Card Chunk Error: {e}")
    
    return {"partial_cards": new_cards}

# ...

def generate_quiz_node(state: DeckState):
    print("--- NODE: QUIZ GEN ---")
    text = state['original_text'][:25000]
    
    options = state.get('options', {})
    count = options.get('count', 5)
    difficulty = options.get('difficulty', 'medium')
    instructions = options.get('instructions', '')
    
    system_instruction = f"""You are an expert examiner. Create a challenging multiple-choice quiz ({count} questions) based on the provided text.
    Difficulty Level: {difficulty}.
    Special Instructions: {instructions}.
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
                 print(f"Native Quiz Gen Error: {e}")

        if not content and llm:
            print("DEBUG: Using LangChain for Quiz Gen")
            parser = JsonOutputParser(pydantic_object=QuizList)
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | parser
            res = chain.invoke({"text": text})
            return {"quiz": res.get("quiz", [])}

        if content:
            content = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(content, strict=False)
            return {"quiz": data.get("quiz", [])}
            
    except Exception as e:
        print(f"Quiz Gen Error: {e}")
        return {"quiz": []}

def generate_review_node(state: Dict):
    print("--- NODE: REVIEW GEN ---")
    missed_questions = state.get('missed_questions', [])
    if not missed_questions:
        return {"review_cards": []}
        
    system_instruction = "Based on the questions the student missed, create ultra-focused flashcards to help them master those specific concepts. Respond ONLY with JSON: { \"cards\": [{ \"q\": \"...\", \"a\": \"...\" }] }"
    
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
                 print(f"Native Review Gen Error: {e}")

        if content:
            data = json.loads(content.replace("```json", "").replace("```", "").strip(), strict=False)
            return {"review_cards": data.get("cards", [])}
            
        if llm:
             parser = JsonOutputParser(pydantic_object=CardList)
             messages = [
                SystemMessage(content=system_instruction),
                ("user", "MISSED:\n{text}")
             ]
             prompt = ChatPromptTemplate.from_messages(messages)
             chain = prompt | llm | parser
             res = chain.invoke({"text": context})
             return {"review_cards": res.get("cards", [])}
    except Exception as e:
        print(f"Review Card Gen Error: {e}")
        return {"review_cards": []}

def generate_guide_node(state: DeckState):
    print("--- NODE: GUIDE GEN ---")
    text = state['original_text'][:15000]
    
    system_instruction = """You are an expert AI Guide.
    Create a welcoming, structured summary of the provided text.
    Respond ONLY with JSON matching this format:
    {
      "title": "A catchy, relevant title for the material",
      "summary": "A concise, 2-paragraph summary of the key concepts.",
      "questions": ["Question 1?", "Question 2?", "Question 3?"]
    }
    """
    
    try:
        content = ""
        if google_client and model_is_google_native:
            # ...
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
            except Exception as e:
                print(f"Native Guide Gen Error: {e}")

        if not content and llm:
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm
            res = chain.invoke({"text": text})
            content = res.content
            
        # ...
        if content:
             # parsing...
             pass
             
    except Exception as e:
        print(f"Guide Gen Error: {e}")
        # ...
        pass
    
    # ... logic for parsing content ...
    if content:
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                data = json.loads(content, strict=False)
                return {"guide": data}
            except Exception as e:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(), strict=False)
                        return {"guide": data}
                    except: pass
                # ...
                
    return {"guide": {}}

def generate_podcast_script_node(state: DeckState):
    print("--- NODE: PODCAST SCRIPT GEN ---")
    text = state['original_text'][:40000]
    
    options = state.get('options', {})
    mode = options.get('mode', 'default') # default, brief, summarized
    length_hint = ""
    if mode == 'brief':
        length_hint = "Keep the conversation concise and high-level, about 3-5 minutes."
    elif mode == 'summarized':
        length_hint = "Provide a very short, rapid-fire summary of the key points, about 1-2 minutes."
    else:
        length_hint = "Create a deep-dive conversation, about 8-10 minutes."
        
    system_instruction = f"""You are a professional podcast producer. 
    Create a script for a podcast episode based on the provided text.
    The hosts are "Host A" (Main Host) and "Host B" (Co-Host/Expert).
    
    TONE: Engaging, conversational, natural (use fillers like "Right", "Exactly", "Wow" occasionally).
    GOAL: {length_hint}
    
    Respond ONLY with JSON matching this format:
    {{
      "script": [
        {{ "speaker": "Host A", "text": "Welcome back to the show. Today we're diving into..." }},
        {{ "speaker": "Host B", "text": "That's right! It's a fascinating topic..." }}
      ]
    }}
    """
    
    try:
        # 1. Google Native
        if google_client and model_is_google_native:
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
                if content:
                     data = json.loads(content, strict=False)
                     return {"podcast_script": data.get("script", [])}
            except Exception as e:
                print(f"Native Podcast Script Error: {e}")

        # 2. LangChain Fallback
        if llm:
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | JsonOutputParser()
            res = chain.invoke({"text": text})
            return {"podcast_script": res.get("script", [])}
            
    except Exception as e:
        print(f"Podcast Script Gen Error: {e}")
        
    return {"podcast_script": []}

def generate_overview_script_node(state: DeckState):
    print("--- NODE: OVERVIEW SCRIPT GEN ---")
    text = state['original_text'][:40000]
    
    options = state.get('options', {})
    mode = options.get('mode', 'default')
    
    style_instruction = ""
    if mode == 'brief':
        style_instruction = "Give a 2-minute concise overview of the main concepts."
    elif mode == 'summarized':
        style_instruction = "Give a 1-minute high-level summary."
    else:
        style_instruction = "Give a comprehensive, 5-minute explanation, like a university lecturer."
    
    system_instruction = f"""You are an expert professor.
    Write a spoken monologue script explaining the provided material to a student.
    
    STYLE: Clear, authoritative, easy to follow, educational.
    GOAL: {style_instruction}
    
    Respond ONLY with JSON matching this format:
    {{
      "text": "Hello students. Today we are exploring..."
    }}
    """
    
    try:
         # 1. Google Native
        if google_client and model_is_google_native:
            try:
                res = google_client.models.generate_content(
                    model=target_google_model,
                    config={'system_instruction': system_instruction, 'response_mime_type': 'application/json'},
                    contents=f"TEXT: {text}"
                )
                content = res.text
                if content:
                     data = json.loads(content, strict=False)
                     return {"overview_script": data.get("text", "")}
            except Exception as e:
                print(f"Native Overview Script Error: {e}")
                
        # 2. LangChain Fallback
        if llm:
            messages = [
                SystemMessage(content=system_instruction),
                ("user", "TEXT: {text}")
            ]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | JsonOutputParser()
            res = chain.invoke({"text": text})
            return {"overview_script": res.get("text", "")}
            
    except Exception as e:
        print(f"Overview Script Gen Error: {e}")
        
    return {"overview_script": ""}

def refine_deck(state: DeckState):
    print("--- NODE: REFINER ---")
    # Simple pass-through: In a real app, you might deduplicate or polish here.
    cards = state.get('partial_cards', [])
    return {"final_cards": cards}



# --- GRAPH BUILD ---

workflow = StateGraph(DeckState)
workflow.add_node("chunker", chunk_document)
workflow.add_node("generator", generate_cards_node)
workflow.add_node("flowcharter", generate_flowchart_node)
workflow.add_node("refiner", refine_deck)
# New nodes
workflow.add_node("report_gen", generate_report_node)
workflow.add_node("slides_gen", generate_slides_node)
workflow.add_node("table_gen", generate_table_node)
workflow.add_node("podcast_gen", generate_podcast_script_node)
workflow.add_node("overview_gen", generate_overview_script_node)


workflow.set_entry_point("chunker")
workflow.add_edge("chunker", "generator")
workflow.add_edge("generator", "flowcharter")
workflow.add_edge("flowcharter", "refiner")
workflow.add_edge("refiner", END)

app_graph = workflow.compile()

import time

def run_selective_node(text: str, task_type: str, extra_data: Dict = None):
    # Initialize basic state
    state = {
        "original_text": text, 
        "chunks": [], 
        "partial_cards": [], 
        "final_cards": [], 
        "flowchart": "", 
        "quiz": [], 
        "review_cards": [],
        "report": "",
        "slides": [],
        "report": "",
        "slides": [],
        "table": [],
        "guide": {},
        "options": {}
    }
    if extra_data:
        state.update(extra_data)
        
    for attempt in range(2):
        try:
            # Common Chunking for these tasks if needed, though most new ones prefer full text or large prefix
            # report, slides, table, infographic usually take "original_text" directly in the node function
            
            if task_type == "cards":
                state.update(chunk_document(state))
                state.update(generate_cards_node(state))
                state.update(refine_deck(state))
            elif task_type == "flowchart":
                state.update(generate_flowchart_node(state))
            elif task_type == "quiz":
                state.update(generate_quiz_node(state))
            elif task_type == "review":
                state.update(generate_review_node(state))
            
            # NEW TASKS
            elif task_type == "report":
                state.update(generate_report_node(state))
            elif task_type == "slides":
                state.update(generate_slides_node(state))
            elif task_type == "table":
                state.update(generate_table_node(state))
            elif task_type == "guide":
                state.update(generate_guide_node(state))
            elif task_type == "podcast_script":
                state.update(generate_podcast_script_node(state))
            elif task_type == "overview_script":
                state.update(generate_overview_script_node(state))
                
            return state
        except Exception as e:
            if "429" in str(e) and attempt == 0:
                print(f"--- 429 Quota Limit Hit. Retrying in 2 seconds... ---")
                time.sleep(2)
                continue
            print(f"--- Fatal selective node error: {e} ---")
            return state # Return whatever we have

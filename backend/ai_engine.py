from openai import OpenAI
import os
import json
import pypdf
from dotenv import load_dotenv
from google import genai
import groq

# Load env
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# --- LLM SETUP ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "gemini-flash-latest")

# New Google GenAI Client
google_client = None
if GOOGLE_API_KEY:
    print("--- Using Google AI Engine (New SDK) ---")
    google_client = genai.Client(api_key=GOOGLE_API_KEY)

# OpenRouter Client (OpenAI compatible)
or_client = None
if OPENROUTER_KEY:
    or_client = OpenAI(
    )

# Groq Client
groq_client = None
if GROQ_API_KEY:
    print("--- Using Groq AI Engine ---")
    groq_client = groq.Groq(api_key=GROQ_API_KEY)

def extract_text(pdf_path):
    text = ""
    try:
        reader = pypdf.PdfReader(pdf_path)
        for page in reader.pages:
            result = page.extract_text()
            if result:
                text += result + "\n"
    except Exception as e:
        print(f"PDF Error: {e}")
    return text

def generate_flashcards(file_path):
    # 1. Extract
    text = extract_text(file_path)
    if not text:
        return []

    # 2. Prompt
    prompt = f"""
    You are an Anki Card Generator.
    Analyze the following text and create 5-10 high-quality flashcards.
    Return ONLY a raw JSON array. No markdown formatting.
    Format:
    [
        {{"q": "Question 1", "a": "Answer 1"}},
        {{"q": "Question 2", "a": "Answer 2"}}
    ]
    
    TEXT TO ANALYZE:
    {text}
    """

    # 3. Call AI
    try:
        content = ""
        # Ensure models with ':free' or other provider prefixes go to OpenRouter, not native Google
        model_is_google_native = "gemini" in AI_MODEL.lower() and ":" not in AI_MODEL
        model_is_groq_native = any(x in AI_MODEL.lower() for x in ["llama", "mixtral", "gemma"])

        # Try Groq if it's a Groq model
        if groq_client and model_is_groq_native:
            try:
                res = groq_client.chat.completions.create(
                    model=AI_MODEL,
                    messages=[{"role": "user", "content": prompt}]
                )
                content = res.choices[0].message.content
            except Exception as e:
                print(f"Groq SDK Error: {e}")

        # Try Google if it's a Gemini model
        if not content and google_client and model_is_google_native:
            try:
                # Use standard gemini if the requested one isn't 1.5/2.0
                target_model = AI_MODEL if ("gemini" in AI_MODEL.lower()) else "gemini-flash-latest"
                res = google_client.models.generate_content(
                    model=target_model,
                    contents=prompt
                )
                content = res.text
            except Exception as e:
                print(f"Google New SDK Error: {e}")
                if not or_client:
                    raise e

        # Use OpenRouter for non-Gemini models OR as fallback
        if not content and or_client:
            try:
                res = or_client.chat.completions.create(
                    model=AI_MODEL,
                    messages=[{"role": "user", "content": prompt}]
                )
                content = res.choices[0].message.content
            except Exception as e:
                print(f"OpenRouter Error: {e}")
                # Secondary fallback to google if primary failed
                if google_client and not model_is_google_native:
                    res = google_client.models.generate_content(
                        model="gemini-flash-latest",
                        contents=prompt
                    )
                    content = res.text
                else:
                    raise e
        
        if not content:
            raise Exception("AI providers failed or returned empty content.")
        
        # Cleanup potential markdown ticks
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)

    except Exception as e:
        print(f"AI Card Gen Error: {e}")
        return []

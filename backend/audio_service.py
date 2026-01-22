import os
import asyncio
import edge_tts
from gtts import gTTS
import uuid

# Audio Storage Path
DATA_DIR = "data"
AUDIO_DIR = os.path.join(DATA_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Voices for Edge TTS (fallback)
VOICE_HOST_A = "en-US-GuyNeural"      # Male Host
VOICE_HOST_B = "en-US-AriaNeural"     # Female Host
VOICE_TEACHER = "en-US-BrianNeural"   # Teacher

# Voice mapping for gTTS (primary)
GTTS_VOICE_MAP = {
    "host_a": {"lang": "en", "tld": "com"},      # US English Male-ish
    "host_b": {"lang": "en", "tld": "co.uk"},    # UK English Female-ish
    "teacher": {"lang": "en", "tld": "com"},     # US English Teacher
}

async def generate_speech_file_gtts(text: str, voice_type: str, filename: str) -> str:
    """Generates speech using Google TTS (primary, free service)."""
    ensure_dir = os.path.dirname(filename)
    if not os.path.exists(ensure_dir):
        os.makedirs(ensure_dir, exist_ok=True)
    
    try:
        # Get voice settings
        voice_settings = GTTS_VOICE_MAP.get(voice_type, GTTS_VOICE_MAP["teacher"])
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=voice_settings["lang"], tld=voice_settings["tld"], slow=False)
        
        # Save to file (run in executor to avoid blocking)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, tts.save, filename)
        
        print(f"✅ Audio generated with gTTS (Google TTS)")
        return filename
    except Exception as e:
        print(f"❌ gTTS failed: {e}")
        raise

async def generate_speech_file_edge(text: str, voice: str, filename: str) -> str:
    """Generates speech using Edge TTS (fallback service)."""
    ensure_dir = os.path.dirname(filename)
    if not os.path.exists(ensure_dir):
        os.makedirs(ensure_dir, exist_ok=True)
        
    max_retries = 5
    last_error = None

    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(text, voice)
            await asyncio.wait_for(communicate.save(filename), timeout=90.0)
            print(f"✅ Audio generated with Edge TTS on attempt {attempt + 1}")
            return filename
        except asyncio.TimeoutError:
            last_error = "Connection timed out"
            print(f"⚠️ Edge TTS Attempt {attempt + 1}/{max_retries} timed out. Retrying...")
        except Exception as e:
            last_error = str(e)
            print(f"⚠️ Edge TTS Attempt {attempt + 1}/{max_retries} failed: {e}. Retrying...")
        
        if attempt < max_retries - 1:
            delay = 2 ** attempt
            print(f"   Waiting {delay}s before retry...")
            await asyncio.sleep(delay)

    raise Exception(f"Failed to generate audio with Edge TTS after {max_retries} attempts. Last error: {last_error}")

async def generate_speech_file(text: str, voice: str, filename: str, voice_type: str = "teacher") -> str:
    """
    Generates speech file with automatic fallback.
    Primary: Google TTS (gTTS) - Free and reliable
    Fallback: Edge TTS - Higher quality but can be unreliable
    """
    try:
        # Try Google TTS first (primary)
        print(f"🎤 Attempting audio generation with Google TTS...")
        return await generate_speech_file_gtts(text, voice_type, filename)
    except Exception as gtts_error:
        print(f"⚠️ Google TTS failed: {gtts_error}")
        print(f"🔄 Falling back to Edge TTS...")
        
        try:
            # Fallback to Edge TTS
            return await generate_speech_file_edge(text, voice, filename)
        except Exception as edge_error:
            print(f"❌ Both TTS services failed!")
            print(f"   - Google TTS: {gtts_error}")
            print(f"   - Edge TTS: {edge_error}")
            raise Exception(f"All TTS services failed. Google TTS: {gtts_error}, Edge TTS: {edge_error}")

async def create_podcast_audio(script: list, deck_id: str = None) -> str:
    """
    Takes a list of dicts: [{"speaker": "Host A", "text": "..."}, ...]
    Returns path to the final merged mp3.
    Uses deck_id for consistent naming if provided.
    """
    temp_files = []
    
    # Generate individual clips
    for idx, line in enumerate(script):
        speaker = line.get("speaker", "Host A")
        text = line.get("text", "")
        if not text:
            continue
        
        # Determine voice type for gTTS
        voice_type = "host_b" if "Host B" in speaker else "host_a"
        # Edge TTS voice (fallback)
        edge_voice = VOICE_HOST_B if "Host B" in speaker else VOICE_HOST_A
        
        # Temp filename
        temp_filename = os.path.join(AUDIO_DIR, f"temp_{uuid.uuid4()}_{idx}.mp3")
        await generate_speech_file(text, edge_voice, temp_filename, voice_type)
        temp_files.append(temp_filename)
        
    # Merge using binary concatenation
    def merge_audio():
        if deck_id:
            # Use deck_id for consistent naming
            output_filename = os.path.join(AUDIO_DIR, f"podcast_{deck_id}.mp3")
        else:
            # Fallback to UUID if no deck_id provided
            output_filename = os.path.join(AUDIO_DIR, f"podcast_{uuid.uuid4()}.mp3")
        
        with open(output_filename, 'wb') as outfile:
            for f in temp_files:
                try:
                    with open(f, 'rb') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    print(f"Error merging clip {f}: {e}")
        
        return output_filename

    # Execute merge
    loop = asyncio.get_event_loop()
    final_path = await loop.run_in_executor(None, merge_audio)
    
    # Cleanup temp files
    for f in temp_files:
        if os.path.exists(f):
            os.remove(f)
            
    return final_path

async def create_overview_audio(text: str, deck_id: str = None) -> str:
    """
    Generates a monologue audio file.
    Uses deck_id for consistent naming if provided.
    """
    if deck_id:
        # Use deck_id for consistent naming
        output_filename = os.path.join(AUDIO_DIR, f"overview_{deck_id}.mp3")
    else:
        # Fallback to UUID if no deck_id provided
        output_filename = os.path.join(AUDIO_DIR, f"overview_{uuid.uuid4()}.mp3")
    
    await generate_speech_file(text, VOICE_TEACHER, output_filename, "teacher")
    return output_filename

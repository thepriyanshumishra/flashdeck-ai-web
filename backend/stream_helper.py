
from agent_graph import google_client, model_is_google_native, target_google_model, llm, ChatPromptTemplate

# Add this to agent_graph.py

def stream_report(text: str):
    """
    Generator for streaming report content.
    """
    system_instruction = """You are an expert researcher. Create a comprehensive Deep Research Report based on the provided text.
    Format the output in beautiful, professional Markdown.
    Structure:
    # Title
    ## Executive Summary
    ## Key Findings (bullet points)
    ## Detailed Analysis (sections)
    ## Conclusion
    """
    
    # 1. Native Google Stream
    if google_client and model_is_google_native:
        try:
            # Note: stream=True
            response = google_client.models.generate_content(
                model=target_google_model,
                config={'system_instruction': system_instruction},
                contents=f"TEXT: {text}",
                stream=True
            )
            for chunk in response:
                yield chunk.text
            return
        except Exception as e:
            print(f"Native Stream Error: {e}")

    # 2. LangChain/OpenRouter Stream
    # 2. LangChain/OpenRouter Stream
    if llm:
        from langchain_core.messages import SystemMessage
        messages = [
            SystemMessage(content=system_instruction),
            ("user", "TEXT: {text}")
        ]
        prompt = ChatPromptTemplate.from_messages(messages)
        chain = prompt | llm
        
        # Stream the output
        for chunk in chain.stream({"text": text}):
             content = chunk.content if hasattr(chunk, 'content') else str(chunk)
             yield content

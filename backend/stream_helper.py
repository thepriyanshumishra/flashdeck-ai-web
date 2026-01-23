from agent_graph import llm, ChatPromptTemplate

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

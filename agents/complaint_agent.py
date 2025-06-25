import ollama
import asyncio
import json

# Read the system prompt from the file
with open('prompt.txt', 'r') as f:
    SYSTEM_PROMPT = f.read()

async def process_complaint(text: str, send_log):
    await send_log({"type": "thought", "message": "Starting complaint processing with Ollama..."})
    await asyncio.sleep(1)

    try:
        await send_log({"type": "thought", "message": "Connecting to Ollama and sending prompt..."})
        
        response = ollama.chat(
            model='YOUR_MODEL_NAME_HERE', # IMPORTANT: Change this to your model name
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': text},
            ],
            format='json'
        )
        
        await send_log({"type": "thought", "message": "Received response from Ollama."})
        await asyncio.sleep(1)

        # The response from ollama.chat is a dictionary, get the message content
        message_content = response['message']['content']
        
        # The content is a JSON string, so we parse it
        parsed_response = json.loads(message_content)

        await send_log({"type": "result", "data": parsed_response})
        return parsed_response

    except Exception as e:
        error_message = f"An error occurred while processing with Ollama: {e}"
        await send_log({"type": "thought", "message": error_message})
        # Optionally, return a specific error structure to the client
        return {"error": error_message}
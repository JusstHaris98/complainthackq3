import ollama
import asyncio
import json

# Read the system prompt from the file
with open('prompt.txt', 'r') as f:
    SYSTEM_PROMPT = f.read()

# Read the Athena treatment guidelines
with open('treatment/athena_mock_treatment.txt', 'r') as f:
    ATHENA_TREATMENT = f.read()

async def process_complaint(text: str, send_log):
    await send_log({"type": "thought", "message": "Starting complaint processing with Ollama..."})
    await asyncio.sleep(1)

    try:
        await send_log({"type": "thought", "message": "Accessing Athena knowledge store for treatment guidelines..."})
        await asyncio.sleep(0.5)
        
        await send_log({"type": "thought", "message": "Connecting to Ollama and sending enhanced prompt with treatment context..."})
        
        # Create enhanced prompt with treatment guidelines
        enhanced_prompt = f"""{SYSTEM_PROMPT}

ATHENA KNOWLEDGE STORE - TREATMENT GUIDELINES:
{ATHENA_TREATMENT}

INSTRUCTIONS:
1. Analyze the complaint text using the system prompt guidelines
2. Reference the Athena treatment guidelines above to create appropriate action plans
3. Ensure your proposed_action_plan incorporates specific steps from the treatment guidelines
4. Match the complaint type to the relevant treatment strategy from Athena
5. Include UK banking regulations and timescales as specified in the treatment guidelines
"""
        
        response = ollama.chat(
            model='llama3.2:1b', # IMPORTANT: Change this to your model name
            messages=[
                {'role': 'system', 'content': enhanced_prompt},
                {'role': 'user', 'content': text},
            ],
            format='json',
            options={'timeout': 60}  # 60 second timeout
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
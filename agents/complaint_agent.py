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
        
        # Get current date for incident date
        from datetime import datetime
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Create enhanced prompt with treatment guidelines
        treatment_plan_prompt = SYSTEM_PROMPT.replace('{ATHENA_TREATMENT}', ATHENA_TREATMENT).replace('{COMPLAINT_TEXT}', text)

        response = ollama.chat(
            model='llama3.2:1b', # IMPORTANT: Change this to your model name
            messages=[
                {'role': 'user', 'content': treatment_plan_prompt}
            ],
            format='json',
            options={'timeout': 60}  # 60 second timeout
        )
        
        await send_log({"type": "thought", "message": "Received response from Ollama."})
        await asyncio.sleep(1)

        plan = response['message']['content']
        

        # plan_response = ollama.chat(
        #     model='llama3.2:1b', # IMPORTANT: Change this to your model name
        #     messages=[
        #         {'role': 'user', 'content': f"""You are an agentic AI. Your goal is to convert the plan to a correct JSON format so that it can be executed by an opeational agent or another AI agent. Each step needs to include the following fields plan_response Plan format for each step to use:
        # {{"step_number": 1,
        # "description": "Acknowledge receipt of the complaint to the customer within **3 business days**, as per **FCA DISP 1.4.1 R**. Ensure empathetic tone reflecting customer's reported frustration with helpline wait times.",
        # "responsible_party": "Complaint Handler",
        # "system_to_call": "Communications_Platform", // New field
        # "details_from_athena": "DISP 1.4.1 R requirements for initial acknowledgement.",
        # "status": "pending",
        # "reason_for_status": null}}
        #          plan to convert to JSON format:
        #          {response['message']['content']}
        #          """}
        #     ],
        #     format='json',
        #     options={'timeout': 60}  # 60 second timeout
        # )

        # The response from ollama.chat is a dictionary, get the message content
        message_content = response['message']['content']

        # Debug: Log the raw response for troubleshooting
        await send_log({"type": "thought", "message": f"Raw AI response: {message_content}..."})
        
        # The content is a JSON string, so we parse it
        try:
            parsed_response = json.loads(message_content)
            await send_log({"type": "thought", "message": f"Successfully parsed JSON with fields: {list(parsed_response.keys())}"})
        except json.JSONDecodeError as e:
            await send_log({"type": "thought", "message": f"JSON parsing error: {str(e)}. Raw content: {message_content}"})
            # Return a fallback response with the raw content
            parsed_response = {
                "error": "JSON parsing failed",
                "raw_response": message_content,
                "complaint_id": "ERROR_PARSE",
                "summary": f"Failed to parse AI response: {str(e)}"
            }

        await send_log({"type": "result", "data": parsed_response})
        return parsed_response

    except Exception as e:
        error_message = f"An error occurred while processing with Ollama: {e}"
        await send_log({"type": "thought", "message": error_message})
        # Optionally, return a specific error structure to the client
        return {"error": error_message}
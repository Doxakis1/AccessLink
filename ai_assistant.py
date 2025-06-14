import speech_recognition as sr
import google.generativeai as genai
from twilio.rest import Client
import requests
import geocoder
#from shake_detector import ShakeDetector
import threading
import pyttsx3
import json
import re

# Configuration
GOOGLE_API_KEY = "your_api_key"  # Replace with your actual Google API key
TWILIO_SID = "your_sid" # Replace with your actual Twilio SID
TWILIO_TOKEN = "your_token" # Replace with your actual Twilio Auth Token
EMERGENCY_CONTACTS = ["+305367758589"] # Replace with actual emergency contact numbers

# Initialize services
genai.configure(api_key=GOOGLE_API_KEY)
preferred_models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro", "gemini-pro-vision"]
tts_engine = pyttsx3.init()
recognizer = sr.Recognizer()
twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)

def get_working_model(preferred_models):
    """
    Try to initialize and return the first available GenerativeModel from the list.
    """
    for model_name in preferred_models:
        try:
            # Try to instantiate and make a simple call to check if the model works
            model = genai.GenerativeModel(model_name)
            # Try a minimal generation to verify
            test_response = model.generate_content("Hello")
            if hasattr(test_response, "text"):
                print(f"Using model: {model_name}")
                return model
        except Exception as e:
            print(f"Model '{model_name}' failed: {e}")
    raise RuntimeError("No available generative models found.")

model = get_working_model(preferred_models)

class VoiceAssistant:
    def __init__(self):
        self.running = True
        #self.shake_detector = ShakeDetector(self.emergency_trigger)
        self.current_location = None
        
    def speak(self, text):
        """Convert text to speech"""
        tts_engine.say(text)
        tts_engine.runAndWait()

    def listen(self):
        """Listen for voice commands"""
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source, timeout=3, phrase_time_limit=5)
            try:
                print("Recognizing...")
                text = recognizer.recognize_google(audio)
                print(f"Recognized: {text}")
                return text
            except sr.UnknownValueError:
                print("Could not understand audio.")
                self.speak("Could not understand audio.")
                return ""
            except sr.RequestError as e:
                print(f"Speech recognition error: {e}")
                return ""

    def emergency_trigger(self):
        """Handle emergency shake detection"""
        self.current_location = geocoder.ip('me').latlng
        self.send_emergency_alerts()
        self.speak("Emergency alert sent to nearby contacts")

    def send_emergency_alerts(self):
        """Send SMS alerts with location"""
        for number in EMERGENCY_CONTACTS:
            twilio_client.messages.create(
                body=f"EMERGENCY ALERT! User needs help at {self.current_location}",
                from_='+140000000035',  # Replace with your Twilio number
                to=number
            )

    def process_command(self, command):
        """Process commands with Gemini AI (single-threaded)"""
        prompt = (
            f"User command: {command}\n"
            "App functions available:\n"
            "- Emergency alert\n"
            "- News updates\n"
            "- Navigation help\n"
            "- Community support\n"
            'Respond with JSON: {"action": "...", "response": "..."}'
        )
        response = model.generate_content(prompt)
        print(f"AI Response: {response.text}")
        try:
            parsed_response = safe_json_parse(response.text)
            return parsed_response
        except Exception as e:
            print(f"AI response error: {e}")
            return {"action": "unknown", "response": "Sorry, I didn't understand."}

    def handle_updates(self):
        """Fetch accessibility-related updates"""
        try:
            updates = requests.get("YOUR_UPDATES_API_URL").json()
            self.speak("Latest updates: " + updates.get('summary', 'No updates available.'))
        except Exception as e:
            print(f"Update fetch error: {e}")
            self.speak("Sorry, I couldn't fetch updates.")

    def main_loop(self):
        """Main interaction loop"""
        self.speak("Welcome to AccessAid. How can I help you today?")
        print("Listening for commands...")

        while self.running:
            command = self.listen()
            if command:
                print(f"Recognized: {command}")
                action = self.process_command(command)
                if action['action'] == 'emergency':
                    self.emergency_trigger()
                elif action['action'] == 'updates':
                    self.handle_updates()
                # Add other actions here
                self.speak(action['response'])

def safe_json_parse(response_text):
    # Remove code block markers if present
    response_text = response_text.strip()
    if response_text.startswith("```"):
        # Remove the code block markers and language hint
        response_text = re.sub(r"^```json|^```", "", response_text, flags=re.IGNORECASE).strip()
        response_text = response_text.rstrip("`").strip()
    # Now extract the JSON object
    match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if match:
        json_str = match.group(0)
        print(f"Extracted JSON string: {json_str}")  # Print the JSON string for testing
        try:
            parsed = json.loads(json_str)
            print(f"Parsed JSON object: {parsed}")   # Print the parsed object for testing
            return parsed
        except Exception as e:
            print(f"JSON decode error: {e}")
    else:
        print(f"No JSON object found in input: {response_text}")
    print("Failed to parse valid JSON from response.")
    return {"action": "unknown", "response": "Sorry, I didn't understand."}

if __name__ == "__main__":
    assistant = VoiceAssistant()
    assistant.main_loop()

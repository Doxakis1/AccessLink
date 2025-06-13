import speech_recognition as sr
import google.generativeai as genai
from twilio.rest import Client
import requests
import geocoder
#from shake_detector import ShakeDetector
import threading
import pyttsx3
import ast
import json

# Configuration
GOOGLE_API_KEY = "your_api_key"  # Replace with your actual Google API key
TWILIO_SID = "your_sid"
TWILIO_TOKEN = "your_token"
EMERGENCY_CONTACTS = ["+305367758589"]

# Initialize services
genai.configure(api_key=GOOGLE_API_KEY)
preferred_models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro", "gemini-pro-vision"]
model = None
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
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            try:
                print("Recognizing...")
                text = recognizer.recognize_google(audio)
                print(f"Recognized: {text}")
                return text
            except:
                return ""

    def emergency_trigger(self):
        """Handle emergency shake detection"""
        self.current_location = geocoder.ip('me').latlng
        self.send_emergency_alerts()
        self.speak("Emergency alert sent to nearby contacts")

    def send_emergency_alerts(self):
        """Send SMS alerts with location"""
        for number in EMERGENCY_CONTACTS:
            message = twilio_client.messages.create(
                body=f"EMERGENCY ALERT! User needs help at {self.current_location}",
                from_='+1234567890',
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
        parsed_response = {}
        try:
            response_stripped = response.text.split('{')[1]
            response_stripped = response_stripped.split('}')[0]
            for elem in response_stripped('\",'):
                elem += '"'
                elem_outer = elem.split(':')[0]
                print(f"Outer Element: {elem_outer}")
                elem_inner = elem.split(':')[1]
                print(f"Inner Element: {elem_inner}")
                parsed_response[elem_outer] = elem_inner
            print(f"Parsed Response: {parsed_response}")
            return {"action": parsed_response["action"], "response": parsed_response["response"]}
            return json.loads(response.text)  # Safely parse the AI's JSON response
            # return ast.literal_eval(response.text)  # Safely evaluate the AI's resp~onse
            # return response.text
            # Safely parse the AI's JSON response
            # import json
            # return json.loads(response.text)
        except Exception as e:
            print(f"AI response error: {e}")
            return {"action": "unknown", "response": "Sorry, I didn't understand."}

    def handle_updates(self):
        """Fetch accessibility-related updates"""
        updates = requests.get("YOUR_UPDATES_API_URL").json()
        self.speak("Latest updates: " + updates['summary'])

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

if __name__ == "__main__":
    assistant = VoiceAssistant()
    assistant.main_loop()

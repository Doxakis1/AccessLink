import pyttsx3
import time

class DemoAssistant:
    def __init__(self):
        self.tts_engine = pyttsx3.init()

    def speak(self, text):
        print(f"Assistant: {text}")
        self.tts_engine.say(text)
        self.tts_engine.runAndWait()

    def demo_emergency(self):
        # Simulate recognizing an emergency command
        self.speak("Listening...")
        time.sleep(3)
        print("Recognized: Emergency!")
        self.speak("Emergency detected. Calling emergency services. Please stay on the line.")
        # Simulate sending alerts
        time.sleep(1)
        self.speak("Emergency alert sent. Help is on the way.")

if __name__ == "__main__":
    demo = DemoAssistant()
    demo.speak("Welcome to AccessAid. I am ready to assist you.")
    demo.demo_emergency()
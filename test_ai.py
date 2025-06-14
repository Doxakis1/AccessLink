from ai_assistant import AIAssistant
import unittest

class TestAIAssistant(unittest.TestCase):
    def setUp(self):
        self.assistant = AIAssistant()

    def test_emergency_response(self):
        response = self.assistant.process_command("I need emergency help!")
        self.assertIn('emergency', response['action'])
        self.assertIn('alert', response['response'].lower())

    def test_navigation_request(self):
        response = self.assistant.process_command("How do I get to the hospital?")
        self.assertIn('navigate', response['action'])
        self.assertIn('route', response['response'].lower())

    def test_feature_explanation(self):
        response = self.assistant.process_command("How does the emergency feature work?")
        self.assertIn('explain', response['action'])
        self.assertIn('explain', response['response'].lower())

if __name__ == '__main__':
    unittest.main()

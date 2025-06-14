import keyboard

def on_shake():
    print("Shake simulated!")

keyboard.add_hotkey('s', on_shake)
print("Press 's' to simulate shake.")
keyboard.wait('esc')  # Press 'esc' to exit


//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button2BounceGuard = false;
long button2LastDebounceTime = 0;
            

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;
            

long stateEntryTime = 0;
	

	void setup(){
		pinMode(11, OUTPUT); // buzzer [Actuator]
		pinMode(10, INPUT); // button2 [Sensor]
		pinMode(9, INPUT); // button1 [Sensor]
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){

				case off:
					digitalWrite(11,LOW);
					button1BounceGuard = millis() - button1LastDebounceTime > debounce;
					button2BounceGuard = millis() - button2LastDebounceTime > debounce;
					if (button1BounceGuard && button2BounceGuard) {
						if (digitalRead(9) == HIGH && digitalRead(10) == HIGH) {
							currentState = on;
							stateEntryTime = millis();
							button1LastDebounceTime = millis();
							button2LastDebounceTime = millis();
						}
					}
				break;
				case on:
					digitalWrite(11,HIGH);
					button1BounceGuard = millis() - button1LastDebounceTime > debounce;
					button2BounceGuard = millis() - button2LastDebounceTime > debounce;
					if (button1BounceGuard && button2BounceGuard) {
						if (digitalRead(9) == LOW || digitalRead(10) == LOW) {
							currentState = off;
							stateEntryTime = millis();
							button1LastDebounceTime = millis();
							button2LastDebounceTime = millis();
						}
					}
				break;
		}
	}
	

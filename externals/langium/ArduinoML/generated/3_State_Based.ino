
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {start_off, off, start_on, on};

STATE currentState = start_off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;
            

long stateEntryTime = 0;
	

bool screenUpdated = false;
	

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){

				case start_off:
					digitalWrite(12,LOW);
					buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
					if (buttonBounceGuard) {
						if (digitalRead(9) == LOW) {
							currentState = off;
							screenUpdated = false;
							stateEntryTime = millis();
							buttonLastDebounceTime = millis();
						}
					}
				break;
				case off:
					buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
					if (buttonBounceGuard) {
						if (digitalRead(9) == HIGH) {
							currentState = start_on;
							screenUpdated = false;
							stateEntryTime = millis();
							buttonLastDebounceTime = millis();
						}
					}
				break;
				case start_on:
					digitalWrite(12,HIGH);
					buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
					if (buttonBounceGuard) {
						if (digitalRead(9) == LOW) {
							currentState = on;
							screenUpdated = false;
							stateEntryTime = millis();
							buttonLastDebounceTime = millis();
						}
					}
				break;
				case on:
					buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
					if (buttonBounceGuard) {
						if (digitalRead(9) == HIGH) {
							currentState = start_off;
							screenUpdated = false;
							stateEntryTime = millis();
							buttonLastDebounceTime = millis();
						}
					}
				break;
		}
	}
	

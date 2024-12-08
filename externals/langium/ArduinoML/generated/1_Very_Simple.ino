
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;
            

long stateEntryTime = 0;
	

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(11, OUTPUT); // buzzer [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){

				case off:
					digitalWrite(12,LOW);
					digitalWrite(11,LOW);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == HIGH && buttonBounceGuard)) {
				currentState = on;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case on:
					digitalWrite(12,HIGH);
					digitalWrite(11,HIGH);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == LOW && buttonBounceGuard)) {
				currentState = off;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
		}
	}
	

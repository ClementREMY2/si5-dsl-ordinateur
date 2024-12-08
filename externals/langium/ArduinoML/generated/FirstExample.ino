
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;
            

long stateEntryTime = 0;
	

	void setup(){
		pinMode(11, OUTPUT); // red_led [Actuator]
		pinMode(8, INPUT); // button [Sensor]
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){

				case off:
					digitalWrite(11,LOW);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(8) == HIGH && buttonBounceGuard)) {
				currentState = on;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case on:
					digitalWrite(11,HIGH);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(8) == HIGH && buttonBounceGuard)) {
				currentState = off;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
		}
	}
	

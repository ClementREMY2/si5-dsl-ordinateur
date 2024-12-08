operator : null
operator : AND
// Wiring code generated from an ArduinoML model
// Application name: TemporalTransitionScenario!

long debounce = 200;

enum STATE {ledOn, ledOff};
STATE currentState = ledOff;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(9, INPUT);  // button [Sensor]
  pinMode(12, OUTPUT); // led1 [Actuator]
}

void loop() {
	switch(currentState){
		case ledOn:
			digitalWrite(12,HIGH);
			if(millis() - startTime > 800 && digitalRead(9) == LOW) {
				currentState = ledOff;
			}
		break;
		case ledOff:
			digitalWrite(12,LOW);
			if(digitalRead(9) == HIGH) {
				currentState = ledOn;
			}
		break;
	}
}

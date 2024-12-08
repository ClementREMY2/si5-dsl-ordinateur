// Wiring code generated from an ArduinoML model
// Application name: TemporalTransitionScenario!

long debounce = 200;
long startTime = millis();

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
			if(millis() - startTime > 800) {
				startTime = millis();
				currentState = ledOff;
			}
		break;
		case ledOff:
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			digitalWrite(12,LOW);
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				startTime = millis();
				 buttonLastDebounceTime = millis();
				currentState = ledOn;
			}
		break;
	}
}

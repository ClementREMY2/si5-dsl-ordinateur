operator : null
operator : AND
operator : null
operator : OR
// Wiring code generated from an ArduinoML model
// Application name: Scenario2!

long debounce = 200;
long startTime = millis();

enum STATE {off, on};
STATE currentState = off;

boolean button1BounceGuard = false;
long button1LastDebounceTime = 0;

boolean button2BounceGuard = false;
long button2LastDebounceTime = 0;

void setup(){
  pinMode(9, INPUT);  // button1 [Sensor]
  pinMode(10, INPUT);  // button2 [Sensor]
  pinMode(12, OUTPUT); // led [Actuator]
}

void loop() {
	switch(currentState){
		case off:
			buttonBounceGuard = millis() -  buttonLastDebounceTime > debounce;
			digitalWrite(12,LOW);
			if(digitalRead(9) == HIGH && digitalRead(10) == HIGH && buttonBounceGuard ) {
				startTime = millis();
			 button1LastDebounceTime = millis();
			 button2LastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			buttonBounceGuard = millis() -  buttonLastDebounceTime > debounce;
			digitalWrite(12,HIGH);
			if(digitalRead(9) == LOW || digitalRead(10) == LOW && buttonBounceGuard ) {
				startTime = millis();
			 button1LastDebounceTime = millis();
			 button2LastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}


//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {start_off, off, start_buzzing, buzzing, start_led, led_on};

STATE currentState = start_off;

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

				case start_off:
					digitalWrite(12,LOW);
					digitalWrite(11,LOW);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == LOW && buttonBounceGuard)) {
				currentState = off;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case off:
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == HIGH && buttonBounceGuard)) {
				currentState = start_buzzing;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case start_buzzing:
					digitalWrite(11,HIGH);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == LOW && buttonBounceGuard)) {
				currentState = buzzing;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case buzzing:
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == HIGH && buttonBounceGuard)) {
				currentState = start_led;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case start_led:
					digitalWrite(11,LOW);
					digitalWrite(12,HIGH);
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == LOW && buttonBounceGuard)) {
				currentState = led_on;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
				case led_on:
				buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if ((digitalRead(9) == HIGH && buttonBounceGuard)) {
				currentState = start_off;
				stateEntryTime = millis();
				buttonLastDebounceTime = millis();
			}
				break;
		}
	}
	

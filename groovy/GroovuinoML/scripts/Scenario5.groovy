sensor "button" onPin 9
actuator "led1" pin 12

state "ledOn" means "led1" becomes "high"
state "ledOff" means "led1" becomes "low"

initial "ledOff"

from "ledOff" to "ledOn" when "button" becomes "high"
from "ledOn" to "ledOff" after 800

export "TemporalTransitionScenario!"
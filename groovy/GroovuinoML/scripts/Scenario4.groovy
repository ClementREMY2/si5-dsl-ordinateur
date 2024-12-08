sensor "button" onPin 9
actuator "buzzer" pin 11
actuator "led" pin 12

state "buzz" means "buzzer" becomes "high" and "led" becomes "low"
state "ledon" means "buzzer" becomes "low" and "led" becomes "high"
state "off" means "buzzer" becomes "low" and "led" becomes "low"

initial "off"

from "off" to "buzz" when "button" becomes "high"
from "buzz" to "ledon" when "button" becomes "high"
from "ledon" to "off" when "button" becomes "high"

export "Scenario4!"
package main.groovy.groovuinoml.dsl

import io.github.mosser.arduinoml.kernel.behavioral.SensorCondition
import io.github.mosser.arduinoml.kernel.behavioral.Action
import io.github.mosser.arduinoml.kernel.behavioral.State
import io.github.mosser.arduinoml.kernel.behavioral.Transition
import io.github.mosser.arduinoml.kernel.structural.Actuator
import io.github.mosser.arduinoml.kernel.structural.Sensor
import io.github.mosser.arduinoml.kernel.structural.SIGNAL

abstract class GroovuinoMLBasescript extends Script {

	// sensor "name" pin n
	def sensor(String name) {
		[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n) },
		onPin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n)}]
	}
	
	// actuator "name" pin n
	def actuator(String name) {
		[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createActuator(name, n) }]
	}
	
	// state "name" means actuator becomes signal [and actuator becomes signal]*n
	def state(String name) {
		List<Action> actions = new ArrayList<Action>()
		((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().createState(name, actions)
		// recursive closure to allow multiple and statements
		def closure
		closure = { actuator -> 
			[becomes: { signal ->
				Action action = new Action()
				action.setActuator(actuator instanceof String ? (Actuator)((GroovuinoMLBinding)this.getBinding()).getVariable(actuator) : (Actuator)actuator)
				action.setValue(signal instanceof String ? (SIGNAL)((GroovuinoMLBinding)this.getBinding()).getVariable(signal) : (SIGNAL)signal)
				actions.add(action)
				[and: closure]
			}]
		}
		[means: closure]
	}
	
	// initial state
	def initial(state) {
		((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().setInitialState(state instanceof String ? (State)((GroovuinoMLBinding)this.getBinding()).getVariable(state) : (State)state)
	}


	def from(state1) {
		[to: { state2 ->
			Transition transition = ((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().createTransition(
					state1 instanceof String ? (State)((GroovuinoMLBinding)this.getBinding()).getVariable(state1) : (State)state1,
					state2 instanceof String ? (State)((GroovuinoMLBinding)this.getBinding()).getVariable(state2) : (State)state2
			)

			def context = [operator: null]
			def closureTemporal

			def closure
			closure = { sensor ->
				[becomes: { signal ->
					System.out.println("operator : " + context.operator)
					SensorCondition expression = new SensorCondition()
					expression.setSensor(sensor instanceof String ? (Sensor)((GroovuinoMLBinding)this.getBinding()).getVariable(sensor) : (Sensor)sensor)
					expression.setSignal(signal instanceof String ? (SIGNAL)((GroovuinoMLBinding)this.getBinding()).getVariable(signal) : (SIGNAL)signal)

					// Ajoute l'expression à la transition avec l'opérateur actuel
					((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().addExpressionToTransition(
							transition,
							expression.getSensor(),
							expression.getSignal(),
							context.operator
					)
					[
					 and:
						 { sensor2 ->
						 context.operator = "AND"
						 closure(sensor2)
					 },
					 or:
					 { sensor2 ->
						 context.operator = "OR"
						 closure(sensor2)
					 },

					]
				}]
			}

			closureTemporal = { time ->
				((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().addTimingToTransition(
						transition,
						time instanceof Number ? (Number)time : (Number)((GroovuinoMLBinding)this.getBinding()).getVariable(time),
						context.operator
				)
				[and: { sensor2 ->
					context.operator = "AND"
					closure(sensor2)
				},
				 or:
						 { sensor2 ->
							 context.operator = "OR"
							 closure(sensor2)
						 }]
			}


			[when: closure, after: closureTemporal]
		}]
	}



	// export name
	def export(String name) {
		println(((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().generateCode(name).toString())
	}
	
	// disable run method while running
	int count = 0
	abstract void scriptBody()
	def run() {
		if(count == 0) {
			count++
			scriptBody()
		} else {
			println "Run method is disabled"
		}
	}
}

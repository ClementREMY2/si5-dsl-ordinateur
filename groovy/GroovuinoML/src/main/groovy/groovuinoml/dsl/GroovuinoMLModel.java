package main.groovy.groovuinoml.dsl;

import java.util.*;

import groovy.lang.Binding;
import io.github.mosser.arduinoml.kernel.App;
import io.github.mosser.arduinoml.kernel.behavioral.*;
import io.github.mosser.arduinoml.kernel.generator.ToWiring;
import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.Actuator;
import io.github.mosser.arduinoml.kernel.structural.Brick;
import io.github.mosser.arduinoml.kernel.structural.SIGNAL;
import io.github.mosser.arduinoml.kernel.structural.Sensor;

public class GroovuinoMLModel {
	private List<Brick> bricks;
	private List<State> states;
	private State initialState;
	
	private Binding binding;
	
	public GroovuinoMLModel(Binding binding) {
		this.bricks = new ArrayList<Brick>();
		this.states = new ArrayList<State>();
		this.binding = binding;
	}
	
	public void createSensor(String name, Integer pinNumber) {
		Sensor sensor = new Sensor();
		sensor.setName(name);
		sensor.setPin(pinNumber);
		this.bricks.add(sensor);
		this.binding.setVariable(name, sensor);
	}
	
	public void createActuator(String name, Integer pinNumber) {
		Actuator actuator = new Actuator();
		actuator.setName(name);
		actuator.setPin(pinNumber);
		this.bricks.add(actuator);
		this.binding.setVariable(name, actuator);
	}
	
	public void createState(String name, List<Action> actions) {
		State state = new State();
		state.setName(name);
		state.setActions(actions);
		this.states.add(state);
		this.binding.setVariable(name, state);
	}

	public Transition createTransition(State from, State to) {
		Transition transition = new Transition();
		transition.setNext(to);
		State state = states.stream().filter(s -> s.equals(from)).findFirst().orElse(null);
		state.addTransition(transition);
		return transition;
	}

	public void addExpressionToTransition(Transition transition, Sensor sensor, SIGNAL value, String operator) {
		Transition t = states.stream().flatMap(s -> s.getTransitions().stream()).filter(tr -> tr.equals(transition)).findFirst().orElse(null);
		SensorCondition expression = new SensorCondition();
		expression.setSensor(sensor);
		expression.setSignal(value);
		if(operator != null) {
			Expression left = t.getCondition();
			CompositeBinaryExpression expressionBinary = new CompositeBinaryExpression();
			expressionBinary.setLeft(left);
			expressionBinary.setRight(expression);
			expressionBinary.setOperator(BinaryOperator.valueOf(operator));
			t.setCondition(expressionBinary);
		}
		else {
			t.setCondition(expression);
		}

	}

	public void addTimingToTransition(Transition transition, int delay, String operator) {
		Transition t = states.stream().flatMap(s -> s.getTransitions().stream()).filter(tr -> tr.equals(transition)).findFirst().orElse(null);
		TemporalCondition expression = new TemporalCondition();
		expression.setDelay(delay);
		if(operator != null) {
			TemporalCondition left = (TemporalCondition)t.getCondition();
			CompositeBinaryExpression expressionBinary = new CompositeBinaryExpression();
			expressionBinary.setLeft(left);
			expressionBinary.setRight(expression);
			expressionBinary.setOperator(BinaryOperator.valueOf(operator));
			t.setCondition(expressionBinary);
		}
		else {
			t.setCondition(expression);
		}

	}

	
	public void setInitialState(State state) {
		this.initialState = state;
	}
	
	@SuppressWarnings("rawtypes")
	public Object generateCode(String appName) {
		App app = new App();
		app.setName(appName);
		app.setBricks(this.bricks);
		app.setStates(this.states);
		app.setInitial(this.initialState);
		Visitor codeGenerator = new ToWiring();
		app.accept(codeGenerator);
		
		return codeGenerator.getResult();
	}
}

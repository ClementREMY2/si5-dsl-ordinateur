package io.github.mosser.arduinoml.kernel.generator;

import io.github.mosser.arduinoml.kernel.App;
import io.github.mosser.arduinoml.kernel.behavioral.*;
import io.github.mosser.arduinoml.kernel.structural.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Quick and dirty visitor to support the generation of Wiring code
 */
public class ToWiring extends Visitor<StringBuffer> {
	enum PASS {ONE, TWO}


	public ToWiring() {
		this.result = new StringBuffer();
	}

	private void w(String s) {
		result.append(String.format("%s",s));
	}

	@Override
	public void visit(App app) {
		//first pass, create global vars
		context.put("pass", PASS.ONE);
		w("// Wiring code generated from an ArduinoML model\n");
		w(String.format("// Application name: %s\n", app.getName())+"\n");

		w("long debounce = 200;\n");
		w("long startTime = millis();\n");
		w("\nenum STATE {");
		String sep ="";
		for(State state: app.getStates()){
			w(sep);
			state.accept(this);
			sep=", ";
		}
		w("};\n");
		if (app.getInitial() != null) {
			w("STATE currentState = " + app.getInitial().getName()+";\n");
		}

		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}

		//second pass, setup and loop
		context.put("pass",PASS.TWO);
		w("\nvoid setup(){\n");
		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}
		w("}\n");

		w("\nvoid loop() {\n" +
			"\tswitch(currentState){\n");
		for(State state: app.getStates()){
			state.accept(this);
		}
		w("\t}\n" +
			"}");
	}

	@Override
	public void visit(Actuator actuator) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, OUTPUT); // %s [Actuator]\n", actuator.getPin(), actuator.getName()));
			return;
		}
	}


	@Override
	public void visit(Sensor sensor) {
		if(context.get("pass") == PASS.ONE) {
			w(String.format("\nboolean %sBounceGuard = false;\n", sensor.getName()));
			w(String.format("long %sLastDebounceTime = 0;\n", sensor.getName()));
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, INPUT);  // %s [Sensor]\n", sensor.getPin(), sensor.getName()));
			return;
		}
	}

	@Override
	public void visit(State state) {
		if(context.get("pass") == PASS.ONE){
			w(state.getName());
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("\t\tcase " + state.getName() + ":\n");
			List<Sensor> sensors = new ArrayList<>();
			for (Transition transition : state.getTransitions()) {
				Expression condition = transition.getCondition();
				if(condition instanceof SensorCondition){
					SensorCondition sensorCondition = (SensorCondition) condition;
					sensors.add(sensorCondition.getSensor());
				}
				else if(condition instanceof CompositeBinaryExpression){
					CompositeBinaryExpression compositeBinaryExpression = (CompositeBinaryExpression) condition;
					if(compositeBinaryExpression.getLeft() instanceof SensorCondition){
						SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getLeft();
						sensors.add(sensorCondition.getSensor());
					}
					if(compositeBinaryExpression.getRight() instanceof SensorCondition){
						SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getRight();
						sensors.add(sensorCondition.getSensor());
					}
				}

			}
			for(Sensor sensor: sensors){
				w(String.format("\t\t\t%sBounceGuard = millis() - %sLastDebounceTime > debounce;\n",
						sensor.getName(), sensor.getName()));
			}
			for (Action action : state.getActions()) {
				action.accept(this);
			}

			if (state.getTransitions().size() > 0) {
				for (Transition transition : state.getTransitions()) {
					transition.accept(this);
				}
				w("\t\tbreak;\n");
			}
			return;
		}

	}

	@Override
	public void visit(Transition transition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("\t\t\tif(");
			transition.getCondition().accept(this);
//			w(" && buttonBounceGuard ) {\n");
			if(transition.getCondition() instanceof SensorCondition){
				SensorCondition sensorCondition = (SensorCondition) transition.getCondition();
				w(String.format(" && %sBounceGuard", sensorCondition.getSensor().getName()));
			}
			else if(transition.getCondition() instanceof CompositeBinaryExpression){
				CompositeBinaryExpression compositeBinaryExpression = (CompositeBinaryExpression) transition.getCondition();
				if(compositeBinaryExpression.getLeft() instanceof SensorCondition){
					SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getLeft();
					w(String.format(" && %sBounceGuard ", sensorCondition.getSensor().getName()));
				}
				if(compositeBinaryExpression.getRight() instanceof SensorCondition){
					SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getRight();
					w(String.format(" && %sBounceGuard ", sensorCondition.getSensor().getName()));
				}
			}
			w(") {\n");
			w("\t\t\t\tstartTime = millis();\n");
			if(transition.getCondition() instanceof SensorCondition){
				SensorCondition sensorCondition = (SensorCondition) transition.getCondition();
				w(String.format("\t\t\t\t %sLastDebounceTime = millis();\n", sensorCondition.getSensor().getName()));
			}
			else if(transition.getCondition() instanceof CompositeBinaryExpression){
				CompositeBinaryExpression compositeBinaryExpression = (CompositeBinaryExpression) transition.getCondition();
				if(compositeBinaryExpression.getLeft() instanceof SensorCondition){
					SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getLeft();
					w(String.format("\t\t\t\t %sLastDebounceTime = millis();\n", sensorCondition.getSensor().getName()));
				}
				if(compositeBinaryExpression.getRight() instanceof SensorCondition){
					SensorCondition sensorCondition = (SensorCondition) compositeBinaryExpression.getRight();
					w(String.format("\t\t\t\t %sLastDebounceTime = millis();\n", sensorCondition.getSensor().getName()));
				}
			}
			w("\t\t\t\tcurrentState = " + transition.getNext().getName() + ";\n");
			w("\t\t\t}\n");
			return;
		}
	}

	@Override
	public void visit(CompositeBinaryExpression compositeBinaryExpression) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			compositeBinaryExpression.getLeft().accept(this);
			String binaryOperator = compositeBinaryExpression.getOperator() == BinaryOperator.AND ? "&&" : "||";
			w(" " + binaryOperator + " ");
			compositeBinaryExpression.getRight().accept(this);
			return;
		}
	}


	@Override
	public void visit(SensorCondition sensorCondition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("digitalRead(%d) == %s", sensorCondition.getSensor().getPin(), sensorCondition.getSignal()));
			return;
		}
	}

	@Override
	public void visit(TemporalCondition temporalCondition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("millis() - startTime > " + temporalCondition.getDelay());
			return;
		}
	}

	@Override
	public void visit(SignalTransition transition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			String sensorName = transition.getSensor().getName();
			w(String.format("\t\t\t%sBounceGuard = millis() - %sLastDebounceTime > debounce;\n",
					sensorName, sensorName));
			w(String.format("\t\t\tif( digitalRead(%d) == %s && %sBounceGuard) {\n",
					transition.getSensor().getPin(), transition.getValue(), sensorName));
			w(String.format("\t\t\t\t%sLastDebounceTime = millis();\n", sensorName));
			w("\t\t\t\tcurrentState = " + transition.getNext().getName() + ";\n");
			w("\t\t\t}\n");
			return;
		}
	}



	@Override
	public void visit(Action action) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("\t\t\tdigitalWrite(%d,%s);\n",action.getActuator().getPin(),action.getValue()));
			return;
		}
	}

}

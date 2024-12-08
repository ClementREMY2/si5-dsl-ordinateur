package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitable;
import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.*;

public class Transition implements Visitable {

	protected State next;

	private Expression condition;

	public State getNext() {
		return next;
	}

	public void setNext(State next) {
		this.next = next;
	}

	@Override
	public void accept(Visitor visitor) {
		visitor.visit(this);
	}

	public Expression getCondition() {
		return condition;
	}

	public void setCondition(Expression condition) {
		this.condition = condition;
	}
}

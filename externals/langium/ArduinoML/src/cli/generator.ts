import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import {
	Action,
	Actuator,
	App,
	Sensor,
	State,
	Transition,
	Expression,
	isSensorCondition,
	SensorCondition,
	isTemporalCondition,
	TemporalCondition,
	isCompositeBinaryExpression,
	CompositeUnaryExpression,
	isCompositeUnaryExpression,
	PrimaryExpression,
	NestedExpression,
	isNestedExpression,
} from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    compile(app,fileNode)
    
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}


function compile(app:App, fileNode:CompositeGeneratorNode){
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`

long debounce = 200;
enum STATE {`+app.states.map(s => s.name).join(', ')+`};

STATE currentState = `+app.initial.ref?.name+`;`
    ,NL);
	
    for(const brick of app.bricks){
        if ("inputPin" in brick){
            fileNode.append(`
bool `+brick.name+`BounceGuard = false;
long `+brick.name+`LastDebounceTime = 0;
            `,NL);
        }
    }

	// State entry time for temporal transitions
	fileNode.append(`
long stateEntryTime = 0;
	`, NL);

    fileNode.append(`
	void setup(){`);

    for(const brick of app.bricks){
        if ("inputPin" in brick){
       		compileSensor(brick,fileNode);
		}else{
            compileActuator(brick,fileNode);
        }
	}


    fileNode.append(`
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){`,NL)
			for(const state of app.states){
				compileState(state, fileNode)
            }
	fileNode.append(`
		}
	}
	`,NL);




    }

	function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
		pinMode(`+actuator.outputPin+`, OUTPUT); // `+actuator.name+` [Actuator]`)
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		pinMode(`+sensor.inputPin+`, INPUT); // `+sensor.name+` [Sensor]`)
	}

    function compileState(state: State, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
				case `+state.name+`:`)
		for(const action of state.actions){
			compileAction(action, fileNode)
		}
		if (state.transition !== null){
			compileTransition(state.transition, fileNode)
		}
		fileNode.append(`
				break;`)
    }
	

	function compileAction(action: Action, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
					digitalWrite(`+action.actuator.ref?.outputPin+`,`+action.value.value+`);`)
	}

	function compileTransition(transition: Transition, fileNode: CompositeGeneratorNode) {
		const sensors = getAllUniqueSensors(transition.condition);
		compileDebouneGuard(sensors, fileNode);

		fileNode.append(`
			if (`);
		compileExpression(transition.condition, fileNode);

		fileNode.append(`) {
				currentState = ${transition.next.ref?.name};
				stateEntryTime = millis();`);
		compileDebounceTime(sensors, fileNode);

		fileNode.append(`
			}`);
	}


	function compileExpression(expr: Expression, fileNode: CompositeGeneratorNode) {
		compilePrimaryExpression(expr.operand, fileNode);
		if (isCompositeBinaryExpression(expr)) {
			const isAnd = expr.operator.operator === 'and';
			fileNode.append(isAnd ? ' && ' : ' || ');
			compileExpression(expr.rightOperand, fileNode);
		}
	}

	function compilePrimaryExpression(expr: PrimaryExpression, fileNode: CompositeGeneratorNode) {
		if (isSensorCondition(expr)) {
			compileSensorCondition(expr, fileNode);
		} else if (isTemporalCondition(expr)) {
			compileTemporalCondition(expr, fileNode);
		} else if (isCompositeUnaryExpression(expr)) {
			compileCompositeUnaryExpression(expr, fileNode);
		} else if (isNestedExpression(expr)) {
			compileNestedExpression(expr, fileNode);
		}
	}

	function compileSensorCondition(condition: SensorCondition, fileNode: CompositeGeneratorNode) {
		fileNode.append(`(digitalRead(${condition.sensor.ref?.inputPin}) == ${condition.value.value} && ${condition.sensor.ref?.name}BounceGuard)`);
	}

	function compileNestedExpression(expr: NestedExpression, fileNode: CompositeGeneratorNode) {
		fileNode.append(`(`);
		compileExpression(expr.nested, fileNode);
		fileNode.append(`)`);
	}

	function getAllUniqueSensors(expr: Expression): Sensor[] {
		const sensors: Sensor[] = [];
		if (isSensorCondition(expr.operand)) {
			const sensorCondition = expr.operand as SensorCondition;
			if (sensorCondition.sensor.ref) sensors.push(sensorCondition.sensor.ref);
		}
		if (isCompositeBinaryExpression(expr)) {
			sensors.push(...getAllUniqueSensors(expr.rightOperand));
		}
		if (isNestedExpression(expr.operand)) {
			sensors.push(...getAllUniqueSensors((expr.operand as NestedExpression).nested));
		}
		// Set to remove duplicates
		return [...new Set(sensors)];
	}

	function compileDebouneGuard(sensors: Sensor[], fileNode: CompositeGeneratorNode) {
		for (const sensor of sensors) {
			fileNode.append(`
				${sensor.name}BounceGuard = millis() - ${sensor.name}LastDebounceTime > debounce;`);
		}
	}

	function compileDebounceTime(sensors: Sensor[], fileNode: CompositeGeneratorNode) {
		for (const sensor of sensors) {
			fileNode.append(`
				${sensor.name}LastDebounceTime = millis();`);
		}
	}

	function compileTemporalCondition(condition: TemporalCondition, fileNode: CompositeGeneratorNode) {
		fileNode.append(`(currentTime - stateEntryTime >= ${condition.time})`);
	}

	function compileCompositeUnaryExpression(expr: CompositeUnaryExpression, fileNode: CompositeGeneratorNode) {}

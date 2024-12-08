"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInoFile = void 0;
const fs_1 = __importDefault(require("fs"));
const langium_1 = require("langium");
const path_1 = __importDefault(require("path"));
const ast_1 = require("../language-server/generated/ast");
const cli_util_1 = require("./cli-util");
function generateInoFile(app, filePath, destination) {
    const data = (0, cli_util_1.extractDestinationAndName)(filePath, destination);
    const generatedFilePath = `${path_1.default.join(data.destination, data.name)}.ino`;
    const fileNode = new langium_1.CompositeGeneratorNode();
    compile(app, fileNode);
    if (!fs_1.default.existsSync(data.destination)) {
        fs_1.default.mkdirSync(data.destination, { recursive: true });
    }
    fs_1.default.writeFileSync(generatedFilePath, (0, langium_1.toString)(fileNode));
    return generatedFilePath;
}
exports.generateInoFile = generateInoFile;
function compile(app, fileNode) {
    var _a;
    fileNode.append(`
//Wiring code generated from an ArduinoML model
// Application name: ` + app.name + `

long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            fileNode.append(`
bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;
            `, langium_1.NL);
        }
    }
    // State entry time for temporal transitions
    fileNode.append(`
long stateEntryTime = 0;
	`, langium_1.NL);
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            compileSensor(brick, fileNode);
        }
        else {
            compileActuator(brick, fileNode);
        }
    }
    fileNode.append(`
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){`, langium_1.NL);
    for (const state of app.states) {
        compileState(state, fileNode);
    }
    fileNode.append(`
		}
	}
	`, langium_1.NL);
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`
		pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`
		pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`);
}
function compileState(state, fileNode) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode);
    }
    fileNode.append(`
				break;`);
}
function compileAction(action, fileNode) {
    var _a;
    fileNode.append(`
					digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
}
function compileTransition(transition, fileNode) {
    var _a;
    const sensors = getAllUniqueSensors(transition.condition);
    compileDebouneGuard(sensors, fileNode);
    fileNode.append(`
			if (`);
    compileExpression(transition.condition, fileNode);
    fileNode.append(`) {
				currentState = ${(_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name};
				stateEntryTime = millis();`);
    compileDebounceTime(sensors, fileNode);
    fileNode.append(`
			}`);
}
function compileExpression(expr, fileNode) {
    compilePrimaryExpression(expr.operand, fileNode);
    if ((0, ast_1.isCompositeBinaryExpression)(expr)) {
        const isAnd = expr.operator.operator === 'and';
        fileNode.append(isAnd ? ' && ' : ' || ');
        compileExpression(expr.rightOperand, fileNode);
    }
}
function compilePrimaryExpression(expr, fileNode) {
    if ((0, ast_1.isSensorCondition)(expr)) {
        compileSensorCondition(expr, fileNode);
    }
    else if ((0, ast_1.isTemporalCondition)(expr)) {
        compileTemporalCondition(expr, fileNode);
    }
    else if ((0, ast_1.isCompositeUnaryExpression)(expr)) {
        compileCompositeUnaryExpression(expr, fileNode);
    }
    else if ((0, ast_1.isNestedExpression)(expr)) {
        compileNestedExpression(expr, fileNode);
    }
}
function compileSensorCondition(condition, fileNode) {
    var _a, _b;
    fileNode.append(`(digitalRead(${(_a = condition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin}) == ${condition.value.value} && ${(_b = condition.sensor.ref) === null || _b === void 0 ? void 0 : _b.name}BounceGuard)`);
}
function compileNestedExpression(expr, fileNode) {
    fileNode.append(`(`);
    compileExpression(expr.nested, fileNode);
    fileNode.append(`)`);
}
function getAllUniqueSensors(expr) {
    const sensors = [];
    if ((0, ast_1.isSensorCondition)(expr.operand)) {
        const sensorCondition = expr.operand;
        if (sensorCondition.sensor.ref)
            sensors.push(sensorCondition.sensor.ref);
    }
    if ((0, ast_1.isCompositeBinaryExpression)(expr)) {
        sensors.push(...getAllUniqueSensors(expr.rightOperand));
    }
    if ((0, ast_1.isNestedExpression)(expr.operand)) {
        sensors.push(...getAllUniqueSensors(expr.operand.nested));
    }
    // Set to remove duplicates
    return [...new Set(sensors)];
}
function compileDebouneGuard(sensors, fileNode) {
    for (const sensor of sensors) {
        fileNode.append(`
				${sensor.name}BounceGuard = millis() - ${sensor.name}LastDebounceTime > debounce;`);
    }
}
function compileDebounceTime(sensors, fileNode) {
    for (const sensor of sensors) {
        fileNode.append(`
				${sensor.name}LastDebounceTime = millis();`);
    }
}
function compileTemporalCondition(condition, fileNode) {
    fileNode.append(`(currentTime - stateEntryTime >= ${condition.time})`);
}
function compileCompositeUnaryExpression(expr, fileNode) { }
//# sourceMappingURL=generator.js.map
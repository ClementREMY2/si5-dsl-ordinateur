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
// Application name: ` + app.name, langium_1.NL);
    // Only one screen is supported
    const screen = app.bricks.find(ast_1.isScreen);
    if (screen) {
        compileScreenDeclaration(screen, fileNode);
    }
    fileNode.append(`
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
    // Update screen variable
    fileNode.append(`
bool screenUpdated = false;
	`, langium_1.NL);
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if ((0, ast_1.isPinBrick)(brick)) {
            if ((0, ast_1.isSensor)(brick)) {
                compileSensor(brick, fileNode);
            }
            else if ((0, ast_1.isActuator)(brick)) {
                compileActuator(brick, fileNode);
            }
        }
        else if ((0, ast_1.isBusBrick)(brick)) {
            if ((0, ast_1.isScreen)(brick)) {
                compileScreen(brick, fileNode);
            }
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
function compileScreenDeclaration(screen, fileNode) {
    fileNode.append(`
#include <LiquidCrystal.h>
		`, langium_1.NL);
    switch (screen.bus.value) {
        case 'BUS1':
            fileNode.append(`
LiquidCrystal lcd(2, 3, 4, 5, 6, 7, 8);
				`, langium_1.NL);
            break;
        case 'BUS2':
            fileNode.append(`
LiquidCrystal lcd(10, 11, 12, 13, 14, 15, 16);
				`, langium_1.NL);
            break;
        case 'BUS3':
            fileNode.append(`
LiquidCrystal lcd(10, 11, 12, 13, 18, 19, 1);
				`, langium_1.NL);
            break;
    }
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`
		pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`
		pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`);
}
function compileScreen(screen, fileNode) {
    fileNode.append(`
		// Screen setup
		lcd.begin(16, 2);`);
}
function compileState(state, fileNode) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode);
    }
    if (state.transitions !== null) {
        state.transitions.forEach(transition => compileTransition(transition, fileNode));
    }
    fileNode.append(`
				break;`);
}
function compileAction(action, fileNode) {
    if ((0, ast_1.isActuatorAction)(action)) {
        compileActuatorAction(action, fileNode);
    }
    else if ((0, ast_1.isScreenAction)(action)) {
        compileScreenAction(action, fileNode);
    }
}
function compileActuatorAction(action, fileNode) {
    var _a;
    fileNode.append(`
					digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
}
function compileScreenAction(action, fileNode) {
    const generateString = (composableString) => {
        var _a, _b;
        // create string declaration
        let res = "\"" + composableString.string + "\"";
        if (composableString.sensor) {
            res += ` + String(digitalRead(` + ((_a = composableString.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin) + `) == HIGH ? "ON" : "OFF")`;
        }
        if (composableString.actuator) {
            res += ` + String(digitalRead(` + ((_b = composableString.actuator.ref) === null || _b === void 0 ? void 0 : _b.outputPin) + `) == HIGH ? "ON" : "OFF")`;
        }
        if (composableString.next) {
            res += ' + ' + generateString(composableString.next);
        }
        return res;
    };
    fileNode.append(`
					if (!screenUpdated) {
						lcd.clear();
						String msg = ${generateString(action.value)};
						String firstLine = msg.substring(0, 16);
						String secondLine = msg.substring(16, 32);
						lcd.setCursor(0, 0);
						lcd.print(firstLine);
						lcd.setCursor(0, 1);
						lcd.print(secondLine);
						screenUpdated = true;
					}`);
}
function compileTransition(transition, fileNode) {
    var _a;
    const sensors = getAllUniqueSensors(transition.condition);
    compileDebouneGuard(sensors, fileNode);
    if (sensors.length > 0) {
        fileNode.append(`
					if (${sensors.map(sensor => `${sensor.name}BounceGuard`).join(' && ')}) {`);
    }
    fileNode.append(`
						if (`);
    compileExpression(transition.condition, fileNode);
    fileNode.append(`) {
							currentState = ${(_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name};
							screenUpdated = false;
							stateEntryTime = millis();`);
    compileDebounceTime(sensors, fileNode);
    fileNode.append(`
						}`);
    if (sensors.length > 0) {
        fileNode.append(`
					}`);
    }
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
    var _a;
    fileNode.append(`digitalRead(${(_a = condition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin}) == ${condition.value.value}`);
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
    if ((0, ast_1.isCompositeUnaryExpression)(expr.operand) && (0, ast_1.isSensorCondition)(expr.operand.inner)) {
        const sensorCondition = expr.operand.inner;
        if (sensorCondition.sensor.ref)
            sensors.push(sensorCondition.sensor.ref);
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
function compileCompositeUnaryExpression(expr, fileNode) {
    const isNegation = expr.operator.operator === 'not';
    const operator = isNegation ? '!' : '';
    fileNode.append(`${operator}(`);
    compilePrimaryExpression(expr.inner, fileNode);
    fileNode.append(`)`);
}
//# sourceMappingURL=generator.js.map
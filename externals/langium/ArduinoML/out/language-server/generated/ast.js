"use strict";
/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflection = exports.ArduinoMlAstReflection = exports.isCompositeBinaryExpression = exports.CompositeBinaryExpression = exports.isUnaryOperator = exports.UnaryOperator = exports.isTransition = exports.Transition = exports.isTemporalCondition = exports.TemporalCondition = exports.isState = exports.State = exports.isSignal = exports.Signal = exports.isSensorCondition = exports.SensorCondition = exports.isSensor = exports.Sensor = exports.isScreenAction = exports.ScreenAction = exports.isScreen = exports.Screen = exports.isNestedExpression = exports.NestedExpression = exports.isExpression = exports.Expression = exports.isCompositeUnaryExpression = exports.CompositeUnaryExpression = exports.isComposableString = exports.ComposableString = exports.isBus = exports.Bus = exports.isBinaryOperator = exports.BinaryOperator = exports.isApp = exports.App = exports.isActuatorAction = exports.ActuatorAction = exports.isActuator = exports.Actuator = exports.isPrimaryExpression = exports.PrimaryExpression = exports.isPinBrick = exports.PinBrick = exports.isBusBrick = exports.BusBrick = exports.isBrick = exports.Brick = exports.isAction = exports.Action = void 0;
/* eslint-disable */
const langium_1 = require("langium");
exports.Action = 'Action';
function isAction(item) {
    return exports.reflection.isInstance(item, exports.Action);
}
exports.isAction = isAction;
exports.Brick = 'Brick';
function isBrick(item) {
    return exports.reflection.isInstance(item, exports.Brick);
}
exports.isBrick = isBrick;
exports.BusBrick = 'BusBrick';
function isBusBrick(item) {
    return exports.reflection.isInstance(item, exports.BusBrick);
}
exports.isBusBrick = isBusBrick;
exports.PinBrick = 'PinBrick';
function isPinBrick(item) {
    return exports.reflection.isInstance(item, exports.PinBrick);
}
exports.isPinBrick = isPinBrick;
exports.PrimaryExpression = 'PrimaryExpression';
function isPrimaryExpression(item) {
    return exports.reflection.isInstance(item, exports.PrimaryExpression);
}
exports.isPrimaryExpression = isPrimaryExpression;
exports.Actuator = 'Actuator';
function isActuator(item) {
    return exports.reflection.isInstance(item, exports.Actuator);
}
exports.isActuator = isActuator;
exports.ActuatorAction = 'ActuatorAction';
function isActuatorAction(item) {
    return exports.reflection.isInstance(item, exports.ActuatorAction);
}
exports.isActuatorAction = isActuatorAction;
exports.App = 'App';
function isApp(item) {
    return exports.reflection.isInstance(item, exports.App);
}
exports.isApp = isApp;
exports.BinaryOperator = 'BinaryOperator';
function isBinaryOperator(item) {
    return exports.reflection.isInstance(item, exports.BinaryOperator);
}
exports.isBinaryOperator = isBinaryOperator;
exports.Bus = 'Bus';
function isBus(item) {
    return exports.reflection.isInstance(item, exports.Bus);
}
exports.isBus = isBus;
exports.ComposableString = 'ComposableString';
function isComposableString(item) {
    return exports.reflection.isInstance(item, exports.ComposableString);
}
exports.isComposableString = isComposableString;
exports.CompositeUnaryExpression = 'CompositeUnaryExpression';
function isCompositeUnaryExpression(item) {
    return exports.reflection.isInstance(item, exports.CompositeUnaryExpression);
}
exports.isCompositeUnaryExpression = isCompositeUnaryExpression;
exports.Expression = 'Expression';
function isExpression(item) {
    return exports.reflection.isInstance(item, exports.Expression);
}
exports.isExpression = isExpression;
exports.NestedExpression = 'NestedExpression';
function isNestedExpression(item) {
    return exports.reflection.isInstance(item, exports.NestedExpression);
}
exports.isNestedExpression = isNestedExpression;
exports.Screen = 'Screen';
function isScreen(item) {
    return exports.reflection.isInstance(item, exports.Screen);
}
exports.isScreen = isScreen;
exports.ScreenAction = 'ScreenAction';
function isScreenAction(item) {
    return exports.reflection.isInstance(item, exports.ScreenAction);
}
exports.isScreenAction = isScreenAction;
exports.Sensor = 'Sensor';
function isSensor(item) {
    return exports.reflection.isInstance(item, exports.Sensor);
}
exports.isSensor = isSensor;
exports.SensorCondition = 'SensorCondition';
function isSensorCondition(item) {
    return exports.reflection.isInstance(item, exports.SensorCondition);
}
exports.isSensorCondition = isSensorCondition;
exports.Signal = 'Signal';
function isSignal(item) {
    return exports.reflection.isInstance(item, exports.Signal);
}
exports.isSignal = isSignal;
exports.State = 'State';
function isState(item) {
    return exports.reflection.isInstance(item, exports.State);
}
exports.isState = isState;
exports.TemporalCondition = 'TemporalCondition';
function isTemporalCondition(item) {
    return exports.reflection.isInstance(item, exports.TemporalCondition);
}
exports.isTemporalCondition = isTemporalCondition;
exports.Transition = 'Transition';
function isTransition(item) {
    return exports.reflection.isInstance(item, exports.Transition);
}
exports.isTransition = isTransition;
exports.UnaryOperator = 'UnaryOperator';
function isUnaryOperator(item) {
    return exports.reflection.isInstance(item, exports.UnaryOperator);
}
exports.isUnaryOperator = isUnaryOperator;
exports.CompositeBinaryExpression = 'CompositeBinaryExpression';
function isCompositeBinaryExpression(item) {
    return exports.reflection.isInstance(item, exports.CompositeBinaryExpression);
}
exports.isCompositeBinaryExpression = isCompositeBinaryExpression;
class ArduinoMlAstReflection extends langium_1.AbstractAstReflection {
    getAllTypes() {
        return ['Action', 'Actuator', 'ActuatorAction', 'App', 'BinaryOperator', 'Brick', 'Bus', 'BusBrick', 'ComposableString', 'CompositeBinaryExpression', 'CompositeUnaryExpression', 'Expression', 'NestedExpression', 'PinBrick', 'PrimaryExpression', 'Screen', 'ScreenAction', 'Sensor', 'SensorCondition', 'Signal', 'State', 'TemporalCondition', 'Transition', 'UnaryOperator'];
    }
    computeIsSubtype(subtype, supertype) {
        switch (subtype) {
            case exports.Actuator:
            case exports.Sensor: {
                return this.isSubtype(exports.PinBrick, supertype);
            }
            case exports.ActuatorAction:
            case exports.ScreenAction: {
                return this.isSubtype(exports.Action, supertype);
            }
            case exports.CompositeUnaryExpression:
            case exports.NestedExpression:
            case exports.SensorCondition:
            case exports.TemporalCondition: {
                return this.isSubtype(exports.PrimaryExpression, supertype);
            }
            case exports.Screen: {
                return this.isSubtype(exports.BusBrick, supertype);
            }
            case exports.CompositeBinaryExpression: {
                return this.isSubtype(exports.Expression, supertype);
            }
            case exports.BusBrick:
            case exports.PinBrick: {
                return this.isSubtype(exports.Brick, supertype);
            }
            default: {
                return false;
            }
        }
    }
    getReferenceType(refInfo) {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'ActuatorAction:actuator':
            case 'ComposableString:actuator': {
                return exports.Actuator;
            }
            case 'App:initial':
            case 'Transition:next': {
                return exports.State;
            }
            case 'ComposableString:sensor':
            case 'SensorCondition:sensor': {
                return exports.Sensor;
            }
            case 'ScreenAction:screen': {
                return exports.Screen;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }
    getTypeMetaData(type) {
        switch (type) {
            case 'App': {
                return {
                    name: 'App',
                    mandatory: [
                        { name: 'bricks', type: 'array' },
                        { name: 'states', type: 'array' }
                    ]
                };
            }
            case 'State': {
                return {
                    name: 'State',
                    mandatory: [
                        { name: 'actions', type: 'array' },
                        { name: 'transitions', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}
exports.ArduinoMlAstReflection = ArduinoMlAstReflection;
exports.reflection = new ArduinoMlAstReflection();
//# sourceMappingURL=ast.js.map
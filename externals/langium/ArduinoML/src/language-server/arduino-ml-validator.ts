import { ValidationAcceptor, ValidationChecks } from 'langium';
import {
    ArduinoMlAstType,
    App,
    Expression,
    isTemporalCondition,
    isCompositeBinaryExpression,
    CompositeUnaryExpression,
    NestedExpression,
    isCompositeUnaryExpression,
    isNestedExpression,
} from './generated/ast';
import type { ArduinoMlServices } from './arduino-ml-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlValidator;
    const checks: ValidationChecks<ArduinoMlAstType> = {
        // Check if app name starts with a capital letter
        App: validator.checkNothing,
        // Prevent use of multiple "wait" at the same level of a binary expression
        Expression: validator.checkTemporalTransitionCombination,
        // Prevent negation of temporal transition
        // Check for double negation
        CompositeUnaryExpression: validator.checkCompositeUnaryExpression,
        // Make sure at least two operands are present in a nested expression
        NestedExpression: validator.checkNestedOperandsLength,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlValidator {

    checkNothing(app: App, accept: ValidationAcceptor): void {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }

    checkTemporalTransitionCombination(expression: Expression, accept: ValidationAcceptor): void {
        // Count number of temporal transition
        const countTemporalTransition = (expression: Expression): number => {
            let temporalTransitionCount = 0;
            if (isTemporalCondition(expression.operand)) {
                temporalTransitionCount += 1;
            }
            if (isCompositeBinaryExpression(expression)) {
                temporalTransitionCount += countTemporalTransition(expression.rightOperand);
            }
            return temporalTransitionCount;
        };
        
        const count = countTemporalTransition(expression);
        if (count > 1) {
            accept('error', 'Only one temporal transition is allowed.', { node: expression, property: 'operand' });
        }
    }

    checkCompositeUnaryExpression(expr: CompositeUnaryExpression, accept: ValidationAcceptor): void {
        // Prevent negation of temporal transition
        this.checkNegationTemporalTransition(expr, accept);
        // Check for double negation
        this.checkDoubleNegation(expr, accept);
    }

    checkNegationTemporalTransition(expr: CompositeUnaryExpression, accept: ValidationAcceptor): void {
        const containTemporalTransitions = (expression: Expression): boolean => {
            if (isTemporalCondition(expression.operand)) {
                return true;
            }
            if (isNestedExpression(expression.operand)) {
                const res = containTemporalTransitions(expression.operand.nested);
                if (res) return true;
            }
            if (isCompositeBinaryExpression(expression)) {
                const res = containTemporalTransitions(expression.rightOperand);
                if (res) return true;
            }
            return false;
        }

        const isNegation = expr.operator.operator === 'not';
        if (isNegation) {
            const isInnerTemporal = isTemporalCondition(expr.inner);
            const isNestedContainingTemporals = isNestedExpression(expr.inner) && containTemporalTransitions((expr.inner.nested));

            if (isInnerTemporal || isNestedContainingTemporals) {
                accept('error', 'Negation cannot be applied to temporal transition.', { node: expr, property: 'operator' });
            }
        }
    }

    checkNestedOperandsLength(expr: NestedExpression, accept: ValidationAcceptor): void {
        const countOperands = (expression: Expression): number => {
            let operandCount = 1;
            if (isCompositeBinaryExpression(expression)) {
                operandCount += countOperands(expression.rightOperand);
            }
            return operandCount;
        }

        const count = countOperands(expr.nested);
        if (count <= 1) {
            accept('error', 'Nested expression should have at least two operand.', { node: expr, property: 'nested' });
        }
    }

    checkDoubleNegation(expr: CompositeUnaryExpression, accept: ValidationAcceptor): void {
        const isNegation = expr.operator.operator === 'not';
        const isInnerNegation = isCompositeUnaryExpression(expr.inner) && (expr.inner as CompositeUnaryExpression).operator.operator === 'not';

        if (isNegation && isInnerNegation) {
            accept('error', 'Double negation is not allowed.', { node: expr, property: 'operator' });
        }
    }
}

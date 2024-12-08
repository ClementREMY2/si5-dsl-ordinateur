grammar ArduinoMl

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)* 		
	'}';

Brick :
	(Actuator | Sensor);

Actuator:
	{infer Actuator}
	'Actuator' name=ID ':' outputPin=INT;

Sensor :
	{infer Sensor}
	'Sensor'  name=ID ':' inputPin=INT;
	
State :
	name=ID '{'
		(actions+=Action)* 
		transition=Transition
	'}';


Action :
	actuator=[Actuator:ID] '<=' value=Signal;

Transition :
	condition=Expression '=>' next=[State:ID];

Expression:
    operand=PrimaryExpression CompositeBinaryExpression?;

CompositeBinaryExpression:
	operator=BinaryOperator rightOperand=Expression;

PrimaryExpression:
    SensorCondition 
    | TemporalCondition
    | CompositeUnaryExpression
    | NestedExpression;

NestedExpression:
	'(' nested=Expression ')';

BinaryOperator:
	operator=('and' | 'or');

SensorCondition:
    sensor=[Sensor:ID] 'is' value=Signal;

TemporalCondition:
	'wait' time=INT 'ms';

CompositeUnaryExpression:
    operator=UnaryOperator inner=PrimaryExpression;

UnaryOperator:
	operator='not';

Signal:
    value=(HIGH | LOW);
terminal HIGH : 'HIGH';
terminal LOW : 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

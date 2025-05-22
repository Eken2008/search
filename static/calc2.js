const fs = require('fs');


const getParanthesisEnd = (tokens, startIdx) => {
    if (tokens[startIdx]!=="("){
        throw Error("Expected '(' at the start of the expression.");
    }
    let depth = 0;
    for (let i = 0; i < tokens.length+1; i++){
        if (tokens[startIdx+i]==="("){
            depth++;
        }
        else if (tokens[startIdx+i]===")"){
            depth--;
        }
        if (depth === 0){
            return startIdx+i+1
        }
    }
    throw new SyntaxError("No closing parenthesis found")
}

const isNumber = (input) => {
    return parseFloat(input)==input;
}
const isVariable = (input) => {
    if (isNumber(input)||"+-*^/=%".includes(input)) {
        return false;
    }
    return true;
}
const isFunction = (input) => {
    return Object.keys(FUNCTIONS).includes(input);
}

const parseTokens = (tokens) => {
    const tree = [];
    for (let i = 0; i < tokens.length; i++){
        const token = tokens[i];
        if (token === "("){
            const pEnd = getParanthesisEnd(tokens,i)
            tree.push(parseTokens(tokens.slice(i+1,pEnd-1)))
            i = pEnd-1
        }
        else {
            tree.push(token)
        }
    }
    return tree
}

const ast = (tokens) => {
    let tree = {}
    for (let i = 0; i < tokens.length; i++){
        const token = tokens[i];
        if (Array.isArray(token)){
            tokens[i]=ast(token);
        }
        else if (isFunction(token)){
            let args;
            if (tokens[i]==="log"){
                args = [tokens[i+1][0],ast(tokens[i+1][2])]
            }
            else{
                args = ast(tokens[i+1])
            }
            return {
                "function":tokens[i],
                "args":args
            }
        }
        else if (!isNumber(token)&&!isVariable(token)) {
            number1 = tokens[i-1];
            number2 = tokens[i+1];
            if (Array.isArray(number2)){
                number2 = ast(number2)
            }
            tree={
                "number1":tokens[i-1],
                "operator":token,
                "number2":number2
            }
        }
    }
    if (tokens.length === 1) {
        tree=tokens[0]
    }
    return tree;
}

const getPriority = (operator) => {
    const priorities = {
        "+": 0,
        "-": 0,
        "*": 1,
        "/": 1,
        "%": 1,
        "^": 2,
    }
    if (!Object.keys(priorities).includes(operator)) return null;
    return priorities[operator];
}


const fixParanthesis = (tokens) => {
    const _fixParanthesis = (tokens) => {
        const tree = tokens;    

        for (let i = 0; i < tree.length; i++){
            const token = tree[i];
            if (((isVariable(token)||isNumber(token))&&(isVariable(tree[i+1])||isNumber(tree[i+1]))&&tree[i+1]!=undefined)&&!isFunction(token)){
                tree.splice(i+1,0,"*")
                i++;
            }
        }
    
        // Insert paranthesis around functions
        for (let i = 0; i < tree.length; i++){
            const token = tree[i];
            if (isFunction(token)) {
                // Multi arg functions
                if (!Array.isArray(tree[i+1])&&tree.length!==4){
                    tree[i]=[tree[i],tree[i+1],tree[i+2],tree[i+3]]
                    tree.splice(i+1,3)
                }
                else if (tree.length!==2){
                    tree[i]=[tree[i],tree[i+1]]
                    tree.splice(i+1,1)
                }
            }
        }
    
        
        for (let level = 2; level >= 0; level--){
            for (let i = 0; i < tree.length; i++){
                if (Array.isArray(tree[i])){
                    if (tree[i].length>3){
                        tree[i] = _fixParanthesis(tree[i]);
                    }
                }
                else if (getPriority(tree[i])===level){
                    tree[i-1]=[tokens[i-1],tokens[i],tokens[i+1]]
                    tree.splice(i,2)
                }
            }
        }
        return tree;
    }

    let prev = null;
    let current = tokens;
    while (JSON.stringify(prev) !== JSON.stringify(current)) {
        prev = JSON.parse(JSON.stringify(current));
        current = _fixParanthesis(current);
    }
    return current;
}


const treeToString = (tree) => {
    if (Array.isArray(tree)) {
        return `(${tree.map(treeToString).join(' ')})`;
    }
    return tree.toString();
};

class MathError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
    }
}
MathError.prototype.name = 'MathError'

const calcAst = (node) => {
    let num1 = node.number1;
    const operator = node.operator;
    let num2 = node.number2;

    if (typeof node === "string") { return parseFloat(node); }

    if (Object.keys(node).includes("function")){
        if (Array.isArray(node.args)){
            const parsedArgs = [];
            for (const arg of node.args){
                parsedArgs.push(calcAst(arg))
            }
            return FUNCTIONS[node.function](...parsedArgs)
        }
        return FUNCTIONS[node.function](calcAst(node.args))
    }

    if (typeof num1 === "object"){ num1 = calcAst(num1); }
    if (!isNumber(num1)){ num1 = VARIABLES[num1.toLowerCase()]; }
    //TODO: throw error if variable not found
    num1 = parseFloat(num1);
    if (typeof num2 === "object"){ num2 = calcAst(num2); }
    if (!isNumber(num2)){ num2 = VARIABLES[num2.toLowerCase()]; }
    num2 = parseFloat(num2);

    switch (operator) {
        case "+":
            return num1 + num2;
        case "-":
            return num1 - num2;
        case "*":
            return num1 * num2;
        case "%":
            return num1 % num2;
        case "/":
            if (num2 === 0){
                throw new MathError("Oops! Dividing by zero creates a black hole in my logic. Let's not do that!")
            }
            return num1 / num2;
        case "^":
            return num1 ** num2;
    
        default:
            break;
    }
}

const calc = (input) => {
    try{
        input = input.replaceAll(" ","")
        let variable = null;
        let expression = input;
        if (input.includes("=")){
            [variable, expression] = input.split("=");
        }
        const output = calcAst(ast(fixParanthesis(parseTokens(stringToTokens(expression)))));
        if (isNaN(output)){
            throw new MathError("My calculations say that this isn't a number, try it yourself.")
        }
        if (output === Infinity){
            throw new MathError("I can't count that high, try it yourself.")
        }
        if (variable){
            const variables = localStorage.getItem("variables");
            variables[variable] = output;
            localStorage.setItem("variables",variables);
            return `${variable} = ${output}`;
        }
        return output;
    }
    catch (e){
        if (e instanceof SyntaxError || e instanceof MathError){
            return e.toString();
        }
        else {
            throw e;
        }
    }
}

const stringToTokens = (input) => {
    const regex = /([0-9.]+)|([^0-9A-z])|[A-z]+/g;
    return input.match(regex);
}


const VARIABLES = {
    "pi": Math.PI
}


function logBase(number,base) {
    return Math.log(base) / Math.log(number);
}
const FUNCTIONS = {
    "sqrt": Math.sqrt,
    "ln": Math.log,
    "log": logBase,
    "cos": Math.cos,
    "sin": Math.sin,
    "tan": Math.tan,
    "atan": Math.atan,
    "acos": Math.acos,
    "asin": Math.asin
}

Object.keys(VARIABLES).forEach(key => {
    global[key.toLowerCase()] = VARIABLES[key];
});


const MODE = "calc";
const CALC_EXPECTED = false;

const input = "5+5+5+5+5+5+5+5+5+5"


if (MODE === "paranthesis"){
    const output = fixParanthesis(fixParanthesis(parseTokens(stringToTokens(input))))
    console.log(output)

    if (CALC_EXPECTED){
        console.log(`Output: ${eval(treeToString(output).replaceAll("^","**"))}, expected: ${eval(input.replaceAll("^","**"))}`)
    }

    fs.writeFileSync('output.json', JSON.stringify(output, null, 2));
}
if (MODE === "ast"){
    const output = ast(fixParanthesis(parseTokens(stringToTokens(input))))
    console.log(treeToString(output))

    fs.writeFileSync('output.json', JSON.stringify(output, null, 2));
}
if (MODE === "calc"){
    const output = calcAst(ast(fixParanthesis(parseTokens(stringToTokens(input)))))
    
    console.log(`Output: ${output}`)
    if (CALC_EXPECTED) {
        try{
            const expectedOutput = eval(input.replaceAll("^","**"));
            console.log(`Expected: ${expectedOutput}`)
            console.log(`Equal: ${output===expectedOutput}`)
        }
        catch (e){
            if (e instanceof SyntaxError){
                console.error("SyntaxError: Verify expected does not support variables without operators.")
            }
            else {
                throw e
            }
        }
    }
}
if (MODE === "calc2"){
    console.log(calc(input))
}
//console.log(stringToTokens("5pi*2"))
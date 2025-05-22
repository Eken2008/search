// Variables
let variables = {
    "pi": Math.PI,
    "e": Math.E
};
if (localStorage.getItem("variables")===null){
    localStorage.setItem("variables",JSON.stringify(variables));
}
const loadVariables = () => {
    variables = JSON.parse(localStorage.getItem("variables"));
}
loadVariables();


// Functions
function logBase(number,base) {
    return Math.log(number) / Math.log(base);
}
const FUNCTIONS = {
    "sqrt": Math.sqrt,
    "ln": Math.log,
    "log*": logBase,
    "log": (x)=>logBase(x,10),
    "cos": Math.cos,
    "sin": Math.sin,
    "tan": Math.tan,
    "atan": Math.atan,
    "acos": Math.acos,
    "asin": Math.asin
}

const OPERATORS = Array.from("+-*/^%")







class MathError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
    }
}
MathError.prototype.name = 'MathError'


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
            return startIdx+i+1;
        }
    }
    throw new SyntaxError("No closing parenthesis found");
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

const isFunction = (input) => {
    return Object.keys(FUNCTIONS).includes(input);
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

const stringToTokens = (input) => {
    const regex = /([0-9.]+)|([^0-9A-z])|[A-z]+/g;
    return input.match(regex);
}

const parseTokens = (tokens) => {
    const tree = [];
    for (let i = 0; i < tokens.length; i++){
        const token = tokens[i];
        if (token === "("){
            const pEnd = getParanthesisEnd(tokens,i);
            tree.push(parseTokens(tokens.slice(i+1, pEnd-1))) // Push content of paranthesis to tree
            i = pEnd-1; // Move to end of paranthesis
        }
        else {
            tree.push(token);
        }
    }
    return tree;
}

const fixParanthesis = (tokens) => {
    const _fixParanthesis = (tokens) => {
        const tree = tokens;

        // Insert "*" between variables and numbers
        for (let i = 0; i < tree.length; i++) {
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
                if (!Array.isArray(tree[i+1])){
                    if (tree.length!==4){
                        tree[i]=[tree[i],tree[i+1],tree[i+2],tree[i+3]];
                        tree.splice(i+1,3);
                    }
                }
                // Single arg functions
                else if (tree.length!==2){
                    tree[i]=[tree[i],tree[i+1]];
                    tree.splice(i+1,1);
                }
            }
        }


        for (let level = 2; level >= 0; level--){
            for (let i = 0; i < tree.length; i++){
                if (Array.isArray(tree[i])){
                    // Go deeper in tree when a paranthesis is found
                    if (tree[i].length>3){
                        tree[i] = _fixParanthesis(tree[i]);
                    }
                }
                else if (getPriority(tree[i]) === level) {
                    // Insert paranthesis
                    tree[i-1]=[tokens[i-1],tokens[i],tokens[i+1]];
                    tree.splice(i,2);
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

const ast = (tokens) => {
        for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (Array.isArray(token)){
            tokens[i] = ast(token);
        }
        else if (isFunction(token)){
            let args;
            if (Object.keys(FUNCTIONS).includes(tokens[i]+"*")
                &&Array.isArray(tokens[i+1][2])
                &&tokens[i+1][1]==="*"
                &&isNumber(tokens[i+1][0])){ // Multi arg functions
                args = [tokens[i+1][0],ast(tokens[i+1][2])];
            }
            else {
                args = ast(tokens[i+1]);
            }
            return {"function": token, "args": args};
        }
        else if (!isNumber(token) && !isVariable(token)) {
            // Operators
            let number2 = tokens[i+1];
            if (Array.isArray(number2)) {
                number2 = ast(number2);
            }
            return {
                "number1": tokens[i-1],
                "operator": token,
                "number2": number2
            };
        }
    }
    
    if (tokens.length === 1) {
        return tokens[0];
    }
}

const parseAst = (node) => {
    if (typeof node === "string") { return parseFloat(node); } // Number nodes

    // Functions
    if (Object.keys(node).includes("function")){
        // Multi arg functions (for example log)
        if (Array.isArray(node.args)){
            const parsedArgs = [];
            for (const arg of node.args){
                parsedArgs.push(parseAst(arg)); // Calculate arg
            }
            return FUNCTIONS[node.function+"*"](...parsedArgs);
        }
        // Single arg functions
        return FUNCTIONS[node.function](parseAst(node.args));
    }

    // Operators
    let number1 = node.number1;
    const operator = node.operator;
    let number2 = node.number2;

    // Expressions
    if (typeof number1 === "object") { number1 = parseAst(number1); }
    if (typeof number2 === "object") { number2 = parseAst(number2); }

    // Variables
    if (isVariable(number1)) {
        if (!Object.keys(variables).includes(number1.toLowerCase())){
            throw new MathError(`Oops! Looks like "${number1}" is a mystery to me. Did you forget to define it?`)
        }
        number1 = variables[number1.toLowerCase()];
    }
    if (isVariable(number2)) {
        if (!Object.keys(variables).includes(number2.toLowerCase())){
            throw new MathError(`Oops! Looks like "${number2}" is a mystery to me. Did you forget to define it?`)
        }
        number2 = variables[number2.toLowerCase()];
    }

    // Convert values to numbers
    number1 = parseFloat(number1);
    number2 = parseFloat(number2);

    // Calculate
    switch (operator) {
        case "+":
            return number1 + number2;
        case "-":
            return number1 - number2;
        case "*":
            return number1 * number2;
        case "%":
            return number1 % number2;
        case "/":
            if (number2 === 0){
                throw new MathError("Oops! Dividing by zero creates a black hole in my logic. Let's not do that!")
            }
            return number1 / number2;
        case "^":
            return number1 ** number2;
    
        default:
            break;
    }
}

const calc = (expression) => {
    try {
        expression = expression.replaceAll(" ","");
        let variable = null;
        
        if (expression.includes("=")){
            [variable, expression] = expression.split("=");
        }

        const result = parseAst(ast(fixParanthesis(parseTokens(stringToTokens(expression)))));

        if (isNaN(result)) {
            throw new MathError("My calculations say that this isn't a number, try it yourself.");
        }
        else if (result === Infinity) {
            throw new MathError("I can't count that high, try it yourself.");
        }
        
        // Set variable if it was an assignment
        if (variable){
            loadVariables();
            variables[variable] = result;
            localStorage.setItem("variables",JSON.stringify(variables));
            return `${variable} = ${result}`;
        }
        return result;
    }
    catch (e){
        if (e instanceof SyntaxError || e instanceof MathError) {
            return e.toString();
        }
        throw e;
    }
}

window.onload = () => {
    if (window.location.search.includes("?q=")){
        const query = decodeURIComponent(window.location.search.replace("?q=", ""));
        document.querySelector(".expression").value=query;
    }

    document.querySelector(".expression").addEventListener("input",(e)=>{
        document.querySelector(".answer").innerText=calc(e.target.value);
    })
    document.querySelector(".answer").innerText=calc(document.querySelector(".expression").value);
}
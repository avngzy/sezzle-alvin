https://github.com/joewalnes/reconnecting-websocket/
function ReconnectingWebSocket(a){function f(g){c=new WebSocket(a);if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","attempt-connect",a)}var h=c;var i=setTimeout(function(){if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","connection-timeout",a)}e=true;h.close();e=false},b.timeoutInterval);c.onopen=function(c){clearTimeout(i);if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","onopen",a)}b.readyState=WebSocket.OPEN;g=false;b.onopen(c)};c.onclose=function(h){clearTimeout(i);c=null;if(d){b.readyState=WebSocket.CLOSED;b.onclose(h)}else{b.readyState=WebSocket.CONNECTING;if(!g&&!e){if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","onclose",a)}b.onclose(h)}setTimeout(function(){f(true)},b.reconnectInterval)}};c.onmessage=function(c){if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","onmessage",a,c.data)}b.onmessage(c)};c.onerror=function(c){if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","onerror",a,c)}b.onerror(c)}}this.debug=false;this.reconnectInterval=1e3;this.timeoutInterval=2e3;var b=this;var c;var d=false;var e=false;this.url=a;this.readyState=WebSocket.CONNECTING;this.URL=a;this.onopen=function(a){};this.onclose=function(a){};this.onmessage=function(a){};this.onerror=function(a){};f(a);this.send=function(d){if(c){if(b.debug||ReconnectingWebSocket.debugAll){console.debug("ReconnectingWebSocket","send",a,d)}return c.send(d)}else{throw"INVALID_STATE_ERR : Pausing to reconnect websocket"}};this.close=function(){if(c){d=true;c.close()}};this.refresh=function(){if(c){c.close()}}}ReconnectingWebSocket.debugAll=false

if (window.location.protocol == "https:") {
    var ws_scheme = "wss://";
  } else {
    var ws_scheme = "ws://"
  };

var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/receive");
var outbox = new ReconnectingWebSocket(ws_scheme + location.host + "/submit");

// Used to track the number of calculations in the log
var count = 1;

inbox.onmessage = function(message) {
    const reader = new FileReader();
    var log = ""
    reader.onload = function(){
        console.log("Result: " + reader.result);
        log = reader.result
        $("#logs").prepend("<div class=individual-log>" + $('<span/>').text(log).html() + "</div> ");
        count++
    }
    reader.readAsText(message.data)
    // If 10 posts, delete oldest one
    if(count == 11){
        count--
        $('#logs').find('div').last().remove();
    }
};

inbox.onclose = function(){
    console.log('inbox closed');
    this.inbox = new WebSocket(inbox.url);
};

outbox.onclose = function(){
    console.log('outbox closed');
    this.outbox = new WebSocket(outbox.url);
};

var calculationLog = ""         // string representation of all calculations made by user
var lastAction = ""             // check previous operation
var previousAnswer = ""         // store previous answer

// basic function for calculating 2 values
function calculate(firstVal, secondVal, operation) {
    let result = ''

    if (operation === 'add'){
        result = parseFloat(firstVal) + parseFloat(secondVal)
        // calculationLog = calculationLog + '+'
    } else if (operation === 'subtract') {
        result = parseFloat(firstVal) - parseFloat(secondVal)
        
    } else if (operation === 'multiply') {
        result = parseFloat(firstVal) * parseFloat(secondVal)
        
    } else if (operation === 'divide') {
        result = parseFloat(firstVal) / parseFloat(secondVal)
        
    }
    previousAnswer = result
    return result
}


const buttons = document.querySelector('.button-container')
const display = document.querySelector('.entered-numbers')
buttons.querySelectorAll('.button-row').forEach(item => {
    item.addEventListener('click', event => {
        if(event.target.matches('button')) {
            const key = event.target
            const action = key.dataset.action
            const numberEntered = key.textContent
            const displayedNumber = display.textContent
            const previousOperation = buttons.dataset.previousOperation

            // If a number is pressed
            if (!action) {
                // If 0, or a new calculation
                if (displayedNumber === '0' ||  previousOperation === 'operator' || previousOperation === 'equals') {

                    if (displayedNumber === '0') {
                        display.textContent = numberEntered

                        // Logging part
                        calculationLog = calculationLog + numberEntered
                    } else {
                        // Append numbers
                        display.textContent = displayedNumber + numberEntered

                        // Logging part
                        calculationLog = calculationLog + displayedNumber + numberEntered
                    }
                    
                    
                    

                } else {    // If not 0
                    // Append numbers
                    display.textContent = displayedNumber + numberEntered

                    // Logging part
                    calculationLog = calculationLog + numberEntered

                }
                if(previousOperation === 'equals'){
                    // do nothing
                    // to prevent entering if condition on line 200... still needs to be improved..
                } else if (previousOperation === 'operator'){
                    buttons.dataset.previousOperation = 'number'
                }  
            }

            if (action === 'decimal') {

                // Append . to existing number
                if (!displayedNumber.includes('.')){
                    display.textContent = displayedNumber+'.'

                    // Logging part
                    calculationLog = calculationLog + '.'

                } 
                else if (previousOperation === 'operator' || previousOperation === 'equals') 
                {
                    displayedNumber = '0.'
                    display.textContent('0.')

                    // Logging part
                    calculationLog = calculationLog + '0.'
                }
                buttons.dataset.previousOperation = 'decimal'
            }

            if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide'){
                  
                const operator = buttons.dataset.operator
                const firstValue = buttons.dataset.firstValue
                const secondValue = displayedNumber

                if (previousOperation === 'equals'){
                    calculationLog  = displayedNumber
                }
                
                if (action === 'add') {
                    // Used to check for multiple consecutive +-*/ button presses
                    if ((calculationLog.charAt(calculationLog.length-1) === '-')
                        || (calculationLog.charAt(calculationLog.length-1) === '*') 
                        || (calculationLog.charAt(calculationLog.length-1) === '/')) 
                    {
                        var temp =  calculationLog.slice(0, calculationLog.length-1) + '+'  // Change the symbol to +
                        calculationLog = ""
                        calculationLog = temp
                    }
                    else if (calculationLog.charAt(calculationLog.length-1) !== '+')        // If does not contain any math symbols, add +
                    {
                        calculationLog = calculationLog + '+'
                    } 
                    lastAction = '+'    // used for appending to the string "calculationLog"
                }
                if (action === 'subtract') {
                    
                    if ((calculationLog.charAt(calculationLog.length-1) === '+')
                        || (calculationLog.charAt(calculationLog.length-1) === '*') 
                        || (calculationLog.charAt(calculationLog.length-1) === '/')) 
                    {
                        var temp =  calculationLog.slice(0, calculationLog.length-1) + '-'
                        calculationLog = ""
                        calculationLog = temp
                    }
                    else if (calculationLog.charAt(calculationLog.length-1) !== '-')
                    {
                        calculationLog = calculationLog + '-'
                    } 
                    lastAction = '-'
                }
                if (action === 'multiply') {
                    
                    if ((calculationLog.charAt(calculationLog.length-1) === '+')
                        || (calculationLog.charAt(calculationLog.length-1) === '-')
                        || (calculationLog.charAt(calculationLog.length-1) === '/')) 
                    {
                        var temp =  calculationLog.slice(0, calculationLog.length-1) + '*'
                        calculationLog = ""
                        calculationLog = temp
                    } 
                    else if (calculationLog.charAt(calculationLog.length-1) !== '*')
                    {
                        calculationLog = calculationLog + '*'
                    } 
                    lastAction = '*'
                }
                if (action === 'divide') {
                    
                    if ((calculationLog.charAt(calculationLog.length-1) === '+')
                        || (calculationLog.charAt(calculationLog.length-1) === '-')
                        || (calculationLog.charAt(calculationLog.length-1) === '*')) 
                    {
                        var temp =  calculationLog.slice(0, calculationLog.length-1) + '/'
                        calculationLog = ""
                        calculationLog = temp
                    }
                    else if (calculationLog.charAt(calculationLog.length-1) !== '/')
                    {
                        calculationLog = calculationLog + '/'
                    } 
                    lastAction = '/'
                }
                
                // Continuously adding/subtracting/../.. etc
                if (firstValue && operator && previousOperation !== 'operator' && previousOperation !== 'equals') {
                    const calculatedValue = calculate(firstValue, secondValue, operator)
                    display.textContent = calculatedValue
                    buttons.dataset.firstValue = calculatedValue
                } else {
                    // a + b = c (Simple maths)
                    buttons.dataset.firstValue = displayedNumber
                }
                buttons.dataset.previousOperation = 'operator'
                buttons.dataset.operator = action
            }

            if (action === 'negate'){
                if (displayedNumber !== 0){
                    display.textContent = displayedNumber * -1
                }
            }

            if (action === 'prev-answer'){
                display.textContent = previousAnswer
            }

            if (action === 'clear'){
                console.log('clear key!')
                display.textContent = 0
                buttons.dataset.previousOperation = 'clear'
                buttons.dataset.displayedNumber = ''
                buttons.dataset.firstValue = ''
                buttons.dataset.operator = ''
                buttons.dataset.modValue = ''
                calculationLog = ""
       
            }

            if (action === 'equals') {
                let firstValue = buttons.dataset.firstValue
                let secondValue = displayedNumber
                const operator = buttons.dataset.operator


                if (firstValue) {

                    if (previousOperation === 'equals') {

                        firstValue = displayedNumber
                        secondValue = buttons.dataset.modValue
                        calculationLog = displayedNumber + lastAction + secondValue
                    }

                    calculationLog = calculationLog + '=' + calculate(firstValue, secondValue, operator)

                    display.textContent = calculate(firstValue, secondValue, operator)
                   
                    outbox.send(calculationLog);
                    calculationLog = ""
                }

                buttons.dataset.modValue = secondValue
                buttons.dataset.previousOperation = 'equals'
            }

        }
    })
})



// $("#equalsbutton").click(function() {

//     var calLogs = calculationLog
//     console.log("clicking works!")
//     console.log(calculationLog)
//     console.log("json stringify")
//     console.log((JSON.stringify({calLogs: calLogs})))
//     outbox.send(JSON.stringify({calLogs: calLogs}))
//     // console.log((JSON.stringify({calculationLog: calculationLog})))
//     // outbox.send(JSON.stringify({calculationLog: calculationLog}))
// });





// const keys2 = buttons.querySelectorAll('.row-1')
// const keys3 = buttons.querySelectorAll('.row-3')
// const keys4 = buttons.querySelectorAll('.row-4')
// const keys5 = buttons.querySelectorAll('.row-5')


// seperate into function
// keys1.addEventListener('click', e => {
    
// })

// keys2.addEventListener('click', e => {
//     if(e.target.matches('button')) {
//         const key = e.target
//         const action = key.dataset.action
//         if (!action) {
//             console.log('number key!')
//         }
//         if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide'){
//             console.log('operator key!')
//         }
//         if (action === 'decimal'){
//             console.log('decimal key!')
//         }
//         if (action === 'clear'){
//             console.log('clear key!')
//         }
//         if (action === 'equals'){
//             console.log('equal key!')
//         }
//     }
// })

// keys1.addEventListener('click', e => {
//     if(e.target.matches('button')) {
//         const key = e.target
//         const action = key.dataset.action
//         if (!action) {
//             console.log('number key!')
//         }
//         if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide'){
//             console.log('operator key!')
//         }
//         if (action === 'decimal'){
//             console.log('decimal key!')
//         }
//         if (action === 'clear'){
//             console.log('clear key!')
//         }
//         if (action === 'equals'){
//             console.log('equal key!')
//         }
//     }
// })

// keys1.addEventListener('click', e => {
//     if(e.target.matches('button')) {
//         const key = e.target
//         const action = key.dataset.action
//         if (!action) {
//             console.log('number key!')
//         }
//         if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide'){
//             console.log('operator key!')
//         }
//         if (action === 'decimal'){
//             console.log('decimal key!')
//         }
//         if (action === 'clear'){
//             console.log('clear key!')
//         }
//         if (action === 'equals'){
//             console.log('equal key!')
//         }
//     }
// })

var enteredValue = 0;
var temp = 0;
var previousAnswer = 0;
var answer = 0;
var addSelected = false;
var subtractSelected = false;
var multiplySelected = false;
var divideSelected = false;

function updateField(){
    document.getElementById("entered-numbers").innerHTML = enteredValue
}

function updatePreviousCalculations(){
    document.getElementById("entered-numbers").innerHTML = enteredValue
}

function reset(){
    document.getElementById("entered-numbers").innerHTML = 0
    enteredValue = 0;
    temp = 0;
    previousAnswer = 0;
    answer = 0;
    addSelected = 0;
    subtractSelected = 0;
    multiplySelected = 0;
    divideSelected = 0;
}



function invert(){
    enteredValue *= -1;
}



// function add(){
//     if(addSelected){
//         answer += Number(temp);
//         temp = enteredValue;
//         enteredValue = 0;
//     } else {
//         addSelected = true;
//         temp = enteredValue;
//         enteredValue = 0;
//     }
// }

// function subtract(){
//     if(subtractSelected){
//         answer -= Number(temp)
//         temp = enteredValue;
//         enteredValue = 0;
//     } else {
//         subtractSelected = true;
//         temp = enteredValue;
//         enteredValue = 0;
//     }
// }

// function multiply(){
//     if(multiplySelected){
//         answer *= Number(temp)
//         temp = enteredValue;
//         enteredValue = 0;
//     } else {
//         multiplySelected = true;
//         temp = enteredValue;
//         enteredValue = 0;
//     }

// }

// function divide(){
//     if(divideSelected){
//         answer /= Number(temp)
//         temp = enteredValue;
//         enteredValue = 0;
//     } else {
//         divideSelected = true;
//         temp = enteredValue;
//         enteredValue = 0;
//     }
// }

function compute(){
    if(addSelected){
        answer += Number(enteredValue);
        // temp = 0;
        addSelected = false;
    } else if (subtractSelected){
        answer -= Number(temp);
        temp = 0;
        subtractSelected = false;
    } else if (multiplySelected){
        answer *= Number(temp);
        temp = 0;
        multiplySelected = false;
    } else if (divideSelected){
        answer /= Number(temp);
        temp = 0;
        divideSelected = false;
    }
}

function add(){
    // compute();
    answer += Number(enteredValue);
    console.log(enteredValue)
    console.log(answer)
    temp = enteredValue;
    enteredValue = 0;
    addSelected = true;
}

function subtract(){
    // compute();
    answer -= Number(enteredValue);
    enteredValue = 0;
    subtractSelected = true;
}

function multiply(){
    compute();
    answer *= Number(enteredValue);
    enteredValue = 0;
    multiplySelected = true;
}

function divide(){
    compute();
    answer /= Number(enteredValue);
    enteredValue = 0;
    divideSelected = true;
}

function equals(){
    compute();
    previousAnswer = answer;
    document.getElementById("entered-numbers").innerHTML = answer;
}

// function equals(){
//     if(answer != 0){
//         if(addSelected){
//             answer += Number(enteredValue);
//             // add();
//             addSelected = false;
//         } else if (subtractSelected){
//             answer -= Number(enteredValue);
//             // subtract();
//             subtractSelected = false;
//         } else if (multiplySelected){
//             answer *= Number(enteredValue);
//             // multiply();
//             multiplySelected = false;
//         } else if (divideSelected){
//             answer /= Number(enteredValue);
//             // divide();
//             divideSelected = false;
//         }
//     } else {
//         if(addSelected){
//             answer = Number(temp) + Number(enteredValue);
//             addSelected = false;
//         } else if (subtractSelected){
//             answer = Number(temp) - Number(enteredValue);
//             subtractSelected = false;
//         } else if (multiplySelected){
//             answer = Number(temp) * Number(enteredValue);
//             multiplySelected = false;
//         } else if (divideSelected){
//             answer = Number(temp) / Number(enteredValue);
//             divideSelected = false;
//         }
//     }
//     enteredValue = 0;
//     temp = 0;
//     previousAnswer = answer;
    
//     document.getElementById("entered-numbers").innerHTML = answer;
// }

function onePressed(){
    if(enteredValue == 0){
        enteredValue += 1;
    } else {
        enteredValue = enteredValue + "" + 1;
    }
    updateField();
}

function twoPressed(){
    if(enteredValue == 0){
        enteredValue += 2;
    } else {
        enteredValue = enteredValue + "" + 2;
    }
    updateField();
}

function threePressed(){
    if(enteredValue == 0){
        enteredValue += 3;
    } else {
        enteredValue = enteredValue + "" + 3;
    }
    updateField();
}

function fourPressed(){
    if(enteredValue == 0){
        enteredValue += 4;
    } else {
        enteredValue = enteredValue + "" + 4;
    }
    updateField();
}

function fivePressed(){
    if(enteredValue == 0){
        enteredValue += 5;
    } else {
        enteredValue = enteredValue + "" + 5;
    }
    updateField();
}

function sixPressed(){
    if(enteredValue == 0){
        enteredValue += 6;
    } else {
        enteredValue = enteredValue + "" + 6;
    }
    updateField();
}

function sevenPressed(){
    if(enteredValue == 0){
        enteredValue += 7;
    } else {
        enteredValue = enteredValue + "" + 7;
    }
    updateField();
}

function eightPressed(){
    if(enteredValue == 0){
        enteredValue += 8;
    } else {
        enteredValue = enteredValue + "" + 8;
    }
    updateField();
}

function ninePressed(){
    if(enteredValue == 0){
        enteredValue += 9;
    } else {
        enteredValue = enteredValue + "" + 9;
    }
    updateField();
}

function zeroPressed(){
    if(enteredValue == 0){
        enteredValue += 0;
    } else {
        enteredValue = enteredValue + "" + 0;
    }
    updateField();
}

function decimalPressed(){
    enteredValue = enteredValue + ".";
    updateField();
}

function prevAnswer(){
    // can also be answer?
    return previousAnswer;
}
// https://github.com/joewalnes/reconnecting-websocket/
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
                    
                    display.textContent = numberEntered
                    
                    // Logging part
                    // Make sure to not include very first 0
                    if(calculationLog.length == 0 && numberEntered == 0){
                        // do nothing (to prevent leading 0 for calculationLog)
                    } else {
                        calculationLog = calculationLog + numberEntered
                    }
                    

                } else {    // If not 0
                    // Append numbers
                    display.textContent = displayedNumber + numberEntered

                    // Logging part
                    calculationLog = calculationLog + numberEntered

                }

                buttons.dataset.previousOperation = 'number'

                // if(previousOperation === 'equals'){
                //     // do nothing
                //     // to prevent entering if condition on line 200... still needs to be improved..
                // } else if (previousOperation === 'operator'){
                //     buttons.dataset.previousOperation = 'number'
                // }  
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
                        var temp =  calculationLog.slice(0, calculationLog.length-1) + '+'  // Replaces original symbol to +
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
                calculationLog = calculationLog + previousAnswer
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

                    // Repeat previous operation if equal is pressed
                    // TODO: setting firstValue = '' at 267 fixes bug where one would constantly enter if condition on 208, breaks consecutive equal functionality...
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

                // TODO: Adding line below causes consecutive equal functionality to break since firstValue will always be empty....
                buttons.dataset.firstValue = ''
            }

        }
    })
})



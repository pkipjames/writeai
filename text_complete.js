/* Copyright (c) 2019 Fabrice Bellard */
var output_text_active = false;
var cancel_request = false;
var raw_output_text = "";
var output_text = "";
var input_text = "";
var socket_url = "ws://163.172.76.10:8080";
//var socket_url = "ws://127.0.0.1:8080";
var socket;

var button_el = document.getElementById("submit_button");
var more_button_el = document.getElementById("more_button");

function html_escape(s)
{
    var i, r, c;
    r = "";
    for(i = 0; i < s.length; i++) {
        c = s[i];
        switch(c) {
        case "<":
            r += "&lt;";
            break;
        case ">":
            r += "&gt;";
            break;
        case "&":
            r += "&amp;";
            break;
        case "\"":
            r += "&quot;";
            break;
        default:
            r += c;
            break;
        }
    }
    return r;
}

var example_inputs = [
    "In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English.",
    "My name is John. I am 34 year old.\n\nQ: What is my name ?\nA:",
    "int main(int argc, char **argv) {",
    "Making an omelette is simple!\n\n1.",
    "The Linux kernel is",
    "Game of Thrones is",
    "<html>",
    "The election to the European Parliament",
    "The United States Air Force facility commonly known as Area 51 is a highly classified remote detachment"
];
  
function on_select()
{
    var select_el = document.getElementById("select");
    var input_text_el = document.getElementById("input_text");
    var val = select_el.value | 0;
    if (val) {
        input_text_el.value = example_inputs[val - 1];
    }
}

function output_text_update()
{
    var gtext_el = document.getElementById("gtext");
    gtext_el.innerHTML = output_text;
}

function complete_init()
{
    var input_text_el = document.getElementById("input_text");
    var select_el = document.getElementById("select");
    input_text_el.value = "";
    select_el.value = "0";
}

function button_submit()
{
    var input_text_el = document.getElementById("input_text");

    if (output_text_active) {
        cancel_request = true;
    } else {
        complete_start(input_text_el.value, false);
    }
}

function button_more()
{
    complete_start(raw_output_text, true);
}

function complete_start(str, more_output)
{
    var gtext_header_el = document.getElementById("gtext_header");

    input_text = str.trim();
    if (input_text != "") {
        try {
            socket = new WebSocket(socket_url);
        } catch(err) {
            socket = null;
            console.log("Could not open websocket err=" + err);
            return false;
        }
        socket.onmessage = socket_on_message;
        socket.onclose = socket_on_close;
        socket.onopen = socket_on_open;
        socket.onerror = socket_on_error;
        
        gtext_header_el.style.display = "block";
        more_button_el.style.display = "none";
        
        button_el.innerHTML = "Stop";
        
        if (!more_output) {
            raw_output_text = input_text;
            output_text = "<b>" + html_escape(input_text) + "</b>";
        }
        output_text_update();
        output_text_active = true;
        cancel_request = false;
    }
}


function socket_on_open(e)
{
    socket.send("g," + input_text);
}

function socket_on_message(e)
{
    if (cancel_request) {
        socket.close();
    } else {
        raw_output_text += e.data;
        output_text += html_escape(e.data);
        output_text_update();
    }
}

function socket_on_close()
{
    complete_end();
}

function socket_on_error(e)
{
    console.log("websocket error=" + e);
}

function complete_end()
{
    button_el.innerHTML = "Generate another";
    more_button_el.style.display = "inline";
    output_text_active = false;
}

/* Copyright (c) 2019 Fabrice Bellard */
var is_decode = false;
var input_text = "";
var socket;
var socket_url = "ws://163.172.76.10:8080";
//var socket_url = "ws://127.0.0.1:8080";

var input_text_el = document.getElementById("input_text");
var input_len_el = document.getElementById("input_len");
var compressed_text_el = document.getElementById("compressed_text");
var compressed_len_el = document.getElementById("compressed_len");
var select_el = document.getElementById("select");

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
    "In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains.",
    "Lossless compression reduces bits by identifying and eliminating statistical redundancy. No information is lost in lossless compression.",
    "SMS was the most widely used data application at the end of 2010, with an estimated 3.5 billion active users, or about 80% of all mobile subscribers.",
    "Albert Einstein",
];
  
function on_select()
{
    var val = select_el.value | 0;
    if (val) {
        input_text_el.value = example_inputs[val - 1];
    }
}

function complete_init()
{
    input_text_el.value = "";
    compressed_text_el.value = "";
    select_el.value = "0";
    input_text_update();
    setInterval(input_text_update, 1000);
}


function plural(n, str)
{
    if (n > 1)
        str += "s";
    return n + " " + str;
}

function input_text_update()
{
    var n, str;

    n = input_text_el.value.length;
    input_len_el.innerHTML = plural(n, "char");

    n = compressed_text_el.value.length;
    compressed_len_el.innerHTML = plural(n, "char");
}

function button_compress()
{
    compressed_text_el.value = "Compressing...";
    encode_decode_start(input_text_el.value, false);
}

function button_decompress()
{
    input_text_el.value = "Decompressing...";
    encode_decode_start(compressed_text_el.value, true);
}

function encode_decode_start(str, is_decode1)
{
    input_text = str.trim();
    is_decode = is_decode1;
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
}

function socket_on_open(e)
{
    var cmd;
    if (is_decode)
        cmd = "d";
    else
        cmd = "c";
    socket.send(cmd + "," + input_text);
}

function socket_on_message(e)
{
    var str;
    str = html_escape(e.data);
    if (str == " ")
        str = "";
    if (is_decode) {
        input_text_el.value = str;
    } else {
        compressed_text_el.value = str;
    }
    socket.close();
}

function socket_on_close()
{
}

function socket_on_error(e)
{
    console.log("websocket error=" + e);
}

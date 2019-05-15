(()=>{
  const ws = new WebSocket('ws://wsc.2123.io');
  let token = '';
  let bits;

  ws.onopen = function() {
    ws.binaryType='arraybuffer';
    send({ "name":"KroshkoNikolay", "command": "challenge accepted" });
  }

  ws.onmessage = function(e) {
    if (typeof e.data === 'string' ){
      const res = JSON.parse(e.data);
      if (Object.keys(res).indexOf('next') > 0) {
        if (res.next === 'arithmetic'){
          token = res.token;
        }
        send({ "token": token, "command": res.next })
      }
      else if (res.name === 'arithmetic') {
        arithmetic(res.task)
      }
      else if (res.name === 'function_evaluation') {
        func_eval(res.task)
      }
      else if (res.name === 'binary_arithmetic') {
        bits = res.task.bits
      }
    } else {
      handleBits(e.data);
    }
  }

  function send(msg) {
    ws.send(JSON.stringify(msg));
  }

  function arithmetic(task){
    const values = task.values;
    const sign = task.sign;
    let str = values[0];
    for (let i = 1; i < values.length; i++){
      str += ` ${sign} ${values[i]}`
    }
    const result = eval(str);
    send({ "token": token, "command": "arithmetic", "answer": result })
  }

  function func_eval(task){
    const fn = eval(task.fn);
    send({ "token": token, "command": "function_evaluation", "answer": fn() })
  }

  function handleBits(data){
    let result
    if (bits === 8){
      result = new Uint8Array(data)
    } else if (bits === 16) {
      result = new Uint16Array(data)
    }
    sum = 0;
    for (let i = 0; i < result.length; i++){
      sum += result[i];
    }
    send({ "token": token, "command": "binary_arithmetic", "answer": sum })
  }
})()

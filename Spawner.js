const Child=require('child_process');

function RunCommand(Command) {
    return new Promise(Resolve=>{
        let Output='';
        let Process=Child.exec(Command,{timeout:60000},(...Pipes)=>{
            for(let Pipe of Pipes)
                if(Pipe)
                    Output+=Pipe;
        });
        Process.on('close',()=>{
            Resolve(Output);
        });
    });
}


process.on("message",async(message)=>{
    let Tests=message.Tests;
    let Entry=message.Entry;
    let Promises=[];
    let Completed=0,Spawned=0;
    Entry.tests=[];
    for(let Test of Tests) {
        let Result=await RunCommand(Entry.interpreter+' Entries/'+Entry.file+' "'+Test.input.replace(/\n/g,'" "')+'" <<< \''+Test.input+'\'');
        Entry.tests.push({
            input:Test.input,
            expected:Test.output,
            output:Result
        });
        Completed++;
        if(Completed%11==0)
            process.send({Completed});
    }
    process.send({Completed});
    process.send(Entry);
    setTimeout(()=>process.exit(0),100);
});

process.send("ready");
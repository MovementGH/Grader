//Dependancies
const Child=require('child_process');
const File=require('fs');

//Utility Functions
function overwriteConsole(text) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}
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
function Extension(File) {
    if(File.includes('.'))
        return File.split('.').slice(-1)[0];
    return '';
}
function Interpreter(File) {
    switch(String(Extension(File))) {
        case 'js':
            return 'node ';
        case 'py':
            return 'python ';
        default:
            return '';
    }
}
async function Compile(File) {
    var CompiledFile=File.split('.').slice(0,-1).join('.');
    switch(String(Extension(File))) {
        case 'cpp':
            await RunCommand('cd Entries && g++ '+File+' -o '+CompiledFile+' && rm '+File);
            break;
        case 'c':
            await RunCommand('cd Entries && gcc '+File+' -o '+CompiledFile+' && rm '+File);
            break;
        case 'hs':
            await RunCommand('cd Entries && ghc '+File+' -no-keep-hi-files -no-keep-o-files -dynamic -o '+CompiledFile+' && rm '+File);
            break;
    }
}

//Modes
async function Prepare() {
    console.log('Importing Entries...');
    await RunCommand('mkdir Entries;rm Entries/*;cp RawEntries/* Entries');
    for(let File of (await RunCommand('cd Entries && wc -c *')).split('\n').slice(0,-2))
        await RunCommand('cd Entries && mv '+File.split(' ').slice(-1)[0]+' '+File.replace(/ *(\d+) (.+)_\d+\.(\w+)/,'$1-$2.$3'));
    
    console.log('Compiling Entries...');
    await Promise.all((await RunCommand('cd Entries && ls -l')).split('\n').slice(1,-1).map(Line=>Compile(Line.split(' ').slice(-1)[0])));
}
async function Test(Generator,TestNum,MinDifficulty,MaxDifficulty) {
    overwriteConsole('Generating Tests... (0/'+TestNum+')');
    let Tests=[];
    if(!MaxDifficulty) 
        MaxDifficulty=MinDifficulty;
    for(var i=0;i<TestNum;i++)
        Tests.push(Generator(MinDifficulty+(MaxDifficulty-MinDifficulty)/(TestNum-1)*i)),
        overwriteConsole('Generating Tests... ('+(i+1)+'/'+TestNum+')');
    console.log('');

    var Spawned=0,Completed=0,Promises=[];
    let Entries=(await RunCommand('cd Entries && ls -l')).split('\n').slice(1,-1).map(Line=>{
        let Entry=Line.split(' ').slice(-1)[0];
        return {
            file:Entry,
            interpreter:Interpreter(Entry)
        }
    });

    overwriteConsole('Spawning Entries... (0/'+Entries.length*Tests.length+')');
    for(let Entry of Entries) {
        Entry.tests=[];
        for(let Test of Tests) {
            Promises.push(RunCommand(Entry.interpreter+' Entries/'+Entry.file+' "'+Test.input.replace(/\n/g,'" "')+'" <<< \''+Test.input+'\'').then(Result=>{
                Entry.tests.push({
                    input:Test.input,
                    expected:Test.output,
                    output:Result
                });
                overwriteConsole('Waiting for Entries... ('+(++Completed)+'/'+Entries.length*Tests.length+')');
                if(Completed==Entries.length*Tests.length)
                    File.writeFileSync('Output.json',JSON.stringify(Entries,null,2)),
                    console.log('');
            }));
            overwriteConsole('Spawning Entries... ('+(++Spawned)+'/'+Entries.length*Tests.length+')');
        }
    }
    console.log('');
    overwriteConsole('Waiting for Entries... (0/'+Entries.length*Tests.length+')');
    await Promise.all(Promises);
}
function Output() {
    var Data=JSON.parse(File.readFileSync('Output.json').toString());
    for(let Entry of Data) {
        Entry.NumCorrect=Entry.tests.filter(Test=>Test.output.match(new RegExp(Test.expected.split('\n').map(Line=>'\\s*'+Line+'\\s*').join('\\n')))).length;
        Entry.Passed=Entry.NumCorrect==Entry.tests.length;
    }
    console.log('Passed:\n'+Data.filter(o=>o.Passed).map(o=>o.file).join('\n'));
    console.log('Failed:\n'+Data.filter(o=>!o.Passed).map(o=>o.file+' ['+o.NumCorrect+'/'+o.tests.length+']').join('\n'));
}
async function Grade(Generator,TestNum,MinDifficulty,MaxDifficulty) {
    await Prepare();
    await Test(Generator,TestNum,MinDifficulty,MaxDifficulty?MaxDifficulty:MinDifficulty);
    Output();
}

//Handle Input
let Mode=process.argv[2];
if(!Mode)
    Mode='';
switch(String(Mode.toLowerCase())) {
    case 'grade':
        Grade(require('./Generators/'+process.argv[3]+'.js'),+process.argv[4],+process.argv[5],+process.argv[6]);
        break;
    case 'prepare':
        Prepare();
        break;
    case 'test':
        Grade(require('./Generators/'+process.argv[3]+'.js'),+process.argv[4],+process.argv[5],+process.argv[6]);
        break;
    case 'output':
        Output();
        break;
    default:
        console.log('Welcome to the Automated Code Golf Grader!');
        console.log('');
        console.log('Full automated grading:');
        console.log('node Grader.js grade [Generator] [Test Count] [Difficulty Min] [Difficulty Max]');
        console.log('');
        console.log('Partial automated grading:');
        console.log('node Grader.js prepare');
        console.log('node Grader.js test [Generator] [Test Count] [Difficulty Min] [Difficulty Max]');
        console.log('node Grader.js output');
        console.log('');
        console.log('Setup:');
        console.log('Put all of the source code in the RawEntries folder');
        console.log('The files must be named Name_ID.Extension');
        console.log('Each file will be considered a seperate entry, and will be automatically compiled if required');
        console.log('');
        console.log('Dependencies:');
        console.log('gcc - To compile .c and .cpp files');
        console.log('ghc - To compile .hs files');
        console.log('');
        console.log('Arguments:');
        console.log('Generator - Generator file in Generators folder, excluding extension');
        console.log('Test Count - The number of tests to run on each entry');
        console.log('Difficulty Min - The minimum difficulty passed to the generator');
        console.log('Difficulty Max - The maximum difficulty passed to the generator. If not given, will equal Min');
        console.log('');
        console.log('Generators:');
        console.log('Generators must export a function which returns a test case.');
        console.log('A test case must be an object containing two members, "input" and "output"');
        console.log('Seperate inputs must be seperated by newlines, they will be converted appropriately for argv or stdin');
        console.log('Generators will be given a "difficulty" to generate. Depending on the problem, this may be the length, size, or anything.');
}
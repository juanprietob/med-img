const medimg = require("med-img-lib");
const path = require('path');
const os = require('os');
const argv = require('minimist')(process.argv.slice(2));

const help = function(){
    console.error("Help: Use medimg to split a dicom directory or upload to the server.");
    console.error("\nOptional parameters:");
    console.error("create       Create a project");
    console.error("upload       Upload to med-img-server");
    console.error("split        Split a dicom directory locally");
    
    console.error("");
    console.error("Create options:");
    console.error("--name <project name>");
    console.error("--description <project description>");
    console.error("--collaborators <collaborators>");
    console.error("");
    console.error("Upload options:");
    console.error("--dir <directory>    Input Directory with dicoms");
    console.error("Options:");
    console.error("--projectname <project name>  The project name in med-img-server.");
    console.error("");
    console.error("Split options:");
    console.error("--dir <directory>    Input Directory with dicoms");
    console.error("--output <directory> Output directory");
}

if(argv["h"] || argv["help"]){
    help();
    process.exit(1);
}

var agentoptions = {
    rejectUnauthorized: false
}
medimg.setAgentOptions(agentoptions);

var config_codename = 'medimg';
if(argv._[0] == "create"){

    if(!argv["name"] || !argv["description"]){
        console.error("--name and --description are required!");
        process.exit(1);
    }
    
    var project = {
        name: argv["name"],
        type: "project",
        description: argv["description"],
        owner: "juanprietob@gmail.com",
        collaborators: argv["collaborators"]? argv["collaborators"].split(','): [],
        studies: []
    };

    medimg.start(path.join(os.homedir(), '.' + config_codename + '.json'))
    .then(function(){
        return medimg.createProject(project);
    })
    .catch(console.error)
}else if(argv._[0] == "upload"){

    if(!argv["dir"]){
        console.error("--dir is required!");
        process.exit(1);
    }

    medimg.start(path.join(os.homedir(), '.' + config_codename + '.json'))
    .then(function(){
        return medimg.uploadDicomDir(argv["dir"], argv["projectname"]);
    })
    .catch(console.error)    
}else if(argv._[0] == "split"){

    if(!argv["dir"]){
        console.error("--dir is required!");
        process.exit(1);
    }

    medimg.splitDicomDir(argv["dir"], argv["output"])
    .then(function(res){
        console.log(res);
    })
    .catch(function(err){
        console.error(err);
    });
}




var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');
var qs = require('querystring');

const Joi = require('@hapi/joi');
const Lab = require('@hapi/lab');
const lab = exports.lab = Lab.script();

const medimg = require("./index");
const medimgmodel = require('hapi-dicom-model');

const cksum = require('cksum');

var env = process.env.NODE_ENV;
if(!env) throw "Please set NODE_ENV variable.";

var project = {
        name: "Test project",
        type: "project",
        description: "This is a test project",
        owner: "juanprietob@gmail.com",
        collaborators: [],
        studies: []
    };

var joiokres = Joi.object().keys({
        ok: Joi.boolean().valid(true),
        id: Joi.string(),
        rev: Joi.string()
    });
// var dicomtestdir = '../../data/NCBCP000393-v01-1-20mo/';
var dicomtestdir = '../../data/VIL-0342-2/';

lab.experiment("Test clusterpost", function(){
    

    lab.test('Start medimg lib', function(){

        return medimg.start()
        .then(function(res){
            console.log(res);
        });
        
    });

    lab.test('Create project', function(){

        return medimg.createProject(project)
        .then(function(res){
            Joi.assert(res, joiokres);
        });
        
    });

    lab.test('returns true when some dicom images are imported to a project', function(){
        return medimg.uploadDicomDir(dicomtestdir, project.name)
        .then(function(res){
            console.log(res);
        })
    });

    var dicominstances = [];

    lab.test('returns true when the projects are retrieved from the database, a study, a series', function(){
        return medimg.getProjects()
        .then(function(projects){
            return Promise.map(projects, function(project){
                return Promise.map(project.studies, function(studyid){
                    return medimg.getStudy(studyid);
                });
            })
        })
        .then(function(studies){
            return _.flatten(studies);
        })
        .then(function(studies){
            return Promise.map(studies, function(study){
                return medimg.getSerie(study.seriesid);
            });
        })
        .then(function(series){
            return _.flatten(series);
        })
        .then(function(series){
            return Promise.map(series, function(serie){
                return medimg.getInstances(serie.seriesid);
            });
        })
        .then(function(instances){
            dicominstances = _.flatten(instances);
        });
    });

    lab.test('returns true when all dicom json are returned', function(){
        return Promise.map(dicominstances, function(instance){
            return medimg.getDicom(instance.instanceid);
        })
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object()));
        });
    });

    var cksumremote = [];
    lab.test('returns true when all dicom files are returned with cksum', function(){
        return Promise.map(dicominstances, function(instance){
            return Promise.map(instance.attachments, function(attachment){
                return medimg.getDicomStream(instance.instanceid, attachment)
                .then(function(stream){
                    return new Promise(function(resolve, reject){
                        stream.pipe(cksum.stream(function (sum, length) {
                            resolve({
                                file: attachment, 
                                cksum: sum.readUInt32BE(0),
                                length: length
                            })
                        }));
                    });
                });
            });
        })
        .then(function(res){
            return _.flatten(res);
        })
        .then(function(res){
            cksumremote = res;
        });
    });

    lab.test('returns true when local files are returned with cksum', function(){
        return medimg.getDicomFiles(dicomtestdir)
        .then(function(dcmfiles){
            return Promise.map(dcmfiles, function(dcmfile){
                return new Promise(function(resolve, reject){
                    fs.createReadStream(dcmfile)
                    .pipe(cksum.stream(function (sum, length) {
                        resolve({
                            file: path.basename(dcmfile), 
                            cksum: sum.readUInt32BE(0),
                            length: length
                        });
                    }));    
                });
            });
        })
        .then(function(res){
            return _.flatten(res);
        })
        .then(function(cksumlocal){
            return _.map(cksumremote, function(ckremote){
                var cklocal = _.find(cksumlocal, function(cklocal){
                    return ckremote.file == cklocal.file;
                });
                return _.isEqual(ckremote, cklocal);
            });
        })
        .then(function(compare){
            Joi.assert(compare, Joi.array().items(Joi.boolean().valid(true)));
        });
    });

    lab.test('returns true when studies are deleted', function(){
        return medimg.getProjectByName(project.name)
        .then(function(project){
            return Promise.map(project.studies, function(studyid){
                return medimg.deleteStudy(studyid);
            })
        })
    });

    lab.test('returns true when project is deleted', function(){
        return medimg.getProjectByName(project.name)
        .then(function(project){
            console.log(project);
            return medimg.deleteProject(project._id)
            .then(function(res){
                console.log(res);
            });
        });
    });
    
});
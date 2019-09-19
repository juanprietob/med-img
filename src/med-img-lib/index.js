'use strict'
const request = require('request');
const fs = require('fs');
const Promise = require('bluebird');
const path = require('path');
const _ = require('underscore');
const Joi = require('@hapi/joi');
const qs = require('querystring');
const prompt = require('prompt');
const os = require('os');
const jws = require('jsonwebtoken');
const dicom = require("dicom");
const medimgmodel = require("hapi-dicom-model");
const HapiJWTCouch = require('hapi-jwt-couch-lib');




class MedImgLib extends HapiJWTCouch{
    constructor(){
        super()
        this.configfilename = path.join(os.homedir(), '.medimg-config.json');
    }

    createProject(project){
        Joi.assert(project, medimgmodel.projectpost);
        const self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/project",
                method: "POST",
                agentOptions: self.agentOptions,
                auth: self.auth,
                json: project
            }
            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        });
    }

    deleteProject(id){
        const self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/project/" + encodeURIComponent(id),
                method: "DELETE",
                agentOptions: self.agentOptions,
                auth: self.auth
            }
            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        });
    }

    getProject(query){
        const self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/project",
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth,
                qs: query
            }
            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    getProjectByName(name){
        return this.getProject({name});
    }

    getProjectById(id){
        return this.getProject({id});
    }

    getProjects(){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/projects",
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    getStudy(id){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/dicom/study/" + encodeURIComponent(id),
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        })
    }

    getSerie(id){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/dicom/serie/" + encodeURIComponent(id),
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        })
    }

    getInstances(seriesid){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/dicom/instances/" + encodeURIComponent(seriesid),
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    getDicom(id){
        var self = this;
        return new Promise(function(resolve, reject){

            var options = {
                url : self.getServer() + "/med-img/dicom/" + encodeURIComponent(id),
                method: "GET",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    getDicomStream(id, filename){
        var self = this;

        var options = {
            url : self.getServer() + "/med-img/dicom/" + id + "/" + encodeURIComponent(filename),
            method: "GET",
            agentOptions: self.agentOptions,
            auth: self.auth
        }

        return Promise.resolve(request(options));
    }

    deleteStudy(id){
        var self = this;
        return new Promise(function(resolve, reject){

            var options = {
                url : self.getServer() + "/med-img/dicom/study/" + encodeURIComponent(id),
                method: "DELETE",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    deleteSerie(id){
        var self = this;
        return new Promise(function(resolve, reject){

            var options = {
                url : self.getServer() + "/med-img/dicom/serie/" + encodeURIComponent(id),
                method: "DELETE",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    deleteDicom(id){
        var self = this;
        return new Promise(function(resolve, reject){

            var options = {
                url : self.getServer() + "/med-img/dicom/" + encodeURIComponent(id),
                method: "DELETE",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    deleteDicomAttachment(id, filename){
        var self = this;
        return new Promise(function(resolve, reject){

            var options = {
                url : self.getServer() + "/med-img/dicom/" + encodeURIComponent(id) + "/" + encodeURIComponent(filename),
                method: "DELETE",
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    readdirSync(dir){
        var files = [];
        var that = this;
        fs.readdirSync(dir).forEach(function(file){
            try{
                var current = path.join(dir, file);
                var stat = fs.statSync(current);
                if (stat && stat.isDirectory()) {
                    files = files.concat(that.readdirSync(current));
                }else {
                    files.push(current);
                }
            }catch(e){
                console.error(e);
            }
        });
        return files;
    }

    mkdirp(outputdir){
        var pathparse = path.parse(outputdir);
        var allpatharray = outputdir.split(path.sep);
        var currentpath = pathparse.root;
        _.each(allpatharray, function(p){
            currentpath = path.join(currentpath, p);
            try{
                fs.statSync(currentpath);
            }catch(e){
                try{
                    fs.mkdirSync(currentpath);
                }catch(e){
                    console.error(e);
                    throw e;
                }
            }
        });
    }

    dumpDicomFile(dcmfile){
        try{
            console.log(dcmfile)
            return this.dumpDicomStream(fs.createReadStream(dcmfile));    
        }catch(e){
            return Promise.reject(e);
        }
        
    }

    dumpDicomStream(dcmstream){
        return new Promise(function(resolve, reject){
            try{
                var decoder = dicom.decoder({
                    guess_header: true,
                    read_header: true
                });
                decoder.on('error', reject);
     
                var encoder = new dicom.json.JsonEncoder();
                encoder.on('error', reject)

                var sink = new dicom.json.JsonSink(function(err, json) {
                    if (err) {
                        reject(err);
                    }else{
                        resolve(json);
                    }
                });

                dcmstream.pipe(decoder).pipe(encoder).pipe(sink);
            }catch(e){
                reject(e);
            }
        });
    }

    getDicomFile(dcmfile){
        return this.dumpDicomFile(dcmfile)
        .then(function(dcmjson){
            return dcmfile;
        })
        .catch(function(err){
            console.error(dcmfile, err);
            return null;
        });
    }

    getDicomFiles(dir){
        var files = this.readdirSync(dir);
        var self = this;
        return Promise.map(files, function(dcmfile){
            return self.getDicomFile(dcmfile);
        })
        .then(function(res){
            return _.compact(res);
        });
    }

    getDate(){
        var d = new Date();
        return [d.getFullYear(), d.getDate(), d.getMonth()].join("-");
    }

    getDicomOuputDir(dcmjson){
        var seriesid = dicom.json.get_value(dcmjson, dicom.tags.SeriesNumber);
        seriesid = seriesid? seriesid: "0";
        var seriesDescription = dicom.json.get_value(dcmjson, dicom.tags.SeriesDescription);
        seriesDescription = seriesDescription? (seriesid + "_" + seriesDescription): seriesid;
        var patientid = dicom.json.get_value(dcmjson, dicom.tags.PatientID);
        patientid = patientid? patientid: "no_patient_id";
        var studydate = dicom.json.get_value(dcmjson, dicom.tags.StudyDate);
        studydate = studydate? studydate: that.getDate();

        return path.join(String(patientid), String(studydate), String(seriesDescription));
    }

    getDicomValue(dcmjson, tag){
        return dicom.json.get_value(dcmjson, dicom.tags[tag]);
    }

    getDicomOutputPaths(dcmfiles){
        var that = this;
        return _.map(dcmfiles, function(dcmfile){
            dcmfile.outputdir = that.getDicomOuputDir(dcmfile.json);
            return dcmfile;
        });
    }

    copy(instream, outstream){
        return new Promise(function(resolve, reject){
            instream.pipe(outstream);
            instream.on('error', reject);
            outstream.on('error', reject);
            outstream.on('end', resolve);
        });
    }

    splitDicomDir(dir, outputdir){
        const self = this;
        var files = this.readdirSync(dir);
        
        return Promise.map(files, function(dcmfile){
            return self.dumpDicomFile(dcmfile)
            .then(function(dcmjson){
                var dcmoutputdir =  path.join(outputdir, self.getDicomOuputDir(dcmjson));
                var outputpath = path.join(dcmoutputdir, path.basename(dcmfile));
                if(!fs.existsSync(dcmoutputdir)){
                    self.mkdirp(dcmoutputdir);
                }
                var instream = fs.createReadStream(dcmfile);
                var outstream = fs.createWriteStream(outputpath);
                return self.copy(instream, outstream);
            })
            .catch(function(err){
                console.error(err);
            });
        });
    }

    /*
    *   Uploads a file to the database. 
    *   jobid is required
    *   filename is required
    *   name is optional. 
    */
    uploadDicomDir(directory, projectid){
        const self = this;
        var files = this.readdirSync(directory);
        
        return Promise.map(files, function(dcmfile){
            return self.dumpDicomFile(dcmfile)
            .then(function(dcmjson){
                return self.uploadDicomFile(dcmfile, projectid);
            })
            .catch(function(err){
                console.error(err);
            });
        }, {concurrency: 2});
    }

    uploadDicomFile(dcmfile, projectid){

        const self = this;

        return new Promise(function(resolve, reject){

            var name = path.basename(dcmfile);

            var url = self.getServer() + "/med-img/dicom/";

            if(projectid){
                url += projectid + "/";
            }  

            url += path.basename(name);

            try{
                var options = {
                    url : url,
                    method: "POST",
                    agentOptions: self.agentOptions,
                    headers: { 
                        "Content-Type": "application/octet-stream"
                    },
                    auth: self.auth
                }

                fs.createReadStream(dcmfile)
                .pipe(request(options, function(err, res, body){
                        if(err){
                            reject(err);
                        }else{
                            resolve(JSON.parse(body));
                        }
                    })
                );
                
            }catch(e){
                reject(e);
            }

        });
    }


    uploadFiles(jobid, filenames, names){
        var self = this;
        return Promise.map(filenames, function(filename, index){
            if(names !== undefined){
                return self.uploadFile(jobid, filename, names[index]);
            }
            return self.uploadFile(jobid, filename);
        }, {concurrency: 1})
        .then(function(allupload){
            return allupload;
        });
    }



    start(){
        var self = this;
        var config = self.getConfig();

        if(config){
            self.setServer(config.uri);
            if(self.testUserToken(config)){
                self.setUserToken(config);
                return Promise.resolve();
            }else{
                return self.promptUsernamePassword()
                .then(function(user){
                    return self.userLogin(user)
                    .then(function(res){
                        config.token = res.token;
                        self.saveConfig(config);
                    });
                });
            }
        }else{
            return super.start()
            .then(function(config){
                self.saveConfig(config);
            });
        }
    }

}

module.exports = new MedImgLib()
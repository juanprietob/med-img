'use strict'
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');
var Joi = require('joi');
var qs = require('querystring');
var prompt = require('prompt');
var os = require('os');
var jws = require('jsonwebtoken');
var HapiJWTCouch = require('hapi-jwt-couch-lib');

var medimgmodel = require("hapi-dicom-model");

class MedImgLib extends HapiJWTCouch{
    constructor(){
        super()
        this.configfilename = path.join(os.homedir(), '.medimg-config.json');
        this.joiconf = Joi.object().keys({
            uri: Joi.string().uri(),
            token: Joi.string()
        });
    }

    setConfigFileName(configfilename){
        this.configfilename = configfilename;
    }

    getConfigFileName(){
        return this.configfilename;
    }

    getConfigFile() {
        try {
            // Try to load the user's personal configuration file in the current directory
            var conf = require(this.configfilename);
            Joi.assert(conf, this.joiconf);
            return conf;
        } catch (e) {
            return null;
        }
    };

    setConfigFile (config) {
        try {
            // Try to save the user's personal configuration file in the current working directory
            var confname = this.configfilename;
            console.log("Writing configuration file", confname);
            fs.writeFileSync(confname, JSON.stringify(config));
        } catch (e) {
            console.error(e);
        }
    };

    createProject(project){
        Joi.assert(project, medimgmodel.projectpost);
        return this.createDocument(project, "/med-img/projects");
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

    getProjectByName(name){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/med-img/project/" + name,
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

    createDocument(doc, route){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + route,
                method: "POST",
                json: doc,
                agentOptions: self.agentOptions,
                auth: self.auth
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else if(res.statusCode !== 200){
                    console.error(err);
                    reject(body);
                }else{
                    resolve(body);
                }
            });
        });
    }

    getDocument(id){
        Joi.assert(id, Joi.string().alphanum());
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url : self.getServer() + "/dataprovider/" + id,
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

    updateDocument(doc){
        Joi.assert(doc, medimgmodel.job);
        var self = this;
        return new Promise(function(resolve, reject){
            try{
                var options = { 
                    uri: self.getServer() + "/dataprovider",
                    method: 'PUT', 
                    json : doc, 
                    agentOptions: self.agentOptions,
                    auth: self.auth
                };
                
                request(options, function(err, res, body){
                    if(err) resolve(err);
                    resolve(body);
                });
            }catch(e){
                reject(e);
            }
            
        });
    }

    updateDocuments(docs){
        var self = this;
        return Promise.map(docs, function(doc){
            return self.updateDocument(doc);
        }, {concurrency: 1});
    }

    /*
    *   Uploads a file to the database. 
    *   jobid is required
    *   filename is required
    *   name is optional. 
    */
    uploadFile(jobid, filename, name){
        Joi.assert(jobid, Joi.string().alphanum())
        Joi.assert(filename, Joi.string())
        var self = this;
        return new Promise(function(resolve, reject){

            if(name === undefined){
                name = path.basename(filename);
            }else{
                name = encodeURIComponent(name);
            }

            try{
                var options = {
                    url : self.getServer() + "/dataprovider/" + jobid + "/" + name,
                    method: "PUT",
                    agentOptions: self.agentOptions,
                    headers: { 
                        "Content-Type": "application/octet-stream"
                    },
                    auth: self.auth
                }

                var fstat = fs.statSync(filename);
                if(fstat){

                    var stream = fs.createReadStream(filename);

                    stream.pipe(request(options, function(err, res, body){
                            if(err){
                                reject(err);
                            }else{
                                resolve(JSON.parse(body));
                            }
                        })
                    );
                }else{
                    reject({
                        "error": "File not found: " + filename
                    })
                }
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
        var config = self.getConfigFile();

        if(config){
            self.setServer(config.uri);
            if(self.testUserToken(config)){
                self.setUserToken(config);
                return Promise.resolve();
            }else{
                return self.promptUsernamePassword()
                .then(function(user){
                    return self.userLogin(user);
                });
            }
        }else{
            return super.start();
        }
    }

}

module.exports = new MedImgLib()
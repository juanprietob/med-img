
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');
var qs = require('querystring');

const Joi = require('joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

var medimg = require("./index");
var medimgmodel = require('hapi-dicom-model');

var env = process.env.NODE_ENV;
if(!env) throw "Please set NODE_ENV variable.";

var project = {
        name: "Test project",
        type: "project",
        description: "This is a test project",
        collection: [],
        owner: "juanprietob@gmail.com",
        collaborators: []
    };

lab.experiment("Test clusterpost", function(){
    

    lab.test('Start medimg lib', function(){

        return medimg.start()
        .then(function(res){
            console.log(res);
        });
        
    });

    lab.test('returns true when user is logged in.', function(){

    });
    
});
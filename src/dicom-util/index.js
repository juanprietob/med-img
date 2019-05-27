"use strict";
 
const dicom = require("dicom");
const Promise = require('bluebird');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

class DICOMUtil {

    constructor(){

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
            return {
                file: dcmfile, 
                json: dcmjson
            }
        })
        .catch(function(err){
            console.error(dcmfile, err);
            return null;
        });
    }

    getDicomFiles(dir){
        var files = this.readdirSync(dir);
        var that = this;
        return Promise.map(files, function(dcmfile){
            return that.getDicomFile(dcmfile);
        })
        .then(function(res){
            return _.compact(res);
        });
    }

    getDicomStream(dcmstream){
        return this.dumpDicomStream(dcmstream)
        .then(function(dcmjson){
            return {
                stream: dcmstream, 
                json: dcmjson
            }
        })
        .catch(function(err){
            console.error(dcmfile, err);
            return null;
        });
    }

    getDate(){
        var d = new Date();
        return [d.getFullYear(), d.getDate(), d.getMonth()].join("-");
    }

    getDicomOuputPath(dcmjson){
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

    getDicomOutputPaths(dcmfiles){
        var that = this;
        return _.map(dcmfiles, function(dcmfile){
            dcmfile.outputdir = that.getDicomOuputPath(dcmfile.json);
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
        var that = this;
        return this.getDicomFiles(dir)
        .then(function(dcmfiles){
            return that.getDicomOutputPaths(dcmfiles);
        })
        .then(function(dcmfiles){

            _.each(_.uniq(_.pluck(dcmfiles, 'outputdir')), function(outdir){
                that.mkdirp(path.join(outputdir, outdir));
            });

            return Promise.map(dcmfiles, function(dcmfile){
                var outputpath = path.join(outputdir, dcmfile.outputdir, path.basename(dcmfile.file));
                var instream = fs.createReadStream(dcmfile.file);
                var outstream = fs.createWriteStream(outputpath);
                return that.copy(instream, outstream);
            });
        });
    }

    splitDicomStreams(dcmstreams, outputdir){
        var that = this;
        return Promise.map(dcmstreams, function(dcmstream){
            return that.getDicomStream(dcmstream);
        })
        .then(function(dcmstreamobjs){
            return that.getDicomOutputPaths(dcmstreamobjs);
        })
        .then(function(dcmstreamobjs){
            _.each(_.uniq(_.pluck(dcmstreamobjs, 'outputdir')), function(outdir){
                that.mkdirp(path.join(outputdir, outdir));
            });

            return Promise.map(dcmstreamobjs, function(dcmstreamobj){
                var outputpath = path.join(outputdir, dcmstreamobj.outputdir, path.basename(dcmfile.file));
                var outstream = fs.createWriteStream(outputpath);
                return that.copy(dcmstreamobj.stream, outstream);
            });
        });
    }
}

module.exports = new DICOMUtil()

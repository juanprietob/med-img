
const _ = require('underscore');
const Promise = require('bluebird');
const Boom = require('boom');
const path = require('path');
const qs = require('querystring');
const projectsjoi = require('hapi-dicom-model');
const Joi = require('@hapi/joi')

module.exports = function (server, conf) {

	var handler = {};
	const validateOwnershipPromise = function(doc, credentials){
		if(doc.owner === credentials.email || credentials.scope.indexOf('admin') >= 0 || doc.collaborators.indexOf(credentials.email) != -1){
			return Promise.resolve(doc);
		}else{
			return Promise.reject(Boom.unauthorized("You are not allowed to access this job document!"));
		}
	}

	const getProjects = function(query){
		var view = '_design/med-img-projects/_view/name';
		return server.methods.couchprovider.getViewQs(view, query);
	}

	handler.getProjects = function(req, rep){
		var {credentials} = req.auth;

		return getProjects({include_docs: true})
		.then(function(projects){
			return _.uniq(_.pluck(projects, "doc"));
		})
		.then(function(projects){
			return Promise.map(projects, function(proj){
				return validateOwnershipPromise(proj, credentials)
				.catch(function(e){
					return null;
				});
			})
		})
		.then(function(projects){
			return _.compact(projects);
		})
		.catch(function(err){
			console.error(err);
			return Boom.badRequest(err);
		});
	}

	const getProjectById = function(id){
		return server.methods.couchprovider.getDocument(id)
		.then(function(project){
			Joi.assert(project, projectsjoi.project);
			return project;
		});
	}

	server.method({
	    name: 'medimg.getProjectById',
	    method: getProjectById,
	    options: {}
	});

	const getProjectByName = function(name){
		var query = {
			key: JSON.stringify(name),
			include_docs: true
		}

		return getProjects(query)
		.then(function(projects){
			projects = _.pluck(projects, 'doc');
			if(projects.length > 0){
				return projects[0];	
			}
			throw Boom.notFound(name);
		});
	}

	server.method({
	    name: 'medimg.getProjectByName',
	    method: getProjectByName,
	    options: {}
	});

	handler.getProject = function(req, rep){
		var credentials = req.auth.credentials;
		var {name, id} = req.query;
		var projectprom;

		if(name){
			projectprom = getProjectByName(name);
		}else{
			projectprom = getProjectById(id);
		}

		return projectprom
		.then(function(project){
			return validateOwnershipPromise(project, credentials);
		})
		.catch(function(err){
			return Boom.badRequest(err);
		});
	}

	handler.createProject = function(req, rep){
		var doc = req.payload;
		var credentials = req.auth.credentials;

		return server.methods.medimg.getProjectByName(doc.name)
		.then(function(res){
			return Boom.conflict("Project with same name exists!");
		})
		.catch(function(err){
			return server.methods.couchprovider.uploadDocuments([doc])
			.then(function(res){
				return res[0];
			})
		});
	}

	handler.deleteProject = function(req, rep){

		return server.methods.couchprovider.getDocument(req.params.id)
		.then(function(project){
			Joi.assert(project, projectsjoi.project);
			var projectpath = path.join(conf.archivedir, project.name);
			server.methods.couchprovider.removeDirectorySync(projectpath);

			return server.methods.couchprovider.deleteDocument(project);
			
		})
		.catch(function(e){
			return Boom.badRequest(e);
		});
	}

	/*
	*/
	handler.getDocument = function(req, rep){
		
		server.methods.medimg.getDocument(req.params.id)
		.then(function(doc){
			return validateOwnershipPromise(doc, req.auth.credentials);
		})
		.then(rep)
		.catch(function(e){
			rep(Boom.wrap(e));
		});
		
	}

	/*
	*/
	handler.updateDocument = function(req, rep){

		var doc = req.payload;
		var credentials = req.auth.credentials;

		server.methods.medimg.uploadDocuments(doc)
		.then(function(res){
			rep(res[0]);
		})
		.catch(function(e){
			rep(Boom.wrap(e));
		});
	}

	/*
	*/
	handler.addAttachment = function(req, rep){
		server.methods.medimg.getDocument(req.params.id)
		.then(function(doc){
			return server.methods.medimg.addDocumentAttachment(doc, req.params.name, req.payload);
		})
		.then(rep)
		.catch(function(e){
			rep(Boom.wrap(e));
		});
	}

	/*
	*/
	handler.getAttachment = function(req, rep){
		var docid = req.params.id;
		var name = req.params.name;

		server.methods.medimg.getDocument(docid)
		.then(function(doc){
			return validateOwnershipPromise(doc, req.auth.credentials);
		})
		.then(function(doc){
			if(doc._attachments && doc._attachments[name]){
				rep.proxy(server.methods.medimg.getDocumentURIAttachment(docid + "/" + req.params.name));
			}else{
				rep(Boom.notFound(docid + "/" + name));
			}
		})
		.catch(function(e){
			rep(Boom.wrap(e));
		});
	}

	return handler;
}
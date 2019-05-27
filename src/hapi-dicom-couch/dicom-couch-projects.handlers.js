
var _ = require('underscore');
var Promise = require('bluebird');
var Boom = require('boom');
var path = require('path');

module.exports = function (server, conf) {

	const validateOwnershipPromise = function(doc, credentials){
		return new Promise(function(resolve, reject){
			if(doc.email === credentials.email || credentials.scope.indexOf('admin') >= 0 || doc.collaborators.indexOf(credentials.email) != -1){
				resolve(doc);
			}else{
				reject(Boom.unauthorized("You are not allowed to access this job document!"));
			}
		});
	}

	/*
	*/
	handler.createDocument = function(req, rep){
		
		var doc = req.payload;
		var credentials = req.auth.credentials;

		if(!doc.owner){
			doc.owner = credentials.email;
		}

		server.methods.medimg.uploadDocuments(doc)
		.then(function(res){
			if(res.length === 1){
				return res[0];
			}else{
				return res;
			}
		})
		.then(rep)
		.catch(function(e){
			rep(Boom.badRequest(e));
		});
		
	}

	const getProjects = function(params){
		return new Promise(function(resolve, reject){
			var key = {
				include_docs: true
			}

			var view = '';
			if(params.email && params.name){
				key.key = JSON.stringify([params.email, params.name]);
				view = '_design/projects/_view/getByEmailName?' + JSON.stringify(key);
			}else if(params.email){
				key.key = params.email;
				view = '_design/projects/_view/getByEmail?' + JSON.stringify(key);
			}else if(params.name){
				key.key = params.name;
				view = '_design/projects/_view/getByName?' + JSON.stringify(key);
			}else{
				view = '_design/projects/_view/get?' + JSON.stringify(key);
			}

			return server.methods.medimg.getView(view);
			.then(function(projects){
				return _.uniq(_.pluck(projects, 'docs'));
			});
		})
	}

	server.method({
	    name: 'medimg.getProjects',
	    method: getProjects,
	    options: {}
	});

	handler.getProjects = function(req, rep){

		var params = req.params? req.params: {};
		params.email = credentials.email;

		if(credentials.scope.indexOf('admin') != -1){
			params = {};
		}

		server.methods.medimg.getProjects(params)
		.then(function(projects){
			return Promise.map(projects, validateOwnershipPromise);
		})
		.then(rep)
		.catch(rep);
	}

	handler.createProject = function(req, rep){
		var doc = req.payload;
		var credentials = req.auth.credentials;

		server.methods.medimg.getProjects(credentials.email)
		.then(function(projects){
			if(projects.length > 0){
				rep()
			}else{
				handler.createDocument(req, rep);
			}
		});
	}

	/*
	*/
	handler.getDocument = function(req, rep){
		
		server.methods.medimg.getDocument(req.params.id)
		.then(function(doc){
			return server.methods.medimg.validateOwnershipPromise(doc, req.auth.credentials);
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
			return server.methods.medimg.validateOwnershipPromise(doc, req.auth.credentials);
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

	handler.deleteDocument = function(req, rep){

		server.methods.medimg.getDocument(req.params.id)
		.then(function(doc){
			return server.methods.medimg.deleteDocument(doc);
		})
		.then(rep)
		.catch(function(e){
			rep(Boom.wrap(e));
		});
	}
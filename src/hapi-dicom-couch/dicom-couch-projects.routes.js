	
module.exports = function (server, conf) {
	
	const handlers = require('./dicom-couch-projects.handlers')(server, conf);
	const projectsjoi = require('hapi-dicom-model');
	const Joi = require('@hapi/joi')

	server.route({
		method: 'GET',
		path: "/med-img/projects",
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.getProjects,
			validate: {
			  	query: false,
			    params: null, 
			    payload: false
			},
			response: {
				schema: Joi.array().items(projectsjoi.project)
			},
			description: 'Get the projects posted to the database'
	    }
	});

	server.route({
		method: 'GET',
		path: "/med-img/project",
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.getProject,
			validate: {
			  	query: Joi.object().keys({
			  		name: Joi.string().optional(),
			  		id: Joi.string().optional()
			  	}), 
			  	params: null,
			    payload: false
			},
			response: {
				schema: projectsjoi.project
			},
			description: 'Get the project document posted to the database'
	    }
	});	

	server.route({
		path: '/med-img/project',
		method: 'PUT',
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.updateDocument,
			validate: {
				query: false,
		        payload: projectsjoi.project,
		        params: null
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to update a job document in the couch database.'
		}
	});


	server.route({
		method: 'POST',
		path: "/med-img/project",
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.createProject,
			validate: {
				query: false,
		        payload: projectsjoi.projectpost,
		        params: null
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to post job documents to the couch database.'
		}
	});

	server.route({
		path: '/med-img/project/{id}',
		method: 'DELETE',
		config: {
			auth: {
                strategy: 'token',
                scope: ['admin']
            },
			handler: handlers.deleteProject,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().required()
			    }, 
			    payload: false
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to delete a project'
		}
	});

}
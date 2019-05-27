	
module.exports = function (server, conf) {
	
	var handlers = require('./dataprovider.handlers')(server, conf);
	

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
			    params: false, 
			    payload: false
			},
			response: {
				schema: Joi.array().items(project)
			},
			description: 'Get the projects posted to the database'
	    }
	});

	server.route({
		method: 'GET',
		path: "/med-img/project/{name}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.getProjects,
			validate: {
			  	query: false,
			    params: {
			    	name: Joi.string()
			    }, 
			    payload: false
			},
			response: {
				schema: project
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
		        payload: project,
		        params: false
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
		        payload: projectpost,
		        params: false
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
			handler: handlers.deleteDocument,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required()
			    }, 
			    payload: false
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to delete job documents from the database'
		}
	});

}
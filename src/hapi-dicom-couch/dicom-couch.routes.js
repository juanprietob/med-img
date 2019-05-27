
module.exports = function (server, conf) {
	
	var handlers = require('./dicom-couch.handlers')(server, conf);
	var Joi = require('@hapi/joi');

	server.route({
		path: '/med-img/dicom/{projectid}',
		method: 'POST',
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.dicomImport,
			validate: {
				query: false,
		        payload: true,
		        params: null
			},
		    payload: {
	        	maxBytes: 1024 * 1024 * 1024,
	    		output: 'stream'
	        },
			description: 'This route will be used to import dicom images to the database'
		}
	});

	server.route({
		path: '/med-img/dicom/{projectid}/{patientid}/{date}/{seriesnumber}',
		method: 'PUT',
		config: {
			auth: {
                strategy: 'token',
                scope: ['med-img']
            },
			handler: handlers.dicomImport,
			validate: {
				query: false,
		        payload: true,
		        params: null
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to import dicom images to the database'
		}
	});

	server.route({
		method: 'PUT',
		path: "/med-img/{patientid}/{date}/{seriesnumber}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.imageImport,
	      	validate: {
		      	query: false,
		        params: {
		        	patientid: Joi.string().required(),
		        	date: Joi.string().required(),
		        	seriesnumber: Joi.string().required()
		        },
		        payload: true
		    },
		    payload: {
	        	maxBytes: 1024 * 1024 * 1024,
	    		output: 'stream'
	        },
	        response: {
	        	schema: Joi.object()
	        },
		    description: 'Add image data'
	    }
	});

	server.route({
		path: '/med-img/{id}',
		method: 'DELETE',
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost']
            },
			handler: handlers.deleteImage,
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

	// server.route({
	// 	path: '/dataprovider',
	// 	method: 'PUT',
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.updateJob,
	// 		validate: {
	// 			query: false,
	// 	        payload: clustermodel.job,
	// 	        params: false
	// 		},
	// 		payload:{
	// 			output: 'data'
	// 		},
	// 		description: 'This route will be used to update a job document in the couch database.'
	// 	}
	// });
	

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/{id}",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.getJob,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	id: Joi.string().alphanum().required()
	// 		    }, 
	// 		    payload: false
	// 		},
	// 		response: {
	// 			schema: clustermodel.job
	// 		},
	// 		description: 'Get the job document posted to the database'
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['admin']
 //            },
	// 		handler: handlers.getAllJobs,
	// 		validate: {
	// 		  	query: Joi.object().keys({
	// 		  		executable: Joi.string().optional()
	// 		  	}).optional(),
	// 		    params: false, 
	// 		    payload: false
	// 		},
	// 		response: {
	// 			schema: Joi.array().items(clustermodel.job).min(0)
	// 		},
	// 		description: 'Get all document posted to the database'
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/user",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.getUserJobs,
	// 		validate: {
	// 		  	query: Joi.object().keys({
	// 		  		userEmail: Joi.string().email().optional(),
	// 		  		jobstatus: Joi.string().optional(),
	// 		  		executable: Joi.string().optional(),
	// 		  		executionserver: Joi.string().optional()
	// 		  	}), 
	// 		  	params: false
	// 		},
	// 		response: {
	// 			schema: Joi.array().items(clustermodel.job).min(0)
	// 		},
	// 		description: 'Get the jobs posted to the database for a user.'
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/{id}/{name}",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.getJob,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	id: Joi.string().alphanum().required(),
	// 		    	name: Joi.string().required()
	// 		    },
	// 		    payload: false
	// 		},
	// 		description: 'Get a specific attachment of the document posted to the database.',
	// 		cache : { expiresIn: 60 * 30 * 1000 }
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/download/{id}/{name}",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.getDownloadToken,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	id: Joi.string().alphanum().required(),
	// 		    	name: Joi.string().required()
	// 		    },
	// 		    payload: false
	// 		},
	// 		description: 'Get a temporary token to download an attachment from a job. This is useful when you want to download a file in a separate window. The query parameter expiresIn is expressed in seconds or a string describing a time span. Eg: 60, "2 days", "10h", "7d"',
	// 		response: {
	// 			schema: Joi.object().keys({
	// 				token: Joi.string().required()
	// 			})
	// 		}
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/download/job/{id}",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.getDownload,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	id: Joi.string().alphanum().required()
	// 		    },
	// 		    payload: false
	// 		},
	// 		description: 'Download job in a tar file',
	// 		response: {
	// 			schema: true
	// 		}
	//     }
	// });

	// server.route({
	// 	method: 'DELETE',
	// 	path: "/dataprovider/download/job/{id}",
	// 	config: {
	// 		auth: {
 //                strategy: 'token',
 //                scope: ['clusterpost', 'executionserver']
 //            },
	// 		handler: handlers.deleteDownload,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	id: Joi.string().alphanum().required()
	// 		    },
	// 		    payload: false
	// 		},
	// 		description: 'Delete the tar file in temp folder',
	// 		response: {
	// 			schema: true
	// 		}
	//     }
	// });

	// server.route({
	// 	method: 'GET',
	// 	path: "/dataprovider/download/{token}",
	// 	config: {
	// 		handler: handlers.downloadAttachment,
	// 		validate: {
	// 		  	query: false,
	// 		    params: {
	// 		    	token: Joi.string().required()
	// 		    },
	// 		    payload: false
	// 		},
	// 		description: 'Get an attachment using a temporary token',
	// 		cache : { expiresIn: 60 * 30 * 1000 }
	//     }
	// });

}

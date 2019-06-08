var Joi = require('@hapi/joi');

// exports.parameter = Joi.object().keys({
// 	flag: Joi.string().allow(''),
//   	name: Joi.string().allow('')
// });

// exports.output = Joi.object().keys({
// 	type: Joi.string().valid('file', 'directory', 'tar.gz'), 
//   	name: Joi.string(),
//   	path: Joi.string().optional()
// });

// exports.input = Joi.object().keys({
//   	name: Joi.string(),
//   	remote : Joi.object().keys({
//   		serverCodename: Joi.string().optional(),
//   		uri: Joi.string()
//   	}).optional(),
//   	local : Joi.object().keys({
//   		uri: Joi.string()
//   	}).optional()
// });

// exports.jobpost = Joi.object().keys({
// 		type: Joi.string().required(),
// 		userEmail: Joi.string().required(),			
// 		executionserver: Joi.string().required(),
// 		jobparameters: Joi.array().items(exports.parameter).optional(),
// 		executable: Joi.string().required(),			
// 		parameters: Joi.array().items(exports.parameter).min(1),
// 		inputs: Joi.array().items(exports.input).min(1).optional(),
// 		outputs: Joi.array().items(exports.output).min(1),
// 		outputdir: Joi.string().optional(),
// 		name: Joi.string().optional(),
// 		scope: Joi.array().items(Joi.string()).optional(),
// 		version: Joi.string().optional(),
// 		data: Joi.object().optional()
//     });

exports.project = Joi.object().keys({
		_id: Joi.string().alphanum().required(),
		_rev: Joi.string().required(),
		name: Joi.string().required(),
    	type: Joi.string().valid('project').required(),
    	description: Joi.string(),
    	owner: Joi.string().email().required(),
    	collaborators: Joi.array().items(Joi.string().email()),
        studies: Joi.array().items(Joi.string())
	});

exports.projectpost = Joi.object().keys({
		name: Joi.string().required(),
    	type: Joi.string().valid('project').required(),
    	description: Joi.string(),
    	owner: Joi.string().email().required(),
    	collaborators: Joi.array().items(Joi.string().email()).min(0),
        studies: Joi.array().items(Joi.string()).min(0)
    });

exports.study = Joi.object().keys({
    "seriesid": Joi.string(),
    "seriesdescription": Joi.any(),
    "patientid": Joi.any(),
    "studydate": Joi.any(),
    "modality": Joi.any(),
    "seriesnumber": Joi.any()
});

exports.serie = Joi.object().keys({
    "seriesid": Joi.string(),
    "seriesnumber": Joi.any(),
    "seriesdescription": Joi.any()
})

exports.instance = Joi.object().keys({
    "instanceid": Joi.string(),
    "attachments": Joi.array().items(Joi.any())
})
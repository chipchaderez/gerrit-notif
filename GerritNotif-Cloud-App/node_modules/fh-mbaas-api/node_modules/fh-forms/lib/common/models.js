var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = function (){
  var MODELNAMES = {
    FORM: "Form",
    PAGE: "Page",
    FIELD: "Field",
    THEME: "Theme",
    FIELD_RULE : "FieldRule",
    PAGE_RULE: "PageRule",
    APP_FORMS: "AppForms",
    APP_THEMES: "AppThemes",
    FORM_SUBMISSION: "FormSubmission",
    GROUPS: "Groups",
    APP_CONFIG: "AppConfig"
  };

  var allowedFontStyles = ["normal", "bold", "italic"];
  var allowedBorderThicknesses = ["none", "thin", "medium", "thick"];
  var allowedBorderStyles = ["solid", "dotted", "dashed", "double"];

  var default_config = {
    "client": {
      "sent_save_min": 5,
      "sent_save_max": 100,
      "sent_items_to_keep_list": [5, 10, 20, 30, 40, 50, 100],
      "targetWidth": 480,
      "targetHeight": 640,
      "quality": 75,
      "debug_mode": false,
      "logger" : false,
      "max_retries" : 0,
      "timeout" : 30,
      "log_line_limit": 300,
      "log_email": ""
    },
    "cloud": {
      "logging": {
        "enabled":false
      }
    }
  };

  return {
    "init": function (conn) {
      var schemaOptions = { strict: true,  versionKey: false  };

      var pageSchema = new Schema({
        "name" : String,
        "description": String,
        "fields" : [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD }]
      }, schemaOptions);

      var fieldSchema = new Schema({
        "name": {type: String, required: true},
        "helpText": String,
        "fieldCode": {type: String, required: false},//Unique field code defined by the user.
        "type": {type: String, required: true, enum: ["text", "textarea", "url", "number", "emailAddress", "dropdown", "radio", "checkboxes", "location", "locationMap", "photo", "signature", "file", "dateTime", "sectionBreak", "matrix", "barcode", "sliderNumber"]},
        "repeating": {type: Boolean, default: false}, //All fields can be repeating.
        "fieldOptions": Schema.Types.Mixed,
        "required": {type: Boolean, required: true},
        "adminOnly": {type: Boolean, default: false}
      }, schemaOptions);

      var ruleConditionalStatementsSchema = new Schema({
        "sourceField": { type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD, required: true},
        "restriction": {type: String, required: true, enum: ["is not","is equal to","is greater than","is less than","is at","is before","is after","is", "contains", "does not contain", "begins with", "ends with"]},
        "sourceValue": {type: String, required: true}
      }, {_id : false,  versionKey: false});

      var fieldRulesSchema = new Schema({ // All fields in a fieldRule are required
        "type": {type: String, required: true, enum: ["show", "hide"]},
        "relationType" : {"type": String, "required" : true, "default": "and", "enum": ["and", "or"]},
        "ruleConditionalOperator" : {"type": String, "required" : true, "default": "and", "enum": ["and", "or"]},
        "ruleConditionalStatements" : [ruleConditionalStatementsSchema],
        "targetField": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD, required: true }]
      }, schemaOptions);

      var pageRulesSchema = new Schema({ // All fields in a page rule are required
        "type": {type: String, required: true, enum: ["skip", "show"]},
        "relationType" : {"type": String, "required" : true, "default": "and", "enum": ["and", "or"]},
        "ruleConditionalOperator" : {"type": String, "required" : true, "default": "and", "enum": ["and", "or"]},
        "ruleConditionalStatements" : [ruleConditionalStatementsSchema],
        "targetPage": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.PAGE, required: true }]
      }, schemaOptions);

      var formSchema = new Schema({
        "dateCreated": {type : Date, default : Date.now, required: true},
        "lastUpdated": {type : Date, default : Date.now, required: true},
        "updatedBy" : {type: String, required: true},
        "createdBy": {type:String, required: true},
        "name" : {type: String, required: true},
        "description": String,
        "pages" : [{ type: Schema.Types.ObjectId, ref: MODELNAMES.PAGE }],
        "fieldRules": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD_RULE }],
        "pageRules": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.PAGE_RULE }],
        "subscribers" : [{type: String}]
      }, schemaOptions);

      formSchema.pre('validate', function (next){
        // all new forms will have a createdby this allows for old forms which do not have a createdBy
        if(! this.createdBy){
          this.createdBy = this.updatedBy;
        }
        next();
      });

      var styleSubSectionSchema = new Schema({
        "label": {type: String, requried: true},
        "id": {type: String, required: true},
        "typography": {
          "fontFamily": {type: String, required: false},
          "fontStyle": {type: String, required: false, enum: allowedFontStyles},
          "fontSize": {type: String, required: false},
          "fontColour": {type: String, required: false}
        },
        "border": {
          "thickness": {type: String, required: false, enum: allowedBorderThicknesses},
          "style": {type: String, required: false, enum: allowedBorderStyles},
          "colour": {type: String, required: false}
        },
        "background": {
          "background_color": {type: String, required: false}
        },
        "margin":{
          "top": {type: String, required: false},
          "right": {type: String, required: false},
          "bottom": {type: String, required: false},
          "left": {type: String, required: false}
        },
        "padding":{
          "top": {type: String, required: false},
          "right": {type: String, required: false},
          "bottom": {type: String, required: false},
          "left": {type: String, required: false}
        }
      }, {_id : false});

      var styleSectionSchema = new Schema({
        "label": {type: String, required: true},
        "id": {type: String, required: true},
        "sub_sections": [styleSubSectionSchema]
      }, {_id : false});

      var staticCSSSchema = new Schema({
        "key": {type: String, required:true},
        "value": {type: String, required:true}
      }, {_id: false});

      var themeStructureSubSections = new Schema({
        "label": {type: String, requried: true},
        "id": {type: String, required: true},
        "style": {
          "typography": {type: Boolean, required: true},
          "border": {type: Boolean, required: true},
          "background": {type: Boolean, required: true},
          "margin": {
            "top": {type: Boolean, required: false},
            "right": {type: Boolean, required: false},
            "bottom": {type: Boolean, required: false},
            "left": {type: Boolean, required: false}
          },
          "padding": {
            "top": {type: Boolean, required: false},
            "right": {type: Boolean, required: false},
            "bottom": {type: Boolean, required: false},
            "left": {type: Boolean, required: false}
          }
        },
        "staticCSS": [staticCSSSchema],
        "classAdditions": [{
          "classNameAddition": {type: String, required:true},
          "cssAdditions": [staticCSSSchema]
        }]
      }, {_id : false});

      var themeStructureSchema = new Schema({
        "label": {type: String, required: true},
        "id": {type: String, required: true},
        "sub_sections": [themeStructureSubSections]
      }, {_id : false});

      var themeSchema = new Schema({ // When definining a theme, all fields are required except logo...
        "lastUpdated": {type : Date, default : Date.now},
        "updatedBy" : {type: String, required: true},
        "createdBy" : {type: String, required: true},
        "name": {type: String, required: true},
        "css" : {type : String, required:true, default: "/*Error Generating Appforms CSS*/"},
        "logo": {
          "base64String": {type: String, required: true},
          "height": {type: Number, required: true},
          "width": {type: Number, required: true}
        },
        "sections": [styleSectionSchema],
        "structure": {
          "sections": [themeStructureSchema],
          "logo": {
            "staticCSS": [staticCSSSchema]
          }
        }
      }, schemaOptions);

      themeSchema.pre('validate', function (next){
        if(! this.createdBy){
          this.createdBy = this.updatedBy;
        }
        next();
      });

      var appFormsSchema = new Schema({
        "appId": {type: String, required: true},
        "lastUpdated": {type : Date, default : Date.now, required: true},
        "forms": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FORM, required: true}]
      }, schemaOptions);

      var appConfigSchema = new Schema({
        "appId": {type: String, required: true, unique: true},
        "client": {
          "sent_save_min": {type : Number, required: false, default: default_config.client.sent_save_min},
          "sent_save_max": {type : Number, required: false, default: default_config.client.sent_save_max},
          "sent_items_to_keep_list": [{type : Number, required: false, default: default_config.client.sent_items_to_keep_list}],
          "targetWidth": {type : Number, required: false, default: default_config.client.targetWidth},
          "targetHeight": {type : Number, required: false, default: default_config.client.targetHeight},
          "quality": {type : Number, required: false, default: default_config.client.quality},
          "debug_mode": {type: Boolean, required: false, default: default_config.client.debug_mode},
          "logger" : {type: Boolean, required: false, default: default_config.client.logger},
          "max_retries" : {type : Number, required: false, default: default_config.client.max_retries},
          "timeout" : {type : Number, required: false, default: default_config.client.timeout},
          "log_line_limit": {type : Number, required: false, default: default_config.client.log_line_limit},
          "log_email": {type: String, default: default_config.client.log_email},
          "config_admin_user": [{type: String}],
          "log_level": {type:String,required:true, default:1},
          "log_levels": {type:Array, required: false, default:["error", "warning", "log", "debug"]}
        },
        "cloud": {
          "logging": {
            "enabled": {type: Boolean, required: false, default: default_config.cloud.logging.enabled}
          }
        }
      }, schemaOptions);

      var appThemesSchema = new Schema({
        "appId": {type: String, required: true},
        "theme": { type: Schema.Types.ObjectId, ref: MODELNAMES.THEME, required: true }
      }, schemaOptions);

      var groupsSchema = new Schema({
        "name": {type: String, required: true},
        "users" : [{ type: String, required: true}],
        "forms": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FORM, required: true}],
        "apps" : [{ type: String, required: true}],
        "themes": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.THEME, required: true}]
      }, schemaOptions);

      groupsSchema.pre('save', function (next){
        if(null === this.users) this.users = [];
        if(null === this.forms) this.forms = [];
        if(null === this.apps) this.apps = [];
        if(null === this.themes) this.themes = [];
        next();
      });

      var formFieldsSchema = new Schema({
        "fieldId": { type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD},
        "fieldValues": Schema.Types.Mixed
      }, {_id : false});



      var submissionCommentsSchema = new Schema({
        "madeBy": {type: String, required: true},
        "madeOn": {type: Date, required: true},
        "value": {type: String, required: true}
      }, {_id : false,  versionKey: false});

      var formSubmissionSchema = new Schema({
        "submissionCompletedTimestamp": {"type": Date, default: 0, required: true},
        "updatedBy": {type: String},
        "updatedTimestamp": {"type": Date, default: Date.now},
        "timezoneOffset" : {"type" : Number, required: true},
        "appId": {type: String, required: true},
        "appClientId": {type: String, required: true},
        "appCloudName": {type: String, required: true},
        "appEnvironment": {type: String, required: true},
        "formSubmittedAgainst":{type: Object, required: false},
        "formId": { type: Schema.Types.ObjectId, ref: MODELNAMES.FORM , required: true},
        "userId": {type: String, required: false},
        "deviceId": {type: String, required: true},
        "deviceIPAddress": {type: String, required: true},
        "submissionStartedTimestamp": {type : Date, default : Date.now, required: true},
        "status": {type: String, enum: ["pending", "complete", "error"],  required:true, default: "pending"},
        "deviceFormTimestamp": {type: Date, required: true},
        "masterFormTimestamp": {type: Date, required: true},
        "comments": [submissionCommentsSchema],
        "formFields": [formFieldsSchema]
      }, schemaOptions);

      formSubmissionSchema.pre('save', function (next) {
        var newTimestamp = Date.now();
        if (process.env.FH_FORMS_DEBUG) console.log('formSubmissionSchema pre save this.updatedTimestamp:', this.updatedTimestamp.getTime(), ' newTimestamp:', newTimestamp);
        this.updatedTimestamp = newTimestamp;
        next();
      });

      conn.model(MODELNAMES.FORM, formSchema);
      conn.model(MODELNAMES.PAGE, pageSchema);
      conn.model(MODELNAMES.FIELD, fieldSchema);
      conn.model(MODELNAMES.FIELD_RULE, fieldRulesSchema);
      conn.model(MODELNAMES.PAGE_RULE, pageRulesSchema);
      conn.model(MODELNAMES.THEME, themeSchema);
      conn.model(MODELNAMES.APP_FORMS, appFormsSchema);
      conn.model(MODELNAMES.APP_THEMES, appThemesSchema);
      conn.model(MODELNAMES.FORM_SUBMISSION, formSubmissionSchema);
      conn.model(MODELNAMES.GROUPS, groupsSchema);
      conn.model(MODELNAMES.APP_CONFIG, appConfigSchema);
    },
    "get": function(conn, modelName){
      return conn.model(modelName);
    },
    "MODELNAMES": MODELNAMES
  };
};

blue-button-benchmark.js
========================

Performance optimized patient data storage In MongoDB
 
With the advent of patient centric solutions in the Health IT market such as patient-in-the center exchange models or stand alone patient health record software, there is a momentum to persist patient data in models similar to increasingly popular Blue Button CCDA.   These patient centric solutions typically use a NoSQL database such as the market leading MongoDB.   MongoDB’s document based database solution is particularly well suited for such models.

In this paper we concentrate on a Blue Button CCDA based patient data model and investigate how to design patient data schemas to use MongoDB to its full potential.  Various schemas with varying document design and indexing choices are compared using various performance metrics and general recommendations are provided.  Such recommendations should prove useful not only for patient centric solutions but for VistA as well since similar models are being used or will be used for caching VistA data.

# Data Content

Data whose storage characteristics is being investigated here is the Master Health Record which contains all historical data about patients' health.  It is based on [blue-button](https://github.com/amida-tech/blue-button) data model.  [blue-button](https://github.com/amida-tech/blue-button) it self is based on Blue Button CCDA.

## Health Data Content

Following CCDA, Master Health Record is organized in sections such as allergies and medications and storage is built based on this sectional organization.  Sections are further organized as a set of entries. Thus the unit health data storage element here is an 'entry' whose content differs from section to section.  For example for allergies the [Mongoose schema](http://mongoosejs.com/docs/guide.html) for an entry is
``` javascript
var allergy_entry = {
  allergen: {
    name: String,
    code: String,
    code_system_name: String,
    nullFlavor: String
    translations: [{
      name: String,
      code: String,
      code_system_name: String,
      nullFlavor: String
    }]
  },
  date: [{date: Date, precision: String}],
  identifiers: [{
     identifier:String,
     identifier_type: String
  }],
  severity: String,
  status: String,
  reaction: [{
    reaction: {  
      code: String, 
      name: String, 
      code_system_name: String,
      nullFlavor: String
      translations: [{
        name: String,
        code: String,
        code_system_name: String
        nullFlavor: String
      }],
     severity: String
    }
  }]
};
```
We use entries for those are not arrays such as demographics.

Patient master record can thus be described as a collection of sections and each section is an array of entries
``` javascript
var mhr = {
  demographics: demographics_entry,
  medication: [medication_entry],
  allergies: [allergy_entry],
  ...
};
```

## Metadata

For each entry we assume three pieces of metadata: patient key, status and update history.
In addition the following metadata is assumed for each entry

### Patient Key

Each entry belongs to a patient. We identify patient with a single string for which we will use variable `pat_key` in schema descriptions.  Patient key is important since our solution needs to be scalable with number of patients. 

### Status

We will assume that each entry can have three states: `active`, `preliminary`, `deleted`.  Active entries are those that are in a master health record.   Preliminary entries are those that have been read from a source for a patient but needs to be reviewed before being added to a master health record or rejected.  Deleted entries are once active ones that were removed from a master health record or preliminary ones that were rejected.

We will use variable `status` in schema descriptions.

### Update History

This information includes the sources of the entry and update instances.

# Schemas

This work looks into various ways to store this information in MongoDB from performance perspective.

# Use Case

This work assumes a PHR application.

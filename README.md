blue-button-benchmark.js
========================

Performance optimized patient data storage In MongoDB
 
With the advent of patient centric solutions in the Health IT market such as patient-in-the center exchange models or stand alone patient health record software, there is a momentum to persist patient data in models similar to increasingly popular Blue Button CCDA.   These patient centric solutions typically use a NoSQL database such as the market leading MongoDB.   MongoDB’s document based database solution is particularly well suited for such models.

In this paper we concentrate on a Blue Button CCDA based patient data model and investigate how to design patient data schemas to use MongoDB to its full potential.  Various schemas with varying document design and indexing choices are compared using various performance metrics and general recommendations are provided.  Such recommendations should prove useful not only for patient centric solutions but for VistA as well since similar models are being used or will be used for caching VistA data.

<a name="dataContent"/>
# Data Content

Data whose storage characteristics is being investigated here is the Master Health Record which contains all historical data about patients' health.  It is based on [blue-button](https://github.com/amida-tech/blue-button) data model.  [blue-button](https://github.com/amida-tech/blue-button) it self is based on Blue Button CCDA.

## Health Data Content

Following CCDA, Master Health Record is organized in sections such as allergies and medications and storage is built based on this sectional organization.  Sections are further organized as a set of entries. Thus the unit health data storage element here is an _entry_ whose content differs from section to section.  For example for allergies the [Mongoose schema](http://mongoosejs.com/docs/guide.html) for an entry is
``` javascript
var allergy_entry_schema = {
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

Each entry contains two to four fields that can identify the entry in a list of entries.  Patient can select an entry from a list based on these entries to see more details.  As an example for allergies the summary fields are
``` javascript
var allergy_summary_schema = {
  allergen_name: String,
  severity: String,
  status: String
};
```

Patient Master Heath Record is a collection of sections and each section is an array of entries
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

Each entry in a master patient record originates from a source such as a CCDA file.  In subsequent receiving of sources entries can be updated or confirmed as they are.  The following is a schema of the information we assume
``` javascript
var source_info = {
  name: String,
  content: String,
  content_type: String,
  mime_type: String
};

var history = [
  source: source_info,
  update_type: String,
  update_instance: Date
];
```
Here `update_type` can be `new`, `update`, or `duplicate`.  `new` identifies the original creation of the entry, `update` identifies an update to an existing entry and `duplicate` identifies source that includes the same existing entry.

# Use Case and Parameters

The use case for this work is a PHR application 

# Database Designs

This work looks into various database designs to store Master Health Record [data content](#dataContent) in MongoDB from performance perspective.  This section describes all the designs that are compared.  Databases are described in terms of MongoDB collections and schema for each collection.

In these design descriptions we will assume master health record consists of two sections: allergies and procedures.  In the actual experimentation of these design number of sections will be one of the parameters for testing.

<a name="singleEntryDesigns"/>
## Single Entry Designs

<a name="design1"/>
## Design 1

In this design each entry for a particular section, source and update history are stored in their own collections.  Each collection record `pat_key` as an index property. The collections are: _allergies_, _procedures_, _sources_, and _histories_.

``` javascript
var allergies_schema = {
  data: allergies_entry,
  pat_key: String,
  status: String,
  history: [ObjectId]   // histories
};

var procedures_schema = {
  data: procedures_entry,
  pat_key: String,
  status: String,
  history: [ObjectId]   // histories
};

var histories_schema = {
  source: ObjectId,     // sources
  update_type: String,
  update_instance: Date
};

var source_schema = {
  name: String,
  content: String,
  content_type: String,
  mime_type: String
}
```
both `pat_key` and `status` are indexed properties.

## Design 2

This is a variation of [Design 1](#design1) where instead of different collections for each section, all sections are stored in the same collection.  To identify an individual section type a `section_name` property is added to the schema.  Thus _allergies_ and _procedures_ are replaced by a single _entries_ collection whose schema is
``` javascript
var entries = {
  data: allergies_entry,
  pat_key: String,
  status: String,
  section_name: String,
  history: [ObjectId]   // histories
};
```
`section_name` is indexed.

## Design 3

In this design instead of identifying patient with `pat_key` as part of each entry record there is a patient collection which includes all the entries
``` javascript
var patients = {
  pat_key: String,
  allergies: [ObjectId],
  procedures: [ObjectId]
  deleted_allergies: [ObjectId],
  deleted_procedures: [ObjectId],
  preliminary_allergies: [ObjectId],
  preliminary_procedures: [ObjectId]
};
```

## Design 4

This is a variation of Design 3 except that `status` and `section_name` are stored as part of the entries array
``` javascript
var patients = {
  pat_key: String,
  entries: [{
     id: ObjectId,
     status: String,
     section_name: String
  ]
};
```

## Multiple Entry Designs

In each of the designs in the previous [section](#singleEntryDesigns), the basic document stored is an entry in a particular section.  This section explores the possibility to store multiple entries in a single document.  Since there is a 16M limit on a single document there must be a limit on the number entries a single document can contain. This limit `entries_per_document` is one of the parameters of the experimentation of performance.   













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

The use case for this work is a PHR application where patients can save, review and update their Master Health Record.  The use flow and database implications are as follows
* Welcome page shows the Master Health Record organized as sections.  Each section shows list of all the active entries with only the summary fields.  This will be identified as "summary active load'.
* Patient can receive health data from a source such as CCDA files and update the health record.  Based on the content of the source
** New active entries can be added.
** Existing active entries can be updated
* Patient can choose a particular entry from the list and
** See the details.
** Update the entry.
** Remove an entry.

The parameters for this effort are
* `num_patients`
* `num_new_patient`
* `num_of_sections`

# Scenarios

The scenarios are described in terms of patient access to a simplified Personal Health Record application.  This application includes a 'dashboard' where patients can see their 'active' Master Health Record in a list.  The list is organized in sections and includes 'summary fields' for patients to identify a particular entry.  Patients can select a particular entry and can view it in its entriety and update or add new values to fields.  Patients can also obtain their health data from various sources such as Blue Button continuity of care documents which can include multiple sections and entries that exist in the Master Health Record.  The PHR application compares what is currently in the Master Health Record to what exists on the source and adds the new ones to Master Health Record .  Patient can also remove particular entries.

### Initial State



### New Patient Scenario

In this scenario a patient updates all the sections in master health record with one full save when there is no previous health data.  The implementation of this scenario depends on the following parameters
* `new_patient_per_minute`: This is how many patients are created per minute and will be a constant for each run.
* `num_sections`: This is the number of sections in a master health record and will be a constant for each run.
* `num_entries_per_section`: This is the average number of entries per section and will be a constant for each run and each patient.  

### Review Master Health Record Scenario

In this scenario a patient launches the application to review her master health record data and possibly send it to her provider or print it.  She does not change any health information.  Implementation of this scenario loads all the active entry summary fields for a patient organized as sections.  Once the full list is loaded a subset of the list is loaded in its entirety.  The implementation depends on the following parameters
* `num_review_per_month`: This is the number of read only access to PHR per patient per month.  Depending on the number of patients in the system this determines the review only access per minute.
* `detailed_review_percent`: This determines the percentage of overall number of entries that the patient wants to see in its entirety.  This determines the number of entries that are fully loaded per review only session.
* `review_summary_to_detail_delay`: This is the delay in seconds between patient loading the summaries and loading the first detailed entry.
* `review_detail_to_detail_delay`: This is the delay in seconds between patient loading full entries.

### Update Master Health Record Scenario

In this scenario a patient launches the application to add new entries, remove an existing entry or update an existing entry. Implementation of this scenario loads all the active entry summary fields for a patient as organized as sections.  Then new entries are added, a subset of entries are removed and a subset of entries are updated.  

The implementation depends on the following parameters
* `num_update_per_year`: This is the number of write access to master record per patient per year.  Depending on the number of patients in the system this determines write access to database per minute.
* `new_entries_percent`: This is the average number of new entries patient adds in percentage to the total number of entries in the system in a write session.
* `remove_entries_percent`: This is the average number of entries patient removes in percentage to the total number of entries in the system in this scenario.
* `update_entries_percent`: This is the average number of entries patient updates in percentage to the total number of entries in the system during this scenario.

In addition the implementation considers loading the summary, adding new entries, removing existing entries and updating existing entries as seperate steps and pauses `step_delay` second between each step per patient.

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

# Performance Metric

In this effort we mainly depend on MongoDB 'Profiler'.  The profiler comes with MongoDB and stores all the executed commands and the execution duration in the database.  Our approach is to run our scenarios with profiler turned on for all the design choices and compare the execution times.  In addition to choice of the database design the following are some other parameters that is being considered
* Number of patients
* Frequency of patient access to Master Health Record
* Number of sections in Master Heath Record
* Frequency of read access to Master Health Record, differentiating between summary fields and full entries
* Frequency and nature of updates to the Master Health Record

# Environment

We will run MongoDB on a Linux (Ubuntu) Virtual Machine on a Mac Pro laptop.  The scenarios will be implemented in node.js and run in the Mac Pro itself.  

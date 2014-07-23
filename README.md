blue-button-benchmark.js
========================

Performance optimized patient data storage In MongoDB
 
With the advent of patient centric solutions in the Health IT market such as patient-in-the center exchange models or stand alone patient health record software, there is a momentum to persist patient data in models similar to increasingly popular Blue Button CCDA.   These patient centric solutions typically use a NoSQL database such as the market leading MongoDB.   MongoDB’s document based database solution is particularly well suited for such models.

In this paper we concentrate on a Blue Button CCDA based patient data model and investigate how to design patient data schemas to use MongoDB to its full potential.  Various schemas with varying document design and indexing choices are compared using various performance metrics and general recommendations are provided.  Such recommendations should prove useful not only for patient centric solutions but for VistA as well since similar models are being used or will be used for caching VistA data.

# Data Content

Data whose storage characteristics is being investigated here is the Master Health Record which contains all historical data about patients' health.  It is based on [blue-button](https://github.com/amida-tech/blue-button) data model.  [blue-button](https://github.com/amida-tech/blue-button) it self is based on Blue Button CCDA.

## Health Data Content

Following CCDA, Master Health Record is organized in sections such as allergies and medications and storage is built based on this sectional organization.  Sections are further organized as a set of entries. Thus the unit health data storage element here is an 'entry' whose content differs from section to section.  For example for allergies the schema for an entry is
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

## Metadata

In addition the following metadata is assumed to be needed for each entry
- Patient Key: This is a key to identify the patient that the entry belongs to.
- Update History: This information includes the sources of the entry and update instances. 
- Status: This identifies the status of the entry such as active, inactive, removed.

This work looks into various ways to store this information in MongoDB from performance perspective.

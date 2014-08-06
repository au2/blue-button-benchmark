"use strict";

module.exports = exports = {
    new_patient_frequency: 1000,
    
    num_patients: 50000,
    num_entries: 3,
    num_sections: 3,

    num_review_per_year: 24,

    array_size: 3,
    string_size: 7,

    step_delay: 5000,

    getDetailReviewCount: function() {
        return 4;
    },

    getNewPatientFrequency: function() {
        return 2000;
    },

    getReviewFrequency: function() {
        return 1000;
    }
};

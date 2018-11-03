'use strict';
var AWS = require("aws-sdk");
var AlgoliaSearch = require('algoliasearch')

var sns = new AWS.SNS();
let algoliaApplicationId = process.env.ALGOLIA_APPLICATION_ID;
let algoliaAdminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
let algoliaSearchClient = AlgoliaSearch(algoliaApplicationId, algoliaAdminApiKey);
let index = algoliaSearchClient.initIndex('items_index');
index.setSettings({
  'attributesForFaceting': ['Name', 'Description']
});


exports.handler = (event, context, callback) => {

    event.Records.forEach((record) => {
        if (record.eventName == 'INSERT') {
            addItem(record.dynamodb)
        }
        else if (record.eventName == 'MODIFY'){
            console.log("Updated")
        }
        else if (record.eventName == 'REMOVE') {
            console.log("Deleted")
        }
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
}; 

let addItem = (db) => {
    let latitude = (db.NewImage.Latitude) ? db.NewImage.Latitude.N : 0
    let longitude = (db.NewImage.Latitude) ? db.NewImage.Longitude.N : 0
    let objects = [{
        Id : JSON.stringify(db.Keys.Id.S),
        Name: JSON.stringify(db.NewImage.Name.S),
        Description: JSON.stringify(db.NewImage.Description.S),
        Latitude : JSON.stringify(latitude),
        Longitude : JSON.stringify(longitude),
        _geoloc : {
            lat : parseFloat(latitude),
            lng : parseFloat(longitude)
        }
    }];

    index.addObjects(objects, function(err, content) {
        console.log(content);
    });
}
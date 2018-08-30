/* Alexa Gaming Cookbook
 * 
 * Created by Austin Wilson
 * 
 * Built to help bring Alexa into games
 * 
 * Notes:
 * For sessionAttributes, use handlerInput.attributesManager.getPersistentAttributes()
 * and handlerInput.attributesManager.setPersistentAttributes(attributes)
 * 
 * Add attribute manager to simplify communication between Alexa and Unity Game
 */

var debug = false;
var AWS = null;
var SQS = null;

module.exports = {
    setDebug(bool) {
        debug = bool;
    },

    setAWS(AWSin) {
        AWS = AWSin;
        SQS = new AWS.SQS({apiVersion: '2012-11-05'});
    },

    createQueue(queueName) {
        return new Promise((resolve, reject) =>  {
            // Create promise and SNS service object
            var queue = queueName.toString();

            var params = {
                QueueName: queue,
                Attributes: {}
              };

            SQS.createQueue(params, function(err, data) {
                if (err) {
                    if(debug) console.log("Error", err);
                    reject(err);
                } else {
                    if(debug) console.log("Success", data.QueueUrl);
                    resolve(data);
                }
            });
        });
    },

    publishEventSimple(messageText, queueURL) {
        return new Promise((resolve, reject) =>  {
            // Create publish parameters
            var params = {
                MessageBody: messageText,
                QueueUrl: queueURL
            };
            
            SQS.sendMessage(params, function(err, data) {
                if (err) {
                    if(debug) console.log("Error", err);
                    reject(err);
                } else {
                    if(debug) console.log("Success", data.MessageId);
                    resolve(data);
                }
            });
        });
    },

    //ONLY SUPPORTS UP TO 1000 ENTRIES!
    listQueues() {
        return new Promise((resolve, reject) =>  {
            var params = {}

            SQS.listQueues(params, function(err, data) {
                if (err) {
                    if(debug) console.log("Error", err);
                    reject(err);
                } else {
                    if(debug) console.log("Success", data);
                    resolve(data);
                }
            });
        });
    },

    uniqueQueueGenerator() {
        var queue = this.listQueues().then((data) => {
            var queues = data.QueueUrls;
            var newQueue = this.makeId();
            if(queues) {
                queues = this.getQueueNamesFromUrls(queues);
                while(queues.includes(newQueue)) {
                    newQueue = this.makeId();
                }
            }
            if(debug) console.log(newQueue);
            return newQueue;
        }).catch((err) => {
            return err;
        });
        return queue;
    },

    makeId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },

    getQueueNamesFromUrls(urlArray) {
        var nameArray = [];
        for(var element in urlArray) {
            var workingUrl = urlArray[element];
            var locationOfBreak = workingUrl.lastIndexOf("/");
            nameArray[element] = urlArray[element].substring(locationOfBreak + 1);
        }
        return nameArray;
    }
}
var expect = require('chai').expect;
var webdriver = require('selenium-webdriver');
var username = process.env.SAUCE_USERNAME;
var accessKey = process.env.SAUCE_ACCESS_KEY;
var tunnel_identifier = process.env.TRAVIS_JOB_NUMBER;
var hub_url = "http://" + username + ":" + accessKey + "@ondemand.saucelabs.com:4445/wd/hub";
//var hub_url = 'http://xhuang62:3bbbe590-919b-4bb0-a209-849d8af84776@localhost:4445/wd/hub';
console.log(hub_url);
/*var client = require('webdriverjs').remote({
    port: 4445,
   desiredCapabilities: {
       'browserName': 'chrome',
       'platform': 'Windows XP',
       'version': '43.0',
       'tunnelIdentifier': tunnel_identifier
   },
    logLevel: 'silent',
   
});
client.init();

client.url('http://localhost:3000');*/
var client = new webdriver.Builder().
  withCapabilities({
    'browserName': 'chrome',
    'platform': 'Windows XP',
    'version': '43.0',
    'username': username,
    'accessKey': accessKey,
    'tunnelIdentifier': tunnel_identifier
  }).
  usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
  build();
client.get('http://localhost:3000');

describe('simple test', function(){
    before(function(done) {
        client.init().url('http://localhost:3000', done);
    });
    describe('naive equal test', function(){
      it('1 equals to 1', function(done){
          var foo = 1;
          expect(foo).to.equal(1); 
          done();
        });  
    });
    describe('Check homepage', function(){
        it('should see the correct title', function(done) {
            client.getTitle(function(err, title){
                expect(title).to.have.string('Visualize');
                done();
            });
        });
    });
    
    after(function(done) {
        client.end();
        done();
    });
});
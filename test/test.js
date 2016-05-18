var expect = require('chai').expect;

var username = process.env.SAUCE_USERNAME;
var access_key = process.env.SAUCE_ACCESS_KEY;
var tunnel_identifier = process.env.TRAVIS_JOB_NUMBER;
var hub_url = "http://"+username+":"+access_key+"localhost:3000";
var client = require('webdriverjs').remote({
   desiredCapabilities: {
        browserName: 'phantomjs',
        tunnelIdentifier: tunnel_identifier,
   },
    logLevel: 'silent',
    commandExecutor: hub_url
});
client.init();

client.url('http://localhost:3000');
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
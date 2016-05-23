
//const webdriverio = require('webdriverio');
//const chai = require('chai');

//var chaiAsPromised = require('chai-as-promised');
//chai.Should();
/*chai.use(chaiAsPromised);
chaiAsPromised.transferPromiseness = client.transferPromiseness;*/
//var expect = chai.expect;
/*var options = {
   desiredCapabilities: {
       browserName: 'phantomjs',
       loggingPrefs: {
          'driver': 'INFO',
          'browser': 'INFO'
        }
   },
   logLevel: 'result'
};*/
//var client = webdriverio.remote(options);


describe('simple test', function(){
    before(function() {
        
        browser
            //.init()
            .url('http://localhost:4000');
    });
    describe('Check homepage when first loaded', function(){
        it('should see the correct title', function() {
            var title = browser.getTitle();
            expect(title).to.equal('Visualize');
           
        });
        it('should have map with the size same as viewport', function(done){
            var viewportHeight = browser.getViewportSize('height')+"px";
            var viewportWidth = browser.getViewportSize('width')+"px";
            var mapWidth = browser.getCssProperty('#map', 'width').value;
            var mapHeight = browser.getCssProperty('#map', 'height').value;
            expect(mapWidth).to.equal(viewportWidth);
            expect(mapHeight).to.equal(viewportHeight);
        })
        it('should have list hidden', function(done){
            var judge= browser.isExisting('#map div');
            console.log(judge);
            browser.pause(100000);
            done();
                /*.element('#notifications').then(function(res){
                    console.log(res.value);
                })
                .log('browser').then(function(msg) {
                    console.log(msg);
                    // under phantomjs, it shows correctly
                    // under chrome it shows null log
                })
                .call(done);*/
            
        });
        
    });
   after(function(done) {
        browser
            //.end()
            .call(done);
    });
});
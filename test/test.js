
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
            .url('http://localhost:4000');
    });
    describe('Check homepage when first loaded', function(){
        it('should see the correct title', function() {
            var title = browser.getTitle();
            expect(title).to.equal('Visualize');
           
        });
        it('should have map with the size same as viewport', function(){
            var viewportHeight = browser.getViewportSize('height')+"px";
            var viewportWidth = browser.getViewportSize('width')+"px";
            var mapWidth = browser.getCssProperty('#map', 'width').value;
            var mapHeight = browser.getCssProperty('#map', 'height').value;
            expect(mapWidth).to.equal(viewportWidth);
            expect(mapHeight).to.equal(viewportHeight);
        })
        it('should have list hidden', function(){
                expect(browser.isExisting('#map .ol-viewport')).to.equal(true);
                expect(browser.isExisting('#map .ol-viewport .layer-list')).to.equal(true);
                expect(browser.getCssProperty('.layer-list', 'width').value).to.equal('0px');
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
    describe('should have layers button work noramally', function(){
        it('should have "layer" in text', function(){
            
        });
        it('should span the list when click', function(){
            
        });
        it('should have list hidden when click again', function(){
            
        });
    });
    describe('should deal with different cases about source loading', function(){
        //try to explore as much cases as possible
        describe('should catch error when invalid source file url included', function(){
            
        });
        describe('should catch error when invalid json file included', function(){
            
        });
        describe('should catch error when source file data does not pass validity test', function(){
            
        });
        describe('should catch error when invalid config string included', function(){
            
        });
        describe('should catch err when config string contains invalid data', function(){
            
        });
        describe('should catch error when invalid extent string included', function(){
            
        });
        describe('should catch error when extent string contains invalid data', function(){
            
        });
    });
    
   after(function(done) {
        browser
            .call(done);
    });
});
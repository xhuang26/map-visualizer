var expect = require('chai').expect;
var username = process.env.SAUCE_USERNAME;
var webdriverio = require('webdriverio');
var options = {
   desiredCapabilities: {
       browserName: 'phantomjs'
   }
};
var client = webdriverio.remote(options);
//client.init();

//client.url('http://localhost:4000');


describe('simple test', function(){
    before(function(done) {
        client
            .init()
            .url('http://localhost:4000')
            .call(done);
    });
    describe('Check homepage', function(){
        it('should see the correct title', function(done) {
            client
                .getTitle(function(err, title){
                    if(err)
                        throw err;
                    expect(title).to.have.string('Visualize');
                 })
                .call(done);
           
        });
        it('should have body', function(done){
            client
                .element('body', function(err, res){
                    if(err)
                        throw err;
                 })
                .call(done);
           
        });
        it('should have map with the size same as viewport', function(done){
           var viewportHeight = 0;
           var viewportWidth = 0;
           client
                .element('#map', function(err, res){
                    if(err)
                        throw err;
                })
                .getViewportSize('width', function(err, width){
                    viewportWidth = width;
                })
                .getViewportSize('height', function(err, height){
                    viewportHeight = height;
                })
                .getCssProperty('#map', 'width', function(err, width){
                    if(err)
                        throw err;
                    console.log(viewportWidth);
                    expect(width).to.equal(viewportWidth);
                })  
                .getCssProperty('#map', 'height', function(err, height){
                    if(err)
                        throw err;
                    console.log(viewportHeight);
                    expect(height).to.equal(viewportHeight);
                })
                .call(done);
        });
    });
    after(function(done) {
        client
            .end()
            .call(done);
    });
});
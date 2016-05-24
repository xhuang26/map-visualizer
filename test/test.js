describe('simple test', function(){
    before('set up url', function(){
        console.log("set url")
        browser.url('/');
    });
    describe('Check homepage when first loaded', function(){
        
        it('should see the correct title', function() {
            
            var title = browser.getTitle();
            expect(title).to.equal('Visualize');
           
        });
        it('should have map with the size same as viewport', function(){
            var viewportHeight = browser.getViewportSize('height');
            var viewportWidth = browser.getViewportSize('width');
            expect(browser.getElementSize('#map', 'width')).to.equal(viewportWidth);
            expect(browser.getElementSize('#map', 'height')).to.equal(viewportHeight);
        });
        it('should have list hidden', function(){
            expect(browser.isExisting('#map .ol-viewport')).to.equal(true);
            expect(browser.isExisting('#map .ol-viewport .layer-list')).to.equal(true);
            expect(browser.getCssProperty('.layer-list', 'width').value).to.equal('0px');
        });
        it('should notifying user when no source url available', function(){  
            expect(browser.isExisting('#notifications')).to.equal(true); 
            expect(browser.getText('#notifications span:nth-Child(1)')).to.equal(''); 
            expect(browser.getText('#notifications span:nth-Child(2)')).to.equal('No source url available.'); 
            browser.notificationCheck('/','', 'No source url available.');
        });
        
    });
    describe('should have layers button work noramally', function(){
        
        var button = '.layer-list__toggle button';
        it('should have "layer" in text', function(){
            expect(browser.getText(button)).to.equal('layers');
        });
        it('should span the list when click', function(){
            browser.click(button);
            browser.waitForVisible('#map .layer-list--expanded', 5000);
            browser.pause(1000);
            expect(browser.getElementSize('.layer-list', 'width')).to.equal(300);
            
            
        });
        it('should have list hidden when click again', function(){
            browser.click(button);
            browser.waitForVisible('#map .layer-list--expanded', 5000, true);
            browser.pause(1000);
            expect(browser.getElementSize('.layer-list', 'width')).to.equal(0);
        });
    });
});
describe('source loading', function(){
    describe('source file', function(){
        //try to explore as much cases as possible
        it('should notify when no source file url included', function(done){
            var location_hash = "/#source=";
            browser.notificationCheck(location_hash,'#source=','No source url available.');
            browser.waitELementDisappeared('.layer-list__body .layerlist__item');
        });
        describe('file data', function(){
            it('should catch error when invalid json file format included', function(){
                var location_hash="/#source=https://raw.githubusercontent.com/Zodiase/map-visualizer/gh-pages/sample-source/invalid-json.json";
                browser.notificationCheck(location_hash,'#source=https://raw.githubusercontent.com/Zodiase/map-visualizer/gh-pages/sample-source/invalid-json.json','Downloading source file...');
                browser.waitELementDisappeared('.layer-list__body .layerlist__item');
            });
            it('should give correct data layer list when include a right format json file', function(){
                
            });
        });
    });
    describe('config string', function(){
        describe('opacity test', function(){
            /*it('should change config string when opacity silder changed by user', function(){
                var location_hash = "/#source=https://raw.githubusercontent.com/Zodiase/map-visualizer/gh-pages/sample-source/huc6.json";
                browser.url(location_hash);
                browser.pause(10000);
                browser.click('.layer-list__toggle button');
                console.log('get here');
                var items = browser.elements('.layer-list__item');
                console.log(items.value);
                items.value.forEach(function(item, index){
                    console.log("index: "+ index);
                    var curr_ind = index+1;
                    var curr_row = '.layer-list__item:nth-child('+curr_ind+')';
                    var curr_buttom = curr_row+' .layer-list__item__action-opacity';
                    expect(browser.isExisting(curr_buttom)).to.equal(true);
                    var slider = curr_row+ ' .layer-list__item-row__input';
                    expect(browser.isExisting(slider)).to.equal(true);
                    browser.click(curr_buttom);
                    browser.slideAndVerify(slider, index);
                });
                browser.pause(10000);
                
                
            });*/
            it('should have slider changed when config string set to value between 0 to 1 in url', function(){
                
            });
            it('should have slider changed to 1 when config string set to value larger than 1 in url', function(){
                
            });
            it('should have slider changed to 0 when config string set to value smaller than 0 in url', function(){
                
            });
            it('should change opacity of layer object when config string is changed in url', function(){
               
            });
        });
        describe('layer order test', function(){
            
        });
        describe('visible test', function(){
            
        });
    });
    describe('extent string', function(){
       it('should catch error when invalid extent string included', function(){
            
        });
        it('should catch error when extent string contains invalid data', function(){
            
        });
    });
    
   after(function(done) {
        browser
            .call(done);
    });
});
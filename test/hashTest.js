var expect = require('chai').expect;
describe('parseHash', function(){
    it("should return key-value paired parse when in right format", function(){
        var hash = '#source=https://raw.githubusercontent.com/xhuang26/map-visualizer/gh-pages/sample-tiled-wms-layer.json';
        var parse = parsehash(hash);
        expect(parse).to.be.a('object');
        expect(parse).to.have.length(1);
        expect(parse).to.have.property('source');
        var value_source = parse['source'];
        expect(value).to.be.a('string');
        expect(value).to.equal('https%3A%2F%2Fraw.githubusercontent.com%2Fxhuang26%2Fmap-visualizer%2Fgh-pages%2Fsample-tiled-wms-layer.json');
        
    });
    it("should assign true to the value of parse when no equal sign", function(){
        var hash = "#source";
        var parse = parsehash(hash);
        expect(parse).to.be.a('object');
        expect(parse).to.have.length(1);
        expect(parse).to.have.property('source');
        var value_source = parse['source'];
        expect(value).to.equal(true);
    });
});

describe('buildHash', function(){
    
});